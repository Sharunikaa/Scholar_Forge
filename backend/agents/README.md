# Agents — Research Pipeline Orchestration

This directory contains the **7 agents** that work together in a LangGraph pipeline to decompose research questions, search for sources, analyze PDFs, generate summaries, validate quality, and produce final reports.

---

## Agent Workflow Overview

```
USER QUERY
    ↓
[1] PLANNER
    Decompose → Sub-questions + Keywords
    ↓
[2a] WEB_SEARCH (parallel) ←─┐
[2b] ARXIV_SEARCH (parallel) │
    Search → Raw results
    ↓
[3] PDF_INGESTION
    Download PDFs → Extract & Chunk → Store in ChromaDB
    ↓
[4] SUMMARIZER
    RAG + LLM → Section Summaries (per sub-question)
    ↓
[5] CRITIC
    Evaluate Quality → Confidence Score
    ├─ If confidence < 0.75 AND retries < 2:
    │  └─→ LOOP BACK TO [2] WEB_SEARCH (refined query)
    └─ Else:
       └─→ Continue to [6]
    ↓
[6] WRITER
    Synthesize → Markdown Report
    ↓
[7] CITATION_FORMATTER (embedded in writer)
    Format Citations → APA/MLA/IEEE
    ↓
FINAL REPORT + CITATIONS
```

---

## Agent Details

### 1. **Planner** (`planner.py`)

**Purpose:** Break down vague research query into specific, searchable sub-questions.

**Input:**
```python
state["raw_query"]  # "What are health impacts of air pollution?"
```

**Output:**
```python
state["sub_questions"] = [
    {
        "id": "sq_1",
        "question": "What are PM2.5 levels in major Indian cities?",
        "keywords": ["PM2.5", "Indian cities", "air quality"],
        "search_intent": "empirical_research"
    },
    {
        "id": "sq_2",
        "question": "What health problems does PM2.5 cause?",
        "keywords": ["PM2.5", "health", "respiratory", "cardiovascular"],
        "search_intent": "empirical_research"
    },
    # ... more sub-questions
]
```

**How it works:**
1. Send raw query to Groq DeepSeek R1 (reasoning model)
2. Request structured JSON with 3-5 sub-questions
3. Parse JSON and add to state
4. Fallback: if JSON parsing fails, use raw query as single sub-question

**Why this agent?**
- Focused searches >> broad searches
- Breaks down complex questions into independent parts
- Allows parallel search in next step

---

### 2. **Web Search** (`web_search.py`)

**Purpose:** Search the general web for relevant results using Tavily API.

**Input:**
```python
state["sub_questions"]  # Keywords and search intent from planner
```

**Output:**
```python
state["raw_search_results"].append({
    "title": "Air Quality Index in Delhi",
    "url": "https://cpcb.nic.in/..."
    "snippet": "Delhi's average PM2.5 is 96-154 µg/m³...",
    "source_type": "web",
    "relevance_score": 0.87,
    # ... more fields
})
```

**How it works:**
1. For each sub-question, generate search query from keywords
2. Call Tavily API with `advanced` depth for quality results
3. Extract title, URL, snippet, score from response
4. Append to `raw_search_results` (note: uses `Annotated[List, add]` to merge with arxiv results)

**Error Handling:**
- If API timeout: skip and continue (never block pipeline)
- If no results: log warning but don't crash

**Why Tavily?**
- Free tier: 1000 queries/month
- Fast: ~2 sec per query
- Returns snippets (no need to download pages)

---

### 3. **ArXiv Search** (`arxiv_search.py`)

**Purpose:** Search academic papers from arXiv (parallel to web search).

**Input:**
```python
state["sub_questions"]  # Keywords from planner
```

**Output:**
```python
state["raw_search_results"].append({
    "title": "Fine Particulate Matter and Respiratory Disease",
    "url": "https://arxiv.org/abs/2204.xxxxx",
    "snippet": "[paper abstract]",
    "source_type": "arxiv",
    "arxiv_id": "2204.xxxxx",
    "pdf_url": "https://arxiv.org/pdf/2204.xxxxx.pdf",
    "published_date": "2022",
    "relevance_score": 0.85
})
```

