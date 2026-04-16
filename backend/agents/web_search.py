# backend/agents/web_search.py
"""
Web Search Agent: Searches the web using Tavily API.

Searches for relevant web content for each sub-question.
Results are merged across parallel nodes via Annotated[List, add].
"""

from tavily import TavilyClient
from backend.graph.state import AgentState, SearchResult
from backend.config import TAVILY_API_KEY, MAX_SEARCH_RESULTS


client = TavilyClient(api_key=TAVILY_API_KEY)


def web_search_node(state: AgentState) -> AgentState:
    """Web search node: use Tavily to search the web."""
    
    results: list[SearchResult] = []
    event = {
        "agent": "web_search",
        "status": "running",
        "message": f"Searching web for {len(state['sub_questions'])} sub-questions..."
    }
    
    try:
        for sq in state["sub_questions"]:
            query = sq["question"]
            try:
                response = client.search(
                    query=query,
                    max_results=MAX_SEARCH_RESULTS // max(len(state["sub_questions"]), 1),
                    search_depth="advanced",
                    include_raw_content=True
                )
                
                for r in response.get("results", []):
                    results.append({
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "snippet": r.get("content", ""),
                        "source_type": "web",
                        "arxiv_id": None,
                        "pdf_url": None,
                        "published_date": r.get("published_date"),
                        "relevance_score": r.get("score", 0.5)
                    })
            except Exception as e:
                print(f"⚠️ Web search failed for '{query}': {e}")
                continue
        
        event["status"] = "done"
        event["result"] = f"Found {len(results)} web results"
        
    except Exception as e:
        print(f"❌ Web search agent error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
    
    return {
        "raw_search_results": results,
        "trace_events": [event]
    }
