#!/usr/bin/env python3
"""
MongoDB Inspector: Check what data is actually stored in MongoDB
Run this to verify data persistence
"""

from backend.db.connection import MongoConnection
from backend.db.repositories.query_repository import QueryRepository
from backend.db.repositories.session_repository import SessionRepository
import json
from datetime import datetime


def json_serializer(obj):
    """Custom JSON serializer for datetime objects."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def inspect_mongodb():
    """Inspect MongoDB collections and document count."""
    
    print("\n" + "="*80)
    print("🔍 MONGODB INSPECTION REPORT")
    print("="*80)
    
    try:
        # Connect to database
        db = MongoConnection.get_db()
        print("✅ Connected to MongoDB successfully\n")
        
        # Get collection names
        collections = db.list_collection_names()
        print(f"📦 Collections in database: {collections}\n")
        
        # Inspect queries collection
        print("="*80)
        print("QUERIES COLLECTION")
        print("="*80)
        
        queries_collection = db["queries"]
        query_count = queries_collection.count_documents({})
        print(f"📊 Total queries: {query_count}\n")
        
        if query_count > 0:
            # Get all queries
            queries = list(queries_collection.find({}))
            
            for i, query in enumerate(queries, 1):
                print(f"\n--- Query {i} ---")
                print(f"ID: {query.get('id', 'N/A')}")
                print(f"Question: {query.get('question', 'N/A')}")
                print(f"Status: {query.get('status', 'N/A')}")
                print(f"Progress: {query.get('progress', 0)}%")
                print(f"Session ID: {query.get('session_id', 'N/A')}")
                print(f"Created At: {query.get('created_at', 'N/A')}")
                print(f"Completed At: {query.get('completed_at', 'N/A')}")
                print(f"Execution Time: {query.get('execution_time_seconds', 'N/A')}")
                print(f"Trace Events: {len(query.get('trace_events', []))} events")
                
                # Show report if exists
                if query.get('report'):
                    report = query['report']
                    print(f"Report:")
                    print(f"  - Word Count: {report.get('word_count', 0)}")
                    print(f"  - Citations: {len(report.get('citations', []))}")
                    print(f"  - Sub-Questions: {len(report.get('sub_questions', []))}")
                    print(f"  - Confidence: {report.get('confidence_score', 0)}")
                
                # Show error if exists
                if query.get('error'):
                    print(f"Error: {query.get('error')}")
        else:
            print("❌ No queries found in MongoDB\n")
        
        # Inspect sessions collection
        print("\n" + "="*80)
        print("SESSIONS COLLECTION")
        print("="*80)
        
        sessions_collection = db["sessions"]
        session_count = sessions_collection.count_documents({})
        print(f"📊 Total sessions: {session_count}\n")
        
        if session_count > 0:
            sessions = list(sessions_collection.find({}))
            for i, session in enumerate(sessions, 1):
                print(f"\n--- Session {i} ---")
                print(f"ID: {session.get('id', 'N/A')}")
                print(f"Created At: {session.get('created_at', 'N/A')}")
                print(f"Queries: {len(session.get('query_ids', []))}")
        else:
            print("❌ No sessions found in MongoDB\n")
        
        print("\n" + "="*80)
        print("✅ INSPECTION COMPLETE")
        print("="*80 + "\n")
        
        return query_count, session_count
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"Type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return 0, 0


if __name__ == "__main__":
    inspect_mongodb()
