# backend/db/models.py
"""
MongoDB Models: Pydantic schemas for data persistence.

Models for:
- Sessions (research sessions)
- Queries (individual research questions)
- Reports (generated research reports)
- Citations (formatted citations)
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class QueryStatus(str, Enum):
    """Query execution status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CACHED = "cached"


class Citation(BaseModel):
    """Citation model."""
    id: str
    title: str
    url: Optional[str] = None
    arxiv_id: Optional[str] = None
    authors: List[str] = []
    published_date: Optional[str] = None
    source_type: str  # "web", "arxiv", "pdf"
    
    # Citation formats
    apa: str
    mla: str
    ieee: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "1",
                "title": "Research Paper Title",
                "authors": ["Author One", "Author Two"],
                "apa": "Author, A., & Author, B. (2024)...",
                "mla": "Author, A. and Author, B. \"Research Paper Title...\"",
                "ieee": "[1] A. Author and B. Author, \"Research Paper Title...\""
            }
        }
    )


class SubQuestion(BaseModel):
    """Sub-question from research decomposition."""
    id: str
    question: str
    keywords: List[str]
    search_intent: str


class CritiqueResult(BaseModel):
    """Critique evaluation result."""
    overall_confidence: float = Field(ge=0.0, le=1.0)
    section_scores: Dict[str, float]
    flagged_claims: List[str]
    missing_evidence: List[str]
    retry_needed: bool
    retry_sub_questions: List[str]


class Report(BaseModel):
    """Research report model."""
    markdown: str
    word_count: int
    sub_questions: List[SubQuestion]
    citations: List[Citation]
    confidence_score: float = Field(ge=0.0, le=1.0)
    critique: Optional[CritiqueResult] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class Query(BaseModel):
    """Research query model."""
    id: str = Field(default_factory=lambda: str(datetime.utcnow().timestamp()))
    session_id: str
    question: str
    query_hash: str  # Hash for caching
    language: str = "en"
    citation_style: str = "apa"
    
    status: QueryStatus = QueryStatus.PENDING
    progress: int = Field(default=0, ge=0, le=100)  # Completion %
    
    report: Optional[Report] = None
    error: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_time_seconds: Optional[float] = None
    
    # Trace events for debugging
    trace_events: List[Dict[str, Any]] = []


class Session(BaseModel):
    """Research session model."""
    id: str = Field(default_factory=lambda: str(datetime.utcnow().timestamp()))
    user_id: str
    name: str
    description: Optional[str] = None
    
    query_ids: List[str] = []
    total_queries: int = 0
    completed_queries: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    metadata: Dict[str, Any] = {}


# MongoDB document models (with _id)
class SessionDocument(BaseModel):
    """Session as stored in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id", validation_alias="_id")
    user_id: str
    name: str
    description: Optional[str] = None
    query_ids: List[str] = []
    total_queries: int = 0
    completed_queries: int = 0
    created_at: str = ""
    updated_at: str = ""
    metadata: Dict[str, Any] = {}
    
    model_config = ConfigDict(populate_by_name=True)


class QueryDocument(BaseModel):
    """Query as stored in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id", validation_alias="_id")
    session_id: str
    question: str
    query_hash: str
    language: str = "en"
    citation_style: str = "apa"
    status: str = "pending"
    progress: int = 0
    report: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str = ""
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    execution_time_seconds: Optional[float] = None
    trace_events: List[Dict[str, Any]] = []
    
    model_config = ConfigDict(populate_by_name=True)
