# backend/agents/writer.py
"""
Writer Agent: Compiles research into a final Markdown report.

Takes all summaries, citations, and critique results to produce
a structured, well-written academic report.
"""

import json
from langchain_groq import ChatGroq

from backend.graph.state import AgentState, Citation
from backend.config import GROQ_API_KEY_1, WRITER_MODEL
from backend.tools.citation_formatter import format_citation


llm = ChatGroq(api_key=GROQ_API_KEY_1, model=WRITER_MODEL, temperature=0.3, max_tokens=4096)

WRITER_SYSTEM = """You are an expert academic writer. Compile the research findings into a
structured, well-written report. Use clear section headings with ## markdown.

Required sections in order:
1. ## Executive Summary (2-3 paragraphs)
2. ## Background & Context
3. ## Findings (one sub-section per research sub-question)
4. ## Conflicting Evidence & Limitations
5. ## Conclusions & Recommendations

Writing rules:
- Use formal academic tone
- Each finding section must cite sources as [1], [2], etc.
- Note confidence levels where relevant
- Be comprehensive but concise (target 1500-2500 words)
- Include a ## References section at the end with placeholder [CITATIONS_PLACEHOLDER]"""


def writer_node(state: AgentState) -> AgentState:
    """Writer node: generate final Markdown report."""
    
    summaries_text = "\n\n".join(
        f"### {s['sub_question_id']}\n{s['summary']}\n"
        f"**Confidence:** {s['confidence_score']:.0%}\n"
        f"**Contradictions:** {', '.join(s['contradictions']) or 'None'}"
        for s in state["section_summaries"]
    )
    
    critique_notes = ""
    if state.get("critique"):
        c = state["critique"]
        flagged = c["flagged_claims"][:3] if c["flagged_claims"] else []
        missing = c["missing_evidence"][:2] if c["missing_evidence"] else []
        critique_notes = f"\n**Flagged Claims:** {', '.join(flagged) or 'None'}\n**Overall Confidence:** {c['overall_confidence']:.0%}\n**Missing Evidence:** {', '.join(missing) or 'None'}"
    
    event = {
        "agent": "writer",
        "status": "running",
        "message": "Generating final report..."
    }
    
    try:
        response = llm.invoke([
            {"role": "system", "content": WRITER_SYSTEM},
            {"role": "user", "content": f"Research question: {state['raw_query']}{critique_notes}\n\n## Research Findings\n{summaries_text}"}
        ])
        
        report = response.content
        
        # Build citations from search results
        citations: list[Citation] = []
        seen_urls = set()
        
        for result in state["raw_search_results"]:
            if result["url"] not in seen_urls and len(citations) < 15:
                seen_urls.add(result["url"])
                citation_id = str(len(citations) + 1)
                citations.append(format_citation(result, citation_id, state["citation_style"]))
        
        # Build reference list
        ref_list = "\n\n".join(
            f"[{c['id']}] {c[state['citation_style']]}"
            for c in citations
        )
        
        # Replace placeholder with actual citations
        if "[CITATIONS_PLACEHOLDER]" in report:
            report = report.replace("[CITATIONS_PLACEHOLDER]", ref_list)
        else:
            # If placeholder wasn't used, add citations at the end
            report += f"\n\n## References\n\n{ref_list}"
        
        # Count words
        word_count = len(report.split())
        
        event["status"] = "done"
        event["result"] = f"Report generated ({word_count} words, {len(citations)} citations)"
        
    except Exception as e:
        print(f"❌ Writer error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
        report = f"# Error\n\nFailed to generate report: {e}"
        citations = []
        word_count = 0
    
    return {
        "final_report_markdown": report,
        "citations": citations,
        "trace_events": [event]
    }