**How it works:**
1. For each sub-question, search arXiv API with top-3 keywords
2. Get results sorted by relevance
3. Extract paper metadata (title, abstract, PDF URL, year)
4. Append to `raw_search_results` (merged with web results)

**Why arXiv?**
- Free: no authentication required
- Huge corpus: 2M+ papers on science/tech
- High quality: peer-reviewed papers
- PDFs always available (for later ingestion)

---

### 4. **PDF Ingestion + RAG** (`pdf_ingestion.py`)

**Purpose:** Download and chunk arXiv PDFs, store embeddings in vector DB for semantic search.

**Input:**
```python
state["raw_search_results"]  # ArXiv papers with PDF URLs
```

**Output:**
```python
state["chunks"] = [
    {
        "content": "PM2.5 refers to particulate matter with diameter <= 2.5 micrometers...",
        "source_url": "https://arxiv.org/abs/2204.xxxxx",
        "paper_title": "Fine Particulate Matter and Respiratory Disease",
        "chunk_id": "2204.xxxxx_chunk_0"
    },
    # ... 46 more chunks (total ~47 chunks from 5 PDFs)
]
state["_vectorstore_collection"] = "session_abc12345"  # ChromaDB collection name
```

**How it works:**
1. Filter for only arXiv papers (ignore web results for now)
2. For each PDF URL:
   - Download PDF bytes via HTTP
   - Extract text using PyMuPDF (fitz)
   - Split text into 500-char chunks (recursive splitter, respects sentences)
   - Generate embeddings using Google Gemini API
   - Store in ChromaDB (local, in-memory, per-session)
3. Update state with chunk list and collection name

**Error Handling:**
- If PDF download fails: skip that paper, continue
- If extraction fails: skip that paper, continue
- Never crash the pipeline

**Why ChromaDB?**
- Local (no cloud dependency)
- In-memory (fast)
- Free
- Works with sentence-boundary-aware chunks

---

### 5. **Summarizer** (`summarizer.py`)

**Purpose:** For each sub-question, retrieve relevant PDF chunks via RAG and generate a summary.

**Input:**
```python
state["sub_questions"]
state["chunks"]
state["raw_search_results"]
state["_vectorstore_collection"]  # ChromaDB collection name
```

**Output:**
```python
state["section_summaries"] = [
    {
        "sub_question_id": "sq_1",
        "summary": "PM2.5 levels in major Indian cities are extremely high. Delhi experiences...",
        "supporting_sources": ["url1", "url2", "url3"],
        "confidence_score": 0.82,
        "contradictions": ["one study claims X, but another says Y"]
    },
    # ... more summaries
]
```

**How it works:**
1. For each sub-question:
   - Query ChromaDB for top-5 most relevant chunks (semantic search)
   - Fetch top-3 web snippets from `raw_search_results`
   - Send to Groq Llama 3.3 with context
   - LLM generates 2-4 paragraph summary
   - Extract confidence score from LLM response
   - Track contradictions the LLM identifies
2. Append summary to `section_summaries`

**Error Handling:**
- If ChromaDB empty (no PDFs ingested): use only web snippets
- If JSON parsing fails: use raw LLM response

**Why RAG?**
- Grounds summaries in actual paper content
- Reduces hallucination vs. pure LLM
- Allows semantic search (finds relevant info by meaning, not keywords)

---

### 6. **Critic** (`critic.py`)

**Purpose:** Evaluate research quality and decide if retry is needed. Implements **Reflexion pattern**.

**Input:**
```python
state["section_summaries"]
state["raw_query"]
```

**Output:**
```python
state["critique"] = {
    "overall_confidence": 0.82,  # 0.0—1.0
    "section_scores": {
        "sq_1": 0.82,
        "sq_2": 0.79,
        # ...
    },
    "flagged_claims": ["claim lacks evidence"],
    "missing_evidence": ["what additional sources would help"],
    "retry_needed": False,
    "retry_sub_questions": []
}

state["critic_retry_count"] = 0  # Incremented if retry
```

