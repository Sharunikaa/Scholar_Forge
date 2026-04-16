# backend/agents/pdf_ingestion.py
"""
PDF Ingestion + RAG Agent: Downloads and processes academic PDFs.

- Downloads PDFs from arXiv links
- Extracts text using PyMuPDF
- Splits into chunks using LangChain's text splitter
- Stores embeddings in ChromaDB for semantic search during summarization
"""

import fitz          # PyMuPDF
import httpx
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

from backend.graph.state import AgentState, ChunkResult
from backend.config import CHUNK_SIZE, CHUNK_OVERLAP

# Try to import Chroma, but allow graceful failure for version compatibility
try:
    from langchain_chroma import Chroma
    CHROMA_AVAILABLE = True
except ImportError:
    Chroma = None
    CHROMA_AVAILABLE = False
    print("⚠️ ChromaDB not available - PDF RAG features disabled")

# Initialize embeddings once (thread-safe, reused across calls)
# Using HuggingFace embeddings (free, no API key needed)
embeddings_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"  # Fast, accurate, 384-dim
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP
)


def pdf_ingestion_node(state: AgentState) -> AgentState:
    """PDF ingestion node: download, extract, chunk, and embed papers."""
    
    all_chunks: list[ChunkResult] = []
    docs_for_chroma = []
    
    event = {
        "agent": "pdf_ingestion",
        "status": "running",
        "message": "Downloading and processing PDFs..."
    }
    
    try:
        # Filter to arXiv results that have PDF URLs
        arxiv_results = [
            r for r in state["raw_search_results"]
            if r["source_type"] == "arxiv" and r.get("pdf_url")
        ][:5]  # Limit to 5 PDFs to avoid timeouts
        
        for result in arxiv_results:
            try:
                # Download PDF bytes
                print(f"📥 Downloading: {result['title'][:60]}...")
                response = httpx.get(
                    result["pdf_url"],
                    timeout=30,
                    follow_redirects=True
                )
                pdf_bytes = response.content
                
                # Extract text from PDF
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                full_text = "\n".join(page.get_text() for page in doc)
                doc.close()
                
                if not full_text.strip():
                    print(f"⚠️ No text extracted from {result['title']}")
                    continue
                
                # Split into chunks
                chunks = splitter.split_text(full_text)
                print(f"✂️ {len(chunks)} chunks from {result['arxiv_id']}")
                
                for i, chunk in enumerate(chunks):
                    all_chunks.append({
                        "content": chunk,
                        "source_url": result["url"],
                        "paper_title": result["title"],
                        "chunk_id": f"{result['arxiv_id']}_chunk_{i}"
                    })
                    docs_for_chroma.append(chunk)
                    
            except Exception as e:
                print(f"⚠️ Failed to process {result.get('title', 'unknown')}: {e}")
                continue
        
        # Store in ChromaDB if we have chunks and ChromaDB is available
        if docs_for_chroma and CHROMA_AVAILABLE:
            try:
                print(f"🔤 Embedding {len(docs_for_chroma)} chunks to ChromaDB...")
                vectorstore = Chroma.from_texts(
                    texts=docs_for_chroma,
                    embedding=embeddings_model,
                    collection_name=f"session_{state['session_id']}"
                )
                # Store collection name in state for summarizer to retrieve
                print(f"✅ ChromaDB collection created: session_{state['session_id']}")
            except Exception as e:
                print(f"⚠️ ChromaDB storage failed: {e}")
        elif docs_for_chroma:
            print(f"ℹ️ Skipping ChromaDB storage - ChromaDB not available")
        
        event["status"] = "done"
        event["result"] = f"Ingested {len(arxiv_results)} PDFs, {len(all_chunks)} chunks"
        
    except Exception as e:
        print(f"❌ PDF ingestion error: {e}")
        event["status"] = "error"
        event["result"] = str(e)
    
    return {

        "chunks": all_chunks,
        "trace_events": [event]
    }
