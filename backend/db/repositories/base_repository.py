# backend/db/repositories/base_repository.py
"""
Base Repository: Generic CRUD operations for MongoDB collections.

Provides base methods: create, read, update, delete, list
(Synchronous operations with pymongo)
"""

from typing import TypeVar, Generic, List, Optional, Dict, Any
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

ModelT = TypeVar('ModelT', bound=BaseModel)


class BaseRepository(Generic[ModelT]):
    """Generic repository for MongoDB CRUD operations."""
    
    def __init__(self, db: Any, collection_name: str):
        """
        Initialize repository.
        
        Args:
            db: Pymongo database instance
            collection_name: Name of MongoDB collection
        """
        self.db = db
        self.collection: Any = db[collection_name]
    
    def create(self, document: ModelT) -> str:
        """
        Create a new document.
        
        Args:
            document: Pydantic model instance
            
        Returns:
            Document ID
        """
        doc_dict = document.model_dump(exclude_none=True)
        logger.info(f"Original document dict: {doc_dict}")
        
        # Use the document's 'id' as MongoDB's '_id' for consistency
        if "id" in doc_dict:
            doc_dict["_id"] = doc_dict.pop("id")
            logger.info(f"Converted id to _id: {doc_dict.get('_id')}")
        
        logger.info(f"Final document to insert: {doc_dict}")
        result = self.collection.insert_one(doc_dict)
        logger.info(f"Inserted document with _id: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_by_id(self, doc_id: str) -> Optional[ModelT]:
        """
        Get document by ID.
        
        Args:
            doc_id: Document ID
            
        Returns:
            Pydantic model or None
        """
        logger.info(f"Finding document with ID: {doc_id}")
        # Query by _id since we store id as _id
        result = self.collection.find_one({"_id": doc_id})
        logger.info(f"Found document: {result is not None}")
        if result:
            logger.info(f"Converting document to model...")
            model = self._to_model(result)
            logger.info(f"Converted model successfully: {model is not None}")
            return model
        logger.info(f"No document found for ID: {doc_id}")
        return None
    
    def get_all(self, skip: int = 0, limit: int = 10) -> List[ModelT]:
        """
        Get all documents with pagination.
        
        Args:
            skip: Number of documents to skip
            limit: Number of documents to return
            
        Returns:
            List of Pydantic models
        """
        cursor = self.collection.find().skip(skip).limit(limit)
        results = []
        for doc in cursor:
            results.append(self._to_model(doc))
        return results
    
    def find(self, query: Dict[str, Any], skip: int = 0, limit: int = 10) -> List[ModelT]:
        """
        Find documents matching query.
        
        Args:
            query: MongoDB query filter
            skip: Pagination skip
            limit: Pagination limit
            
        Returns:
            List of matching documents
        """
        cursor = self.collection.find(query).skip(skip).limit(limit)
        results = []
        for doc in cursor:
            results.append(self._to_model(doc))
        return results
    
    def find_one(self, query: Dict[str, Any]) -> Optional[ModelT]:
        """
        Find first document matching query.
        
        Args:
            query: MongoDB query filter
            
        Returns:
            Pydantic model or None
        """
        result = self.collection.find_one(query)
        return self._to_model(result) if result else None
    
    def update(self, doc_id: str, update_data: Dict[str, Any]) -> bool:
        """
        Update a document.
        
        Args:
            doc_id: Document ID
            update_data: Fields to update
            
        Returns:
            True if updated
        """
        result = self.collection.update_one(
            {"_id": doc_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    def delete(self, doc_id: str) -> bool:
        """
        Delete a document.
        
        Args:
            doc_id: Document ID
            
        Returns:
            True if deleted
        """
        result = self.collection.delete_one({"_id": doc_id})
        return result.deleted_count > 0
    
    def count(self, query: Optional[Dict[str, Any]] = None) -> int:
        """
        Count documents.
        
        Args:
            query: Optional filter query
            
        Returns:
            Number of documents
        """
        if query is None:
            query = {}
        return self.collection.count_documents(query)
    
    def _to_model(self, doc: Dict[str, Any]) -> ModelT:
        """Convert MongoDB document to Pydantic model."""
        if not doc:
            return None
        
        # Convert MongoDB's _id back to id field
        if "_id" in doc and "id" not in doc:
            doc["id"] = str(doc["_id"])
        
        try:
            logger.info(f"Converting doc to model with keys: {doc.keys()}")
            model = self.model_class(**doc)
            logger.info(f"Successfully created model: {model}")
            return model
        except Exception as e:
            # If direct instantiation fails, try partial matching
            logger.error(f"Failed to convert doc to model: {e}. Doc keys: {doc.keys()}")
            return None
