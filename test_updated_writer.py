#!/usr/bin/env python3
"""Test the updated writer with high word count and many headings."""

import requests
import time

BASE_URL = "http://localhost:8000/api"

print("\n" + "="*80)
print("TESTING UPDATED WRITER WITH 5000 WORDS & 10 SECTIONS")
print("="*80)

# Create session
session_resp = requests.post(
    f"{BASE_URL}/sessions",
    json={"user_id": "test_writer_update", "name": "Writer Update Test"}
)
session_id = session_resp.json()["id"]
print(f"\n✅ Session created: {session_id}")

# Submit query with 5000 words and 10 sections
print("\n📝 Submitting request:")
print("   - Question: Document classification using machine learning")
print("   - Word count: 5000 words")
print("   - Sections: 10")
print("   - Citation style: APA")

query_resp = requests.post(
    f"{BASE_URL}/queries",
    json={
        "session_id": session_id,
        "question": "Document classification using machine learning and natural language processing techniques",
        "language": "en",
        "citation_style": "apa",
        "word_count": 5000,
        "num_headings": 10
    }
)

query_id = query_resp.json()["id"]
print(f"\n✅ Query created: {query_id}")

# Check status
print("\n⏳ Waiting for report generation (max 60 seconds)...")
start_time = time.time()
max_wait = 60

while time.time() - start_time < max_wait:
    status_resp = requests.get(f"{BASE_URL}/queries/{query_id}")
    status_data = status_resp.json()
    progress = status_data.get("progress", 0)
    
    if status_data.get("status") == "completed":
        print(f"✅ Report completed!")
        
        # Get the report
        report_resp = requests.get(f"{BASE_URL}/queries/{query_id}/report")
        if report_resp.status_code == 200:
            report = report_resp.json()
            actual_words = len(report["markdown"].split())
            actual_lines = len(report["markdown"].split("\n"))
            
            print("\n" + "="*80)
            print("📊 RESULTS")
            print("="*80)
            print(f"Target word count: 5000 words")
            print(f"Actual word count: {actual_words} words")
            print(f"Accuracy: {(actual_words/5000)*100:.1f}%")
            print(f"\nReport structure:")
            print(f"  - Total lines: {actual_lines}")
            print(f"  - Expected sections: 10")
            
            # Count headings
            headings = report["markdown"].count("##")
            print(f"  - Actual headings (##): {headings}")
            print(f"\nFirst 500 characters:")
            print("-" * 80)
            print(report["markdown"][:500] + "...")
        else:
            print("❌ Failed to fetch report")
        break
    else:
        print(f"  Status: {status_data.get('status')} | Progress: {progress}%")
    
    time.sleep(3)

if time.time() - start_time >= max_wait:
    print("⏳ Timeout - report still processing")

print("\n" + "="*80)
