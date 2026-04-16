# backend/db/repositories/session_repository.py
"""
Session Repository: CRUD operations for research sessions.
"""

from typing import List, Optional, Dict, Any
from backend.db.models import Session, SessionDocument
from backend.db.repositories.base_repository import BaseRepository


class SessionRepository(BaseRepository):
    """Repository for session data access."""
    
    model_class = Session
    
    def __init__(self, db: Any):
        super().__init__(db, "sessions")
    
    def create_session(self, user_id: str, name: str, description: str = "") -> str:
        """
        Create a new session.
        
        Args:
            user_id: User ID
            name: Session name
            description: Session description
            
        Returns:
            Session ID
        """
        session = Session(
            user_id=user_id,
            name=name,
            description=description
        )
        return self.create(session)
    
    def get_user_sessions(self, user_id: str, skip: int = 0, limit: int = 10) -> List[Session]:
        """
        Get all sessions for a user.
        
        Args:
            user_id: User ID
            skip: Pagination skip
            limit: Pagination limit
            
        Returns:
            List of sessions
        """
        return self.find({"user_id": user_id}, skip=skip, limit=limit)
    
    def add_query_to_session(self, session_id: str, query_id: str) -> bool:
        """
        Add query to session's query list.
        
        Args:
            session_id: Session ID
            query_id: Query ID to add
            
        Returns:
            True if updated
        """
        result = self.collection.update_one(
            {"_id": session_id},
            {
                "$push": {"query_ids": query_id},
                "$inc": {"total_queries": 1}
            }
        )
        return result.modified_count > 0
    
    def mark_query_completed(self, session_id: str) -> bool:
        """
        Increment completed query count.
        
        Args:
            session_id: Session ID
            
        Returns:
            True if updated
        """
        result = self.collection.update_one(
            {"_id": session_id},
            {"$inc": {"completed_queries": 1}}
        )
        return result.modified_count > 0
