# backend/agents/arxiv_search.py
"""
arXiv Search Agent: Searches academic papers on arXiv.

Searches for relevant research papers for each sub-question.
Results are merged across parallel nodes via Annotated[List, add].
"""

import arxiv
from backend.graph.state import AgentState, SearchResult
from backend.config import MAX_SEARCH_RESULTS


def arxiv_search_node(state: AgentState) -> AgentState:
    """arXiv search node: find academic papers."""
    
    results: list[SearchResult] = []
    event = {
        "agent": "arxiv_search",
        "status": "running",
        "message": f"Searching arXiv for {len(state['sub_questions'])} sub-questions..."
    }
    
    try:
        client = arxiv.Client()
        
        for sq in state["sub_questions"]:
            keywords = " AND ".join(sq["keywords"][:3])
            try:
                search = arxiv.Search(
                    query=keywords,
                    max_results=3,
                    sort_by=arxiv.SortCriterion.Relevance
                )
                
                for paper in client.results(search):
                    results.append({
                        "title": paper.title,
                        "url": paper.entry_id,
                        "snippet": paper.summary[:500],
                        "source_type": "arxiv",
                        "arxiv_id": paper.get_short_id(),
                        "pdf_url": paper.pdf_url,
                        "published_date": str(paper.published.year),
                        "relevance_score": 0.8    # arxiv results are high quality baseline
                    })
            except Exception as e:
                print(f"⚠️ arXiv search failed for '{keywords}': {e}")
                continue
        
        event["status"] = "done"
        event["result"] = f"Found {len(results)} arXiv papers"
        
    except Exception as e:
        print(f"❌ arXiv search agent error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
    
    return {
        "raw_search_results": results,
        "trace_events": [event]
    }
