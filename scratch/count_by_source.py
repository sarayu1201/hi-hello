from pymongo import MongoClient
from collections import Counter

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    # Query all questions where source_file matches ibps_clerk_prelims_test
    docs = list(questions_col.find({"source_file": {"$regex": "^ibps_clerk_prelims_test"}}))
    print(f"\nMongoDB: Found {len(docs)} documents matched by source_file")
    
    courses = Counter(d.get("course", "None") for d in docs)
    sub_types = Counter(d.get("sub_type", "None") for d in docs)
    test_ids = Counter(d.get("test_id", "None") for d in docs)
    
    print("\n--- Grouped by course ---")
    for k, v in sorted(courses.items()):
        print(f"  - {k}: {v}")
        
    print("\n--- Grouped by sub_type ---")
    for k, v in sorted(sub_types.items()):
        print(f"  - {k}: {v}")
        
    print("\n--- Grouped by test_id ---")
    for k, v in sorted(test_ids.items()):
        print(f"  - {k}: {v}")
        
except Exception as e:
    print(f"An error occurred: {e}")
