# backend/tools/citation_formatter.py
"""
Citation formatting utilities.

Converts search results into properly formatted citations (APA, MLA, IEEE).
"""

from backend.graph.state import Citation, SearchResult


def format_citation(result: SearchResult, citation_id: str, style: str) -> Citation:
    """
    Format a search result as a citation in the requested style.
    
    Args:
        result: SearchResult to format
        citation_id: Numeric ID for this citation
        style: "apa", "mla", or "ieee"
    
    Returns:
        Citation object with formatted strings
    """
    
    title = result.get("title", "Unknown Title")
    url = result.get("url", "")
    year = result.get("published_date", "Unknown")
    source_type = result.get("source_type", "web")
    
    # Parse authors (simplified - assume title contains author info if needed)
    authors = []
    if source_type == "arxiv":
        # arXiv papers typically have multiple authors
        authors = ["Author(s)"]
    else:
        authors = ["Unknown Author"]
    
    apa_str = f"{', '.join(authors)} ({year}). {title}. Retrieved from {url}"
    mla_str = f"{', '.join(authors)}. \"{title}.\" {year}. {url}"
    ieee_str = f"[{citation_id}] {', '.join(authors)}, \"{title},\" {year}. [Online]. Available: {url}"
    
    return {
        "id": citation_id,
        "title": title,
        "authors": authors,
        "year": str(year),
        "url": url,
        "source_type": source_type,
        "apa": apa_str,
        "mla": mla_str,
        "ieee": ieee_str
    }
