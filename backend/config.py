# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_KEY_1 = os.getenv("GROQ_API_KEY_1")  # Backup API key for report generation
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "arxiviq")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Model names on Groq (free tier) - using currently available models
PLANNER_MODEL = "llama-3.1-8b-instant"            # reasoning & planning
WRITER_MODEL = "llama-3.1-8b-instant"             # writing & composition
CRITIC_MODEL = "llama-3.1-8b-instant"             # evaluation & reasoning
FAST_MODEL = "llama-3.1-8b-instant"               # all tasks (single model)

MAX_SEARCH_RESULTS = 8
MAX_PDF_PAPERS = 5
CRITIC_CONFIDENCE_THRESHOLD = 0.75
MAX_CRITIC_RETRIES = 2
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