**Decision Logic:**
```python
IF overall_confidence >= 0.75 AND retry_count < MAX_RETRIES:
    retry_needed = False
    → Go to WRITER
ELIF overall_confidence < 0.75 AND retry_count < MAX_RETRIES:
    retry_needed = True
    → Loop back to WEB_SEARCH with refined keywords
ELSE:
    # Max retries reached, don't loop forever
    retry_needed = False
    → Go to WRITER
```

**How it works:**
1. Send all summaries to Groq DeepSeek R1 (reasoning model)
2. Ask for:
   - Overall confidence (0-1)
   - Per-section confidence scores
   - Specific flagged claims lacking evidence
   - Missing evidence for key points
   - Retry recommendation
3. Parse JSON response
4. Check retry condition
5. If retry: increment counter, keep some state, go back to search

**Why Critic?**
- Quality gate: low-confidence research doesn't ship
- Reflexion loop: self-improvement via feedback
- Max 2 retries: prevents infinite loops

---

### 7. **Writer** (`writer.py`)

**Purpose:** Synthesize all summaries into a polished, structured Markdown report.

**Input:**
```python
state["section_summaries"]
state["raw_search_results"]  # For citations
state["raw_query"]
```

**Output:**
```python
state["final_report_markdown"] = """# Executive Summary

Air pollution, particularly fine particulate matter (PM2.5), represents...

## Background & Context

PM2.5 refers to particulate matter with diameter <= 2.5 micrometers...

## Findings

### PM2.5 Levels in Indian Cities

Delhi experiences the highest concentrations globally...

### Health Impacts

Respiratory disease risk increases by 2-3% per 10 µg/m³...

## References

[1] Apte, J. S., et al. "Addressing Global Mortality from Ambient PM2.5." 
    Environmental Science & Technology, vol. 49, 2015.
[2] WHO. "Air Quality Guidelines: Global Update 2005." 2005.
"""

state["citations"] = [
    {
        "id": "1",
        "title": "Addressing Global Mortality from Ambient PM2.5",
        "authors": ["Apte, J. S.", "Bombrun, E.", "Marshall, J. D."],
        "year": "2015",
        "url": "https://pubs.acs.org/...",
        "apa": "[1] Apte, J. S., et al. ...",
        "mla": "[1] Apte, J. S., et al. ...",
        "ieee": "[1] J. S. Apte et al., ..."
    },
    # ... more citations
]
```

**How it works:**
1. Send summaries to Groq Llama 3.3 (writing model)
2. Request structured Markdown report with required sections
3. LLM generates cohesive narrative
4. Extract unique sources from `raw_search_results` (max 15)
5. For each source, call `citation_formatter.format_citation()`
6. Generate APA/MLA/IEEE versions
7. Insert formatted citations into report

**Report Structure:**
```markdown
## Executive Summary (2-3 paragraphs)
## Background & Context (definition, scope)
## Findings (one subsection per sub-question)
## Conflicting Evidence & Limitations
## Conclusions & Recommendations
## References (formatted citations)
```

---

## Citation Formatter

**File:** `backend/tools/citation_formatter.py`

Converts source URLs/metadata into formatted citations.

**Input:**
```python
{
    "title": "Paper Title",
    "authors": ["Author1", "Author2"],
    "year": "2023",
    "url": "https://...",
    "source_type": "journal"  # or "arxiv", "web", "news"
}
```

**Output (for each style):**
```
APA: [1] Apte, J. S., et al. "Title." Journal Name, 2023.
MLA: [1] Apte, J. S., et al. "Title." Journal Name, 2023.
IEEE: [1] J. S. Apte et al., "Title," Journal Name, 2023.
```

---

## Data Flow (AgentState)

All agents share a single `AgentState` TypedDict. Each agent reads from and writes to the same state object.

```
AgentState = {
    # INPUT (set by user/API)
    "session_id": "abc12345",
    "raw_query": "What are health impacts of PM2.5?",
    "language": "en",
    "citation_style": "apa",
    
    # INTERMEDIATE (built by each agent)
    "sub_questions": [],              # [Planner output]
    "raw_search_results": [],         # [Web + ArXiv output, merged]
    "chunks": [],                     # [PDF Ingestion output]
    "section_summaries": [],          # [Summarizer output]
    "critique": None,                 # [Critic output]
    "critic_retry_count": 0,          # [Critic state]
    
    # OUTPUT (final results)
    "final_report_markdown": "",      # [Writer output]
    "citations": [],                  # [Formatter output]
    
    # METADATA
    "trace_events": [],               # [All agents append log events]
    "error": None                     # [Error messages if any]
}
```

