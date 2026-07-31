from pymongo import MongoClient
from collections import Counter

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    docs = list(questions_col.find({"course": "IBPS Clerk Prelims"}))
    print(f"\nTotal 'IBPS Clerk Prelims' documents in DB: {len(docs)}")
    
    sub_types = Counter(d.get("sub_type", "None") for d in docs)
    test_ids = Counter(d.get("test_id", "None") for d in docs)
    sources = Counter(d.get("source_file", "None") for d in docs)
    
    print("\n--- Grouped by sub_type ---")
    for k, v in sorted(sub_types.items()):
        print(f"  - {k}: {v}")
        
    print("\n--- Grouped by test_id ---")
    for k, v in sorted(test_ids.items()):
        print(f"  - {k}: {v}")
        
    print("\n--- Grouped by source_file ---")
    for k, v in sorted(sources.items()):
        print(f"  - {k}: {v}")
        
except Exception as e:
    print(f"An error occurred: {e}")
