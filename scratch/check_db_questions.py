import os
import json
import pymongo
from dotenv import load_dotenv

def check_db():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    if os.path.exists(env_path):
        load_dotenv(env_path)
        
    mongo_uri = os.environ.get("MONGO_URI") or os.environ.get("MONGODB_URI")
    if not mongo_uri:
        print("MONGO_URI not found in env")
        return
        
    print(f"Connecting to MongoDB...")
    client = pymongo.MongoClient(mongo_uri)
    # Get database name from URI or default
    db_name = client.get_default_database().name
    db = client[db_name]
    
    print(f"Connected to database: {db_name}")
    print("Fetching first 5 questions for 'SBI Clerk Prelims - Test 1'...")
    
    questions = list(db.questions.find({
        "$or": [
            {"test_id": "SBI Clerk Prelims - Test 1"},
            {"test_title": "SBI Clerk Prelims - Test 1"},
            {"sub_type": "SBI Clerk Prelims - Test 1"}
        ]
    }).sort([("question_number", 1), ("id", 1)]).limit(5))
    
    print(f"Found {len(questions)} matching questions in DB.")
    for q in questions:
        print(f"\nQuestion ID: {q.get('id')} | Question No: {q.get('question_number')}")
        print(f"  Subject: {q.get('subject')}")
        print(f"  Direction: {repr(q.get('direction'))}")
        print(f"  Question: {repr(q.get('question'))}")
        print(f"  Options:")
        for opt in q.get("options", []):
            print(f"    Option {opt.get('id')}: {repr(opt.get('text'))}")
        print(f"  Explanation: {repr(q.get('explanation')[:150] if q.get('explanation') else None)}")

if __name__ == "__main__":
    check_db()
