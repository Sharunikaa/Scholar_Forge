# backend/agents/planner.py
"""
Planner Agent: Decomposes the research question into sub-questions.

This is the entry point to the pipeline. Takes a single research question
and breaks it down into 3-5 specific, searchable sub-questions with keywords.
"""

import json
import uuid
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from backend.graph.state import AgentState, SubQuestion
from backend.config import GROQ_API_KEY, PLANNER_MODEL


llm = ChatGroq(api_key=GROQ_API_KEY, model=PLANNER_MODEL, temperature=0.1)

PLANNER_SYSTEM = """You are a research planning expert. Given a research question,
decompose it into 3-5 specific, searchable sub-questions.

Return ONLY valid JSON in this exact format:
{
  "sub_questions": [
    {
      "id": "sq_1",
      "question": "specific sub-question text",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "search_intent": "what kind of sources would best answer this"
    }
  ]
}

Rules:
- Each sub-question must be independently searchable
- Keywords should include both broad and specific terms
- search_intent should be one of: "empirical_research", "policy_document", "review_paper", "news_report", "technical_paper"
- Do not include any text outside the JSON block"""


def planner_node(state: AgentState) -> AgentState:
    """Plan node: decompose query into sub-questions."""
    
    event = {
        "agent": "planner",
        "status": "running",
        "message": "Decomposing research question...",
        "timestamp": None
    }
    
    try:
        response = llm.invoke([
            SystemMessage(content=PLANNER_SYSTEM),
            HumanMessage(content=f"Research question: {state['raw_query']}")
        ])
        
        try:
            # Try to parse JSON from response
            content = response.content.strip()
            # Try to extract JSON if response includes extra text
            if "{" in content and "}" in content:
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                content = content[json_start:json_end]
            
            data = json.loads(content)
            sub_questions = data["sub_questions"]
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # Fallback: treat whole query as one sub-question
            print(f"⚠️ Planner JSON parse failed: {e}. Using fallback.")
            sub_questions = [{
                "id": "sq_1",
                "question": state["raw_query"],
                "keywords": state["raw_query"].split()[:5],
                "search_intent": "empirical_research"
            }]
        
        event["status"] = "done"
        event["result"] = f"Created {len(sub_questions)} sub-questions"
        
    except Exception as e:
        print(f"❌ Planner error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
        sub_questions = [{
            "id": "sq_1",
            "question": state["raw_query"],
            "keywords": state["raw_query"].split()[:5],
            "search_intent": "empirical_research"
        }]
    
    return {
        "sub_questions": sub_questions,
        "trace_events": [event]
    }