**Key Design:** Annotated fields allow merging:
```python
"raw_search_results": Annotated[List[SearchResult], add]
```
This tells LangGraph to merge lists from parallel nodes (web + arxiv) instead of overwriting.

---

## Testing Individual Agents

### Test Planner in Isolation

```python
from backend.agents.planner import planner_node
from backend.graph.state import AgentState

state = AgentState(
    session_id="test",
    raw_query="What causes climate change?",
    language="en",
    citation_style="apa",
    sub_questions=[],
    raw_search_results=[],
    chunks=[],
    section_summaries=[],
    critique=None,
    critic_retry_count=0,
    final_report_markdown="",
    citations=[],
    trace_events=[],
    error=None
)

result = planner_node(state)
print(result["sub_questions"])
# Output: [{"id": "sq_1", "question": "...", ...}, ...]
```

### Test Web Search

```python
from backend.agents.web_search import web_search_node

# Planner must run first to populate sub_questions
result["raw_search_results"] = []  # Initialize
result = web_search_node(result)
print(f"Found {len(result['raw_search_results'])} web results")
```

### Test Full Pipeline

```bash
cd /Users/Sharunikaa/llm_project/arxiviq
python -m backend.test_cli
```

---

## Error Handling Strategy

**Philosophy:** **Never crash the pipeline.** Degrade gracefully.

| Scenario | Handling |
|----------|----------|
| API timeout | Skip, log warning, continue |
| PDF download fails | Skip that paper, use others |
| ChromaDB empty | Use web snippets only |
| JSON parse error | Use raw LLM response as-is |
| Low confidence | Retry up to 2 times, then proceed |
| No results found | Return empty lists, continue |

---

## Configuration

All agents read from `backend/config.py`:

```python
GROQ_API_KEY = "gsk_..."                    # LLM API key
PLANNER_MODEL = "deepseek-r1-distill-llama-70b"  # Reasoning
WRITER_MODEL = "llama-3.3-70b-versatile"        # Writing
TAVILY_API_KEY = "tvly_..."                 # Web search
GEMINI_API_KEY = "AIza_..."                 # Embeddings
CRITIC_CONFIDENCE_THRESHOLD = 0.75          # Quality gate
MAX_CRITIC_RETRIES = 2                      # Loop prevent
CHUNK_SIZE = 500                            # PDF chunking
```

---

## Performance Metrics

| Agent | Typical Time | Output Size |
|-------|--------------|-------------|
| Planner | 1-2 sec | 3-5 sub-questions |
| Web Search | 2 sec/query | ~8 results |
| ArXiv Search | 1.5 sec/query | ~8 papers |
| PDF Ingestion | 5-10 sec | 40-50 chunks (~180KB text) |
| Summarizer | 3-5 sec/question | 3-5 summaries (2-4 para each) |
| Critic | 2-3 sec | 1 critique result |
| Writer | 3-5 sec | 1500-2500 word report |
| **Total** | **45-60 sec** | **1 markdown report + 12 citations** |

---

## Dependencies

```
langgraph >= 0.1.0
langchain >= 0.1.0
langchain-groq >= 0.1.0
langchain-google-genai >= 0.1.0
langchain-chroma >= 0.1.0
chromadb >= 0.4.0
tavily-python >= 0.3.0
arxiv >= 1.4.0
pymupdf >= 1.24.0
python-dotenv >= 1.0.0
pydantic >= 2.0.0
```


---

## Quick Reference

```bash
# Run full pipeline
python -m backend.test_cli

# Test single agent (Python REPL)
from backend.agents.planner import planner_node
# ... create state and run planner_node(state)

# Check logs
tail -f /tmp/arxiviq.log  # if logging enabled

# Profile performance
time python -m backend.test_cli
```

---

