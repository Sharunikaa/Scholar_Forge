#!/usr/bin/env python3
"""
MongoDB Test Query: Generate and store test data in MongoDB
Run this if MongoDB is empty and you want to populate it with test data
"""

from backend.db.connection import MongoConnection
from backend.db.repositories.query_repository import QueryRepository
from backend.db.repositories.session_repository import SessionRepository
from backend.db.models import QueryStatus, Report, SubQuestion, Citation
from datetime import datetime, timedelta
import random


def create_test_data():
    """Create test queries and sessions in MongoDB."""
    
    print("\n" + "="*80)
    print("🧪 CREATING TEST DATA IN MONGODB")
    print("="*80 + "\n")
    
    try:
        # Connect to database
        db = MongoConnection.get_db()
        session_repo = SessionRepository(db)
        query_repo = QueryRepository(db)
        
        print("✅ Connected to MongoDB\n")
        
        # Create a test session
        session_id = session_repo.create_session()
        print(f"✅ Created test session: {session_id}\n")
        
        # Create test queries
        test_questions = [
            "What is artificial intelligence?",
            "How will AI impact the job market in 2025?",
            "What are the latest advances in machine learning?",
            "How does deep learning compare to traditional ML?",
            "What is the future of AI in healthcare?"
        ]
        
        query_ids = []
        
        for i, question in enumerate(test_questions, 1):
            # Create query
            query_id = query_repo.create_query(
                session_id=session_id,
                question=question,
                language="en",
                citation_style="apa"
            )
            query_ids.append(query_id)
            
            # Simulate different statuses
            status = random.choice([
                QueryStatus.PENDING,
                QueryStatus.PROCESSING,
                QueryStatus.COMPLETED,
                QueryStatus.CACHED
            ])
            
            progress = 0 if status == QueryStatus.PENDING else (50 if status == QueryStatus.PROCESSING else 100)
            
            # Create mock trace events
            trace_events = [
                {
                    "agent": "planner",
                    "status": "done",
                    "message": "Planning research strategy...",
                    "result": "Plan created",
                    "timestamp": datetime.utcnow().isoformat(),
                    "duration_ms": 500
                },
                {
                    "agent": "web_search",
                    "status": "done",
                    "message": "Searching web for relevant sources...",
                    "result": f"Found {random.randint(5, 20)} web sources",
                    "timestamp": (datetime.utcnow() + timedelta(seconds=1)).isoformat(),
                    "duration_ms": random.randint(1000, 3000)
                }
            ]
            
            # Create report for completed queries
            report = None
            if status == QueryStatus.COMPLETED:
                report = Report(
                    markdown=f"# Research Report: {question}\n\nThis is a test report for the query: {question}",
                    word_count=random.randint(100, 500),
                    sub_questions=[
                        SubQuestion(
                            id=f"sq_{j}",
                            question=f"Sub-question {j} for: {question}",
                            keywords=[f"keyword_{j}"],
                            search_intent="research"
                        )
                        for j in range(1, random.randint(2, 5))
                    ],
                    citations=[],
                    confidence_score=random.uniform(0.7, 0.99)
                )
            
            # Update query with progress and report
            query_repo.update_progress(query_id, progress, trace_events)
            
            if status == QueryStatus.COMPLETED:
                query_repo.mark_completed(query_id, report.dict(), trace_events)
            
            print(f"✅ Query {i}: {question}")
            print(f"   Status: {status}")
            print(f"   Progress: {progress}%")
            print(f"   Query ID: {query_id}\n")
        
        # Update session with query IDs
        session_repo.update_session(session_id, {"query_ids": query_ids})
        
        print("="*80)
        print(f"✅ TEST DATA CREATED SUCCESSFULLY")
        print("="*80)
        print(f"\nSession ID: {session_id}")
        print(f"Total Queries: {len(query_ids)}")
        print(f"Query IDs: {query_ids}\n")
        
        return session_id, query_ids
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, []


if __name__ == "__main__":
    create_test_data()
