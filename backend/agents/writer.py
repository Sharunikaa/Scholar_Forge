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


llm = ChatGroq(api_key=GROQ_API_KEY_1, model=WRITER_MODEL, temperature=0.5, max_tokens=10000)

def generate_writer_prompt(word_count: int, num_headings: int) -> str:
    """Generate dynamic WRITER_SYSTEM prompt based on word_count and num_headings.
    
    Creates EXACTLY num_headings main sections with detailed content.
    """
    words_per_heading = max(400, word_count // num_headings)
    
    # Determine content strategy
    if word_count >= 4000:
        content_strategy = "ULTRA-COMPREHENSIVE: Write extensive paragraphs with detailed explanations, multiple examples, statistical data, and thorough analysis for EACH section."
    elif word_count >= 2500:
        content_strategy = "COMPREHENSIVE: Write substantial multi-paragraph sections with detailed explanations and supporting evidence."
    elif word_count >= 1500:
        content_strategy = "DETAILED: Write multiple paragraphs per section with clear explanations and context."
    else:
        content_strategy = "BALANCED: Write clear, well-developed sections with adequate supporting detail."
    
    # Build the exact section structure based on num_headings
    sections = []
    
    if num_headings == 10:
        sections = [
            (1, "Executive Summary", "Comprehensive overview of the entire research and key findings", min(300, words_per_heading)),
            (2, "Background & Context", "Historical background, problem statement, and context for the research", min(300, words_per_heading)),
            (3, "Literature Review", "Review of related work and existing research in the field", min(300, words_per_heading)),
            (4, "Methodology & Approach", "Research methodology, data sources, and analytical approaches used", min(300, words_per_heading)),
            (5, "Key Findings - Part 1", "Primary findings addressing the first research questions with detailed analysis", int(words_per_heading * 1.2)),
            (6, "Key Findings - Part 2", "Secondary findings and additional insights from the research", int(words_per_heading * 1.2)),
            (7, "Analysis & Implications", "In-depth analysis of findings, implications, and significance", min(300, words_per_heading)),
            (8, "Applications & Real-World Impact", "Practical applications and real-world relevance of the findings", min(300, words_per_heading)),
            (9, "Limitations & Conflicting Evidence", "Address contradictions, limitations, gaps in research, and future directions", min(300, words_per_heading)),
            (10, "Conclusions & Recommendations", "Summary, conclusions, and actionable recommendations", min(300, words_per_heading))
        ]
    elif num_headings == 8:
        sections = [
            (1, "Executive Summary", "Comprehensive overview of the research", min(300, words_per_heading)),
            (2, "Background & Context", "Historical background and context", min(300, words_per_heading)),
            (3, "Literature Review", "Review of related work", min(300, words_per_heading)),
            (4, "Key Findings - Part 1", "Primary research findings with detailed analysis", int(words_per_heading * 1.3)),
            (5, "Key Findings - Part 2", "Additional findings and insights", int(words_per_heading * 1.3)),
            (6, "Analysis & Implications", "In-depth analysis and significance", min(300, words_per_heading)),
            (7, "Limitations & Discussion", "Limitations, contradictions, and future directions", min(300, words_per_heading)),
            (8, "Conclusions & Recommendations", "Summary and recommendations", min(300, words_per_heading))
        ]
    elif num_headings == 6:
        sections = [
            (1, "Executive Summary", "Overview of research", min(300, words_per_heading)),
            (2, "Background & Context", "Background and motivation", min(300, words_per_heading)),
            (3, "Key Findings", "Main research findings with detailed analysis", int(words_per_heading * 1.5)),
            (4, "Analysis & Implications", "Analysis and implications", min(300, words_per_heading)),
            (5, "Limitations & Discussion", "Limitations and future work", min(300, words_per_heading)),
            (6, "Conclusions & Recommendations", "Summary and recommendations", min(300, words_per_heading))
        ]
    else:
        # Default 5-section structure
        sections = [
            (1, "Executive Summary", "Overview", min(300, words_per_heading)),
            (2, "Background & Context", "Background", min(300, words_per_heading)),
            (3, "Key Findings", "Main findings", int(words_per_heading * 1.5)),
            (4, "Analysis & Limitations", "Analysis and limitations", min(300, words_per_heading)),
            (5, "Conclusions", "Summary and recommendations", min(300, words_per_heading))
        ]
    
    # Build section structure text
    section_structure = "YOU MUST CREATE EXACTLY {} SECTIONS AS FOLLOWS:\n\n".format(num_headings)
    for num, title, description, wc in sections:
        section_structure += f"{num}. ## {title}\n   Description: {description}\n   Target: {wc} words\n\n"
    
    prompt = f"""You are an expert academic writer. Your ABSOLUTE task is to create a comprehensive, detailed report with EXACTLY {num_headings} MAIN SECTIONS.

=== CRITICAL REQUIREMENTS (DO NOT SKIP) ===

1. **YOU MUST CREATE EXACTLY {num_headings} SECTIONS** - Not 5, not fewer - exactly {num_headings} sections
2. **YOU MUST WRITE {word_count} WORDS (minimum {int(word_count * 0.85)} words)**
3. **EACH SECTION MUST BE SUBSTANTIAL** - minimum {words_per_heading} words per section
4. **Use ## for main sections** (## Section Title)
5. **Write COMPLETE paragraphs** - not bullet points, not summaries
6. **Include citations** - [1], [2], etc. for claims with evidence

=== CONTENT STRATEGY ===
{content_strategy}

DO NOT write short summaries. Write FULL, DETAILED, COMPREHENSIVE sections.
DO NOT combine sections. Create each as a SEPARATE section.
DO NOT stop writing until you reach {int(word_count * 0.85)} minimum words.

=== REQUIRED SECTIONS (EXACTLY {num_headings}) ===
{section_structure}

=== WRITING INSTRUCTIONS ===

For each section:
1. Start with ## Section Title
2. Write a detailed introduction paragraph (2-3 sentences)
3. Write MULTIPLE body paragraphs (3-5 paragraphs per section) with:
   - Complete explanations and context
   - Specific examples and evidence
   - Citations [1], [2], etc.
   - Implications and significance
4. End with a transition to the next section

Example of proper section length:
- If targeting 400 words per section, write 4-5 paragraphs of 80-100 words each
- Each paragraph should be complete and substantial
- Include specific details, not generic information

=== WORD COUNT STRATEGY ===

Total target: {word_count} words
Words per section: aim for {words_per_heading} words per section
Do not rush. Take time to develop each idea fully.

BEFORE SUBMITTING: Count your words. If below {int(word_count * 0.85)}, add more content.

Ways to expand content:
- Add more examples and case studies
- Explain the "why" and "how" of findings
- Include relevant statistics and data
- Discuss implications and applications
- Address related concepts and connections
- Provide context and background information

=== FINAL INSTRUCTIONS ===

1. Create exactly {num_headings} main sections with ## headings
2. Write at least {words_per_heading} words per section
3. Use formal academic tone throughout
4. Include citations for significant claims
5. Before sending: count words, ensure you're at least at {int(word_count * 0.85)} words
6. End with ## References section containing [CITATIONS_PLACEHOLDER]

NOW BEGIN WRITING YOUR {num_headings}-SECTION REPORT WITH {word_count} WORDS.
START NOW. DO NOT SUMMARIZE. WRITE FULL SECTIONS WITH COMPLETE PARAGRAPHS.
"""
    return prompt


def writer_node(state: AgentState) -> AgentState:
    """Writer node: generate final Markdown report with configurable word count and sections."""
    
    word_count = state.get("word_count", 1500)
    num_headings = state.get("num_headings", 5)
    
    # Log parameters for debugging
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"📝 Writer node starting - word_count: {word_count}, num_headings: {num_headings}")
    
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
        "message": f"Generating report ({word_count} words, {num_headings} sections)..."
    }
    
    try:
        writer_prompt = generate_writer_prompt(word_count, num_headings)
        logger.info(f"📝 Prompt generated. Words per section: {max(200, word_count // num_headings)}")
        
        response = llm.invoke([
            {"role": "system", "content": writer_prompt},
            {"role": "user", "content": f"Research question: {state['raw_query']}\nTarget words: {word_count}\nMain sections: {num_headings}{critique_notes}\n\n## Research Findings\n{summaries_text}"}
        ])
        
        report = response.content
        actual_words = len(report.split())
        logger.info(f"📝 Report generated. Actual words: {actual_words}, Target: {word_count}")
        
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
        actual_word_count = len(report.split())
        
        event["status"] = "done"
        event["result"] = f"Report generated (Target: {word_count} words, Actual: {actual_word_count} words, {len(citations)} citations)"
        
    except Exception as e:
        print(f"❌ Writer error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
        report = f"# Error\n\nFailed to generate report: {e}"
        citations = []
        actual_word_count = 0
    
    return {
        "final_report_markdown": report,
        "citations": citations,
        "trace_events": [event]
    }
