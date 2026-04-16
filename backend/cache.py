# backend/cache.py
"""
Simple Query Cache: Store research results to avoid re-running the pipeline.

Caches final reports by query hash. If the same question is asked again,
returns the cached result instantly instead of running all agents.
"""

import json
import hashlib
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

CACHE_DIR = Path(__file__).parent / ".cache"
CACHE_DIR.mkdir(exist_ok=True)


def get_query_hash(query: str) -> str:
    """Generate hash of query for cache key."""
    return hashlib.md5(query.lower().strip().encode()).hexdigest()


def get_cache_path(query: str) -> Path:
    """Get cache file path for a query."""
    query_hash = get_query_hash(query)
    return CACHE_DIR / f"{query_hash}.json"


def get_cached_result(query: str) -> Optional[Dict[str, Any]]:
    """
    Check if query result is in cache.
    
    Args:
        query: The research question
        
    Returns:
        Cached result dict or None if not found
    """
    cache_path = get_cache_path(query)
    
    if not cache_path.exists():
        return None
    
    try:
        with open(cache_path, "r") as f:
            data = json.load(f)
        print(f"✨ Found cached result (saved {data['cached_at']})")
        return data
    except (json.JSONDecodeError, KeyError):
        # Cache corrupted, delete it
        cache_path.unlink()
        return None


def save_cached_result(query: str, result: Dict[str, Any]) -> None:
    """
    Save research result to cache.
    
    Args:
        query: The research question
        result: The final report and metadata to cache
    """
    cache_path = get_cache_path(query)
    
    cache_data = {
        "query": query,
        "cached_at": datetime.now().isoformat(),
        "final_report_markdown": result.get("final_report_markdown", ""),
        "citations": result.get("citations", []),
        "sub_questions": result.get("sub_questions", []),
        "word_count": len(result.get("final_report_markdown", "").split()),
        "citation_count": len(result.get("citations", []))
    }
    
    try:
        with open(cache_path, "w") as f:
            json.dump(cache_data, f, indent=2)
        print(f"💾 Cached result for future use")
    except Exception as e:
        print(f"⚠️ Failed to cache result: {e}")


def clear_cache() -> None:
    """Clear all cached results."""
    import shutil
    if CACHE_DIR.exists():
        shutil.rmtree(CACHE_DIR)
        CACHE_DIR.mkdir(exist_ok=True)
    print("🗑️  Cache cleared")


def list_cached_queries() -> list:
    """List all cached queries."""
    cached = []
    for cache_file in CACHE_DIR.glob("*.json"):
        try:
            with open(cache_file, "r") as f:
                data = json.load(f)
            cached.append({
                "query": data.get("query", "unknown"),
                "cached_at": data.get("cached_at", "unknown"),
                "word_count": data.get("word_count", 0),
                "citations": data.get("citation_count", 0)
            })
        except:
            pass
    return cached
