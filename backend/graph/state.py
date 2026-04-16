# backend/graph/state.py
"""
ArXivIQ Agent State Definition
"""

from typing import TypedDict, List, Dict, Optional, Annotated
from operator import add


class SubQuestion(TypedDict):
    """A decomposed research sub-question from the planner."""
    id: str
    question: str
    keywords: List[str]
    search_intent: str


class SearchResult(TypedDict):
    """A single search result from web or arXiv."""
    title: str
    url: str
    snippet: str
    source_type: str          # "web" | "arxiv"
    arxiv_id: Optional[str]
    pdf_url: Optional[str]
    published_date: Optional[str]
    relevance_score: float


class ChunkResult(TypedDict):
    """A chunk from a PDF after text extraction and splitting."""
    content: str
    source_url: str
    paper_title: str
    chunk_id: str


class SectionSummary(TypedDict):
    """Summary of one sub-question's findings."""
    sub_question_id: str
    summary: str
    supporting_sources: List[str]   # urls
    confidence_score: float
    contradictions: List[str]


class CritiqueResult(TypedDict):
    """Critic agent's evaluation of the research quality."""
    overall_confidence: float
    section_scores: Dict[str, float]
    flagged_claims: List[str]
    missing_evidence: List[str]
    retry_needed: bool
    retry_sub_questions: List[str]


class Citation(TypedDict):
    """A formatted citation in multiple styles."""
    id: str
    title: str
    authors: List[str]
    year: str
    url: str
    source_type: str
    apa: str
    mla: str
    ieee: str


class AgentState(TypedDict):
    """
    Complete state passed through the LangGraph pipeline.
    
    Key insight: raw_search_results and trace_events use Annotated[List, add]
    because they're written to by PARALLEL nodes (web_search + arxiv_search both
    run simultaneously). The 'add' operator merges lists instead of overwriting.
    """
    
    # === Input Parameters ===
    session_id: str
    raw_query: str
    language: str                           # "en" | "ta" | "hi"
    citation_style: str                     # "apa" | "mla" | "ieee"

    # === Planner Output ===
    sub_questions: List[SubQuestion]

    # === Search Output (PARALLEL nodes merge with 'add') ===
    raw_search_results: Annotated[List[SearchResult], add]

    # === RAG Output ===
    chunks: List[ChunkResult]
    section_summaries: List[SectionSummary]

    # === Critic Output ===
    critique: Optional[CritiqueResult]
    critic_retry_count: int

    # === Writer Output ===
    final_report_markdown: str
    citations: List[Citation]

    # === Metadata & Debugging ===
    trace_events: Annotated[List[Dict], add]    # streamed to WebSocket
    error: Optional[str]
    

