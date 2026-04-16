# backend/agents/critic.py
"""
Critic Agent: Evaluates research quality and decides if retry is needed.

This implements the Reflexion pattern - the critic evaluates the research
and decides if more searching is needed. If confidence < 0.75, it triggers
a retry loop back to web/arxiv search.
"""

import json
from langchain_groq import ChatGroq

from backend.graph.state import AgentState, CritiqueResult
from backend.config import GROQ_API_KEY, CRITIC_MODEL, CRITIC_CONFIDENCE_THRESHOLD, MAX_CRITIC_RETRIES


llm = ChatGroq(api_key=GROQ_API_KEY, model=CRITIC_MODEL, temperature=0.1)

CRITIC_SYSTEM = """You are a rigorous academic critic. Review research summaries and evaluate:
1. Factual consistency across sections
2. Whether claims are supported by evidence
3. Contradictions between sections
4. Missing evidence for important claims

Return ONLY JSON:
{
  "overall_confidence": 0.0-1.0,
  "section_scores": {"sq_1": 0.0-1.0, "sq_2": 0.0-1.0},
  "flagged_claims": ["claim that lacks evidence"],
  "missing_evidence": ["what additional evidence would strengthen this"],
  "retry_needed": true/false,
  "retry_sub_questions": ["sub-question ids that need more research"]
}

Rules:
- Be strict. Confidence should reflect actual evidence quality.
- If overall confidence < 0.75, set retry_needed to true.
- Only set retry_needed if more research would actually help.
- Include specific missing evidence so next search can target it."""


def critic_node(state: AgentState) -> AgentState:
    """Critic node: evaluate research quality and decide if retry is needed."""
    
    summaries_text = "\n\n".join(
        f"Section [{s['sub_question_id']}]:\n{s['summary']}\n"
        f"Confidence: {s['confidence_score']}\n"
        f"Contradictions: {', '.join(s['contradictions']) or 'None'}"
        for s in state["section_summaries"]
    )
    
    event = {
        "agent": "critic",
        "status": "running",
        "message": "Evaluating research quality..."
    }
    
    try:
        response = llm.invoke([
            {"role": "system", "content": CRITIC_SYSTEM},
            {"role": "user", "content": f"Original question: {state['raw_query']}\n\nSections to review:\n{summaries_text}"}
        ])
        
        try:
            content = response.content.strip()
            # Try to extract JSON if response includes extra text
            if "{" in content and "}" in content:
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                content = content[json_start:json_end]
            
            data = json.loads(content)
            critique: CritiqueResult = {
                "overall_confidence": float(data.get("overall_confidence", 0.7)),
                "section_scores": data.get("section_scores", {}),
                "flagged_claims": data.get("flagged_claims", []),
                "missing_evidence": data.get("missing_evidence", []),
                "retry_needed": data.get("retry_needed", False),
                "retry_sub_questions": data.get("retry_sub_questions", [])
            }
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"⚠️ Critic JSON parse failed: {e}")
            critique = {
                "overall_confidence": 0.7,
                "section_scores": {},
                "flagged_claims": [],
                "missing_evidence": [],
                "retry_needed": False,
                "retry_sub_questions": []
            }
        
        retry_count = state.get("critic_retry_count", 0)
        
        # Force stop retry if max retries hit
        if retry_count >= MAX_CRITIC_RETRIES:
            critique["retry_needed"] = False
            print(f"⚠️ Max retry attempts ({MAX_CRITIC_RETRIES}) reached. Proceeding to writer.")
        
        event["status"] = "done"
        event["result"] = f"Confidence: {critique['overall_confidence']:.0%} | Retry: {critique['retry_needed']}"
        
    except Exception as e:
        print(f"❌ Critic error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
        critique = {
            "overall_confidence": 0.7,
            "section_scores": {},
            "flagged_claims": [],
            "missing_evidence": [],
            "retry_needed": False,
            "retry_sub_questions": []
        }
    
    return {
        "critique": critique,
        "critic_retry_count": state.get("critic_retry_count", 0) + (1 if critique["retry_needed"] else 0),
        "trace_events": [event]
    }


def should_retry(state: AgentState) -> str:
    """
    LangGraph conditional edge: determines next node after critic.
    
    Returns:
        "search" - loop back to search coordinators (web + arxiv)
        "writer" - proceed to report generation
    """
    if state["critique"]["retry_needed"] and state["critic_retry_count"] < MAX_CRITIC_RETRIES:
        print(f"🔄 Retry needed. Confidence: {state['critique']['overall_confidence']:.0%}")
        return "search"         # loop back
    return "writer"             # proceed to writing
