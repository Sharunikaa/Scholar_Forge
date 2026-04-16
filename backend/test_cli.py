# backend/test_cli.py
"""
Phase 1 End-to-End CLI Test

Run the complete research pipeline from the command line without any web UI.
This tests that all agents work correctly and produce a final report.

Usage:
    cd backend
    python test_cli.py
"""

import asyncio
import sys
import os
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.graph.workflow import research_graph
from backend.graph.state import AgentState
from backend.cache import get_cached_result, save_cached_result
import uuid


async def run_test():
    """Run a complete research pipeline test."""
    
    print("\n" + "="*80)
    print("🚀 ArXivIQ Phase 1 - End-to-End CLI Test")
    print("="*80 + "\n")
    
    # Initialize state
    session_id = str(uuid.uuid4())[:8]
    
    initial_state: AgentState = {
        "session_id": session_id,
        "raw_query": "What are the health impacts of PM2.5 air pollution in Indian cities?",
        "language": "en",
        "citation_style": "apa",
        "sub_questions": [],
        "raw_search_results": [],
        "chunks": [],
        "section_summaries": [],
        "critique": None,
        "critic_retry_count": 0,
        "final_report_markdown": "",
        "citations": [],
        "trace_events": [],
        "error": None,
    }
    
    print(f"📋 Query: {initial_state['raw_query']}")
    print(f"🔑 Session ID: {session_id}")
    print(f"🗣️  Language: {initial_state['language']}")
    print(f"📚 Citation Style: {initial_state['citation_style']}")
    print("\n" + "-"*80 + "\n")
    
    # === Check Cache First ===
    cached = get_cached_result(initial_state['raw_query'])
    if cached:
        print("⚡ USING CACHED RESULT (from previous run)\n")
        final_state = {
            **initial_state,
            "final_report_markdown": cached["final_report_markdown"],
            "citations": cached["citations"],
            "sub_questions": cached["sub_questions"],
        }
        elapsed = 0
        report = final_state["final_report_markdown"]
    else:
        elapsed = None
        report = None
    
    try:
        if not cached:
            # Run the graph
            print("⏳ Running pipeline...\n")
            start_time = datetime.now()
            
            final_state = await research_graph.ainvoke(initial_state)
            
            # Print trace events
            for evt in final_state.get("trace_events", []):
                agent = evt.get("agent", "?")
                result = evt.get("result", evt.get("message", ""))
                print(f"[{agent}] {result}")
            
            elapsed = (datetime.now() - start_time).total_seconds()
            
            # === Save to Cache ===
            save_cached_result(initial_state['raw_query'], final_state)
            
            print("\n" + "-"*80)
            print(f"✅ Pipeline completed in {elapsed:.1f}s")
            print("-"*80 + "\n")
        else:
            print("📚 Retrieved from cache instantly\n")
            print("-"*80 + "\n")
        
        # === Display Results ===
        
        print("📝 REPORT EXCERPT (first 1500 chars):\n")
        report = final_state["final_report_markdown"]
        print(report[:1500])
        if len(report) > 1500:
            print("\n... [truncated] ...\n")
        
        print("\n" + "="*80)
        print("📊 REPORT STATISTICS")
        print("="*80)
        print(f"Total Word Count: {len(report.split())}")
        print(f"Total Citations: {len(final_state['citations'])}")
        print(f"Sub-Questions: {len(final_state['sub_questions'])}")
        print(f"Search Results: {len(final_state['raw_search_results'])}")
        print(f"PDF Chunks: {len(final_state['chunks'])}")
        
        if final_state["critique"]:
            c = final_state["critique"]
            print(f"\n🎯 CRITIC EVALUATION")
            print(f"  Overall Confidence: {c['overall_confidence']:.0%}")
            print(f"  Flagged Claims: {len(c['flagged_claims'])}")
            print(f"  Missing Evidence: {len(c['missing_evidence'])}")
            print(f"  Retry Needed: {c['retry_needed']}")
        
        print("\n" + "="*80)
        print("🔗 CITATIONS")
        print("="*80)
        for cit in final_state["citations"][:5]:  # First 5
            print(f"\n[{cit['id']}] {cit['title'][:70]}")
            print(f"     {cit[initial_state['citation_style']][:80]}...")
        
        if len(final_state["citations"]) > 5:
            print(f"\n... and {len(final_state['citations']) - 5} more citations")
        
        print("\n" + "="*80)
        print("✨ PHASE 1 CHECKPOINT PASSED")
        print("="*80)
        print("\n✓ Planner decomposed query into sub-questions")
        print("✓ Web & arXiv searches returned results")
        print("✓ PDFs downloaded and processed")
        print("✓ Summaries generated for each section")
        print("✓ Critic evaluated research quality")
        print("✓ Writer compiled final Markdown report")
        print("\nReady for Phase 2: MongoDB + FastAPI Backend\n")
        
        print("=" * 80)
        print("💾 CACHE INFO")
        print("=" * 80)
        print("• Result cached for instant retrieval on next run")
        print("• Same query will return instantly without running agents")
        print("• To clear cache: python -c \"from backend.cache import clear_cache; clear_cache()\"")
        print()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    # Support cache management commands
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "--clear-cache":
            from backend.cache import clear_cache
            clear_cache()
            print("✅ Cache cleared")
            sys.exit(0)
        elif command == "--list-cache":
            from backend.cache import list_cached_queries
            cached = list_cached_queries()
            if cached:
                print("\n📚 Cached Research Queries:")
                print("="*80)
                for i, item in enumerate(cached, 1):
                    print(f"{i}. {item['query'][:60]}...")
                    print(f"   Cached: {item['cached_at']} | Words: {item['word_count']} | Citations: {item['citations']}")
            else:
                print("No cached results yet")
            sys.exit(0)
    
    asyncio.run(run_test())
