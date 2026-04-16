# backend/agents/summarizer.py
"""
Summarizer Agent: Produces summaries for each sub-question.

Uses semantic search (ChromaDB) to retrieve relevant PDF chunks,
combines with web snippets, and generates factual summaries.
"""

import json
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings

# Try to import Chroma, but allow graceful failure for version compatibility
try:
    from langchain_chroma import Chroma
    CHROMA_AVAILABLE = True
except ImportError:
    Chroma = None
    CHROMA_AVAILABLE = False
    print("⚠️ ChromaDB not available - Semantic search disabled")

from backend.graph.state import AgentState, SectionSummary
from backend.config import GROQ_API_KEY, WRITER_MODEL


llm = ChatGroq(api_key=GROQ_API_KEY, model=WRITER_MODEL, temperature=0.2)

embeddings_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

SUMMARIZER_SYSTEM = """You are a research summarizer. Given a sub-question and relevant text chunks,
produce a concise, factual summary that directly answers the sub-question.

Return JSON only:
{
  "summary": "your summary text (2-4 paragraphs)",
  "key_points": ["point 1", "point 2"],
  "confidence_score": 0.0-1.0,
  "contradictions": ["any conflicting claims found"]
}

Rules:
- Be factual. Cite evidence. 
- Note contradictions honestly.
- Confidence score reflects how well sources answered the question (0=missing, 1=comprehensive)
- contradictions should list actual conflicting claims, or empty list if none"""


def summarizer_node(state: AgentState) -> AgentState:
    """Summarizer node: generate summaries for each sub-question."""
    
    summaries: list[SectionSummary] = []
    collection_name = f"session_{state['session_id']}"
    
    event = {
        "agent": "summarizer",
        "status": "running",
        "message": f"Summarizing {len(state['sub_questions'])} sections..."
    }
    
    try:
        for sq in state["sub_questions"]:
            # Retrieve relevant chunks from ChromaDB using semantic search
            relevant_text = ""
            if collection_name and CHROMA_AVAILABLE:
                try:
                    vectorstore = Chroma(
                        collection_name=collection_name,
                        embedding_function=embeddings_model
                    )
                    docs = vectorstore.similarity_search(sq["question"], k=5)
                    relevant_text = "\n\n---\n\n".join(d.page_content for d in docs)
                    print(f"✓ Retrieved {len(docs)} relevant chunks for {sq['id']}")
                except Exception as e:
                    print(f"⚠️ ChromaDB retrieval failed for {sq['id']}: {e}")
            elif collection_name:
                print(f"ℹ️ Skipping ChromaDB search - ChromaDB not available for {sq['id']}")
            
            # Also use web snippets from search results
            web_snippets = "\n".join(
                r["snippet"] for r in state["raw_search_results"]
                if r["source_type"] == "web"
            )[:2000]
            
            context = f"PDF EXTRACTS:\n{relevant_text}\n\nWEB SNIPPETS:\n{web_snippets}"
            
            try:
                response = llm.invoke([
                    {"role": "system", "content": SUMMARIZER_SYSTEM},
                    {"role": "user", "content": f"Sub-question: {sq['question']}\n\nContext:\n{context}"}
                ])
                
                try:
                    data = json.loads(response.content)
                    summaries.append({
                        "sub_question_id": sq["id"],
                        "summary": data["summary"],
                        "supporting_sources": [r["url"] for r in state["raw_search_results"][:3]],
                        "confidence_score": float(data.get("confidence_score", 0.6)),
                        "contradictions": data.get("contradictions", [])
                    })
                except (json.JSONDecodeError, KeyError):
                    # Fallback: use raw response as summary
                    summaries.append({
                        "sub_question_id": sq["id"],
                        "summary": response.content[:500],
                        "supporting_sources": [r["url"] for r in state["raw_search_results"][:3]],
                        "confidence_score": 0.5,
                        "contradictions": []
                    })
                    
            except Exception as e:
                print(f"⚠️ LLM summarization failed for {sq['id']}: {e}")
                summaries.append({
                    "sub_question_id": sq["id"],
                    "summary": f"Unable to generate summary: {str(e)}",
                    "supporting_sources": [],
                    "confidence_score": 0.0,
                    "contradictions": []
                })
        
        event["status"] = "done"
        event["result"] = f"Summarized {len(summaries)} sections"
        
    except Exception as e:
        print(f"❌ Summarizer error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
    
    return {

        "section_summaries": summaries,
        "trace_events": [event]
    }
