# backend/graph/workflow.py
"""
LangGraph Workflow: Complete agent pipeline orchestration.

This wires all agents together into a directed graph:
1. Planner decomposes the query
2. Web + arXiv search run in parallel (merged via Annotated[List, add])
3. PDF ingestion processes papers
4. Summarizer creates section summaries
5. Critic evaluates quality with retry loop
6. Writer produces final report

Flow diagram:
    planner
    ↙   ↘
web   arxiv  (parallel, results merged)
    ↘   ↙
   pdf_ingestion
      ↓
   summarizer
      ↓
   critic --→ (if retry_needed) --→ web/arxiv
      ↓
   writer
      ↓
     END
"""

from langgraph.graph import StateGraph, END
from backend.graph.state import AgentState
from backend.agents.planner import planner_node
from backend.agents.web_search import web_search_node
from backend.agents.arxiv_search import arxiv_search_node
from backend.agents.pdf_ingestion import pdf_ingestion_node
from backend.agents.summarizer import summarizer_node
from backend.agents.critic import critic_node, should_retry
from backend.agents.writer import writer_node


def build_graph() -> StateGraph:
    """
    Build the complete LangGraph StateGraph.
    
    Returns:
        Compiled graph ready for ainvoke() or astream()
    """
    graph = StateGraph(AgentState)
    
    # Add all nodes
    graph.add_node("planner", planner_node)
    graph.add_node("web_search", web_search_node)
    graph.add_node("arxiv_search", arxiv_search_node)
    graph.add_node("pdf_ingestion", pdf_ingestion_node)
    graph.add_node("summarizer", summarizer_node)
    graph.add_node("critic", critic_node)
    graph.add_node("writer", writer_node)
    
    # === Entry Point ===
    graph.set_entry_point("planner")
    
    # === Stage 1: Question Decomposition ===
    # Planner → parallel search
    graph.add_edge("planner", "web_search")
    graph.add_edge("planner", "arxiv_search")
    
    # === Stage 2: Searching (parallel, then converge) ===
    # Both searches converge to pdf_ingestion
    # (LangGraph waits for both before proceeding)
    graph.add_edge("web_search", "pdf_ingestion")
    graph.add_edge("arxiv_search", "pdf_ingestion")
    
    # === Stage 3: Processing & Summarization ===
    graph.add_edge("pdf_ingestion", "summarizer")
    graph.add_edge("summarizer", "critic")
    
    # === Stage 4: Quality Control with Retry Loop ===
    # Conditional edge: critic decides next node
    graph.add_conditional_edges(
        "critic",
        should_retry,
        {
            "search": "web_search",    # retry → go back to searching
            "writer": "writer"         # pass → proceed to writing
        }
    )
    
    # === Stage 5: Report Generation & End ===
    graph.add_edge("writer", END)
    
    return graph.compile()


# Singleton compiled graph (reusable across requests)
research_graph = build_graph()


if __name__ == "__main__":
    """Quick test of graph topology."""
    print("✓ LangGraph workflow compiled successfully")
    print(f"✓ Nodes: {list(research_graph.nodes.keys())}")
