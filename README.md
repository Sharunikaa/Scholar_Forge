# ArXivIQ - AI Research Agent

An industry-grade full-stack research assistant that uses LangGraph agents to search the web and academic papers, synthesizes findings, and exports professional reports.

## Phase 1: Backend Foundation ✅

Core agent pipeline with LangGraph.

### Components
- **Planner**: Decomposes research questions into sub-questions
- **Web Search**: Tavily API for general web search
- **arXiv Search**: Academic paper discovery
- **PDF Ingestion**: Downloads and processes papers with ChromaDB RAG
- **Summarizer**: Semantic search + LLM summaries
- **Critic**: Quality evaluation with retry loop (Reflexion pattern)
- **Writer**: Markdown report generation

### Quick Start

```bash
# 1. Virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set API keys in .env
cp .env.example .env
# Add your GROQ_API_KEY, TAVILY_API_KEY, GEMINI_API_KEY

# 4. Run CLI test
python test_cli.py
```

### Environment Variables Required
- `GROQ_API_KEY` - from [groq.com](https://groq.com)
- `TAVILY_API_KEY` - from [tavily.com](https://tavily.com)
- `GEMINI_API_KEY` - from [console.cloud.google.com](https://console.cloud.google.com)
- `MONGODB_URI` - (Phase 2) from MongoDB Atlas
- `MONGODB_DB_NAME` - (Phase 2, default: arxiviq)

### Architecture

```
Query Input
    ↓
[Planner] → Decompose into sub-questions
    ↓
[Web Search] ←→ [arXiv Search] (parallel)
    ↓
[PDF Ingestion] → ChromaDB embeddings
    ↓
[Summarizer] → Semantic search + summaries
    ↓
[Critic] → Quality check + retry loop
    ↓
[Writer] → Markdown report + citations
    ↓
Output: Final Report
```

### File Structure
```
backend/
├── agents/           # Agent implementations
├── graph/            # LangGraph state & workflow
├── tools/            # Utilities (citations, etc)
├── db/               # (Phase 2) MongoDB layer
├── api/              # (Phase 2) FastAPI routes
├── tests/            # Test files
├── config.py         # Configuration
├── test_cli.py       # CLI test script
└── requirements.txt
```

### Test Checkpoint
```bash
python test_cli.py
```

Expected output:
- ✓ Planner creates 3-5 sub-questions
- ✓ Web + arXiv searches return results
- ✓ PDFs downloaded (if available)
- ✓ Markdown report generated
- ✓ Multiple citations formatted

### What Makes This Industry-Grade

1. **StateGraph with Annotated fields** - Parallel nodes merge results correctly
2. **Critic with retry loop** - Implements Reflexion pattern for quality control
3. **RAG pipeline** - Semantic search with ChromaDB + Google Gemini embeddings
4. **Error resilience** - Try/except on every LLM call with fallbacks
5. **Async throughout** - LangChain async for scalability

---

## Next: Phase 2

- MongoDB Atlas setup
- FastAPI REST API
- WebSocket for live agent tracing
- Session & report persistence

