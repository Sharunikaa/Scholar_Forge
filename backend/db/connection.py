# backend/db/connection.py
"""
MongoDB Connection Manager

Handles connection to MongoDB Atlas and provides database access.
Uses pymongo for MongoDB operations (synchronous).
"""

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from backend.config import MONGODB_URI, MONGODB_DB_NAME
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Global MongoDB client
_client: Any = None
_db: Any = None


async def connect_to_mongo():
    """Initialize MongoDB connection."""
    global _client, _db
    
    try:
        logger.info("🔗 Connecting to MongoDB Atlas...")
        
        # Connect using synchronous pymongo with ServerApi
        _client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
        _db = _client[MONGODB_DB_NAME]
        
        # Test connection
        try:
            _client.admin.command('ping')
            logger.info(f"✅ Connected to MongoDB: {MONGODB_DB_NAME}")
            
            # Create indexes
            await create_indexes()
        except Exception as ping_error:
            logger.warning(f"⚠️  MongoDB ping failed: {ping_error}")
            # Connection will retry automatically on first use
        
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection."""
    global _client
    
    if _client:
        _client.close()
        logger.info("🔌 Disconnected from MongoDB")


def get_database() -> Any:
    """Get MongoDB database instance."""
    if _db is None:
        raise RuntimeError("MongoDB not initialized. Call connect_to_mongo() first.")
    return _db


async def create_indexes():
    """Create database indexes for performance."""
    db = get_database()
    
    try:
        # Sessions collection indexes
        db["sessions"].create_index("user_id")
        db["sessions"].create_index("created_at")
        
        # Queries collection indexes
        db["queries"].create_index("session_id")
        db["queries"].create_index("status")
        db["queries"].create_index("created_at")
        db["queries"].create_index("query_hash")  # For cache lookup
        
        # Reports collection indexes
        db["reports"].create_index("query_id")
        db["reports"].create_index("session_id")
        
        # Citations collection indexes
        db["citations"].create_index("report_id")
        
        logger.info("✅ Database indexes created")
        
    except Exception as e:
        logger.warning(f"⚠️ Index creation issue: {e}")
