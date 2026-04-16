# backend/db/repositories/query_repository.py
"""
Query Repository: CRUD operations for research queries.
"""

import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.db.models import Query, QueryStatus
from backend.db.repositories.base_repository import BaseRepository


class QueryRepository(BaseRepository):
    """Repository for query data access."""
    
    model_class = Query
    
    def __init__(self, db: Any):
        super().__init__(db, "queries")
    
    @staticmethod
    def hash_query(question: str) -> str:
        """Generate hash of query for caching."""
        return hashlib.md5(question.lower().strip().encode()).hexdigest()
    
    def create_query(
        self,
        session_id: str,
        question: str,
        language: str = "en",
        citation_style: str = "apa"
    ) -> str:
        """
        Create a new query.
        
        Args:
            session_id: Session ID
            question: Research question
            language: Language code
            citation_style: Citation style (apa, mla, ieee)
            
        Returns:
            Query ID
        """
        query = Query(
            session_id=session_id,
            question=question,
            query_hash=self.hash_query(question),
            language=language,
            citation_style=citation_style
        )
        return self.create(query)
    
    def get_by_session(self, session_id: str, skip: int = 0, limit: int = 20) -> List[Query]:
        """
        Get all queries for a session.
        
        Args:
            session_id: Session ID
            skip: Pagination skip
            limit: Pagination limit
            
        Returns:
            List of queries
        """
        return self.find({"session_id": session_id}, skip=skip, limit=limit)
    
    def find_by_hash(self, query_hash: str) -> Optional[Query]:
        """
        Find query by hash (for caching).
        
        Args:
            query_hash: Query hash
            
        Returns:
            Query with matching hash or None
        """
        return self.find_one({"query_hash": query_hash})
    
    def start_processing(self, query_id: str) -> bool:
        """
        Mark query as processing.
        
        Args:
            query_id: Query ID
            
        Returns:
            True if updated
        """
        return self.update(
            query_id,
            {
                "status": QueryStatus.PROCESSING,
                "started_at": datetime.utcnow(),
                "progress": 10
            }
        )
    
    def update_progress(self, query_id: str, progress: int, trace_events: Optional[List[Dict]] = None) -> bool:
        """
        Update query progress and trace events.
        
        Args:
            query_id: Query ID
            progress: Progress percentage (0-100)
            trace_events: List of trace events
            
        Returns:
            True if updated
        """
        update_data = {"progress": progress}
        if trace_events is not None:
            update_data["trace_events"] = trace_events
        return self.update(query_id, update_data)
    
    def mark_completed(self, query_id: str, report: Dict[str, Any], trace_events: Optional[List[Dict]] = None) -> bool:
        """
        Mark query as completed with report.
        
        Args:
            query_id: Query ID
            report: Report data
            trace_events: List of trace events
            
        Returns:
            True if updated
        """
        now = datetime.utcnow()
        
        # Get query to calculate execution time
        query = self.find_one({"_id": query_id})
        execution_time = None
        if query and query.started_at:
            execution_time = (now - query.started_at).total_seconds()
        
        update_data = {
            "status": QueryStatus.COMPLETED,
            "completed_at": now,
            "execution_time_seconds": execution_time,
            "report": report,
            "progress": 100
        }
        if trace_events is not None:
            update_data["trace_events"] = trace_events
        
        return self.update(query_id, update_data)
    
    def mark_failed(self, query_id: str, error: str, trace_events: Optional[List[Dict]] = None) -> bool:
        """
        Mark query as failed.
        
        Args:
            query_id: Query ID
            error: Error message
            trace_events: List of trace events
            
        Returns:
            True if updated
        """
        update_data = {
            "status": QueryStatus.FAILED,
            "error": error,
            "completed_at": datetime.utcnow()
        }
        if trace_events is not None:
            update_data["trace_events"] = trace_events
        
        return self.update(query_id, update_data)
    
    def get_pending_queries(self, limit: int = 10) -> List[Query]:
        """
        Get pending queries for processing.
        
        Args:
            limit: Maximum queries to return
            
        Returns:
            List of pending queries
        """
        return self.find({"status": QueryStatus.PENDING}, limit=limit)
