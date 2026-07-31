from pymongo import MongoClient
from collections import Counter

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    # Run the exact filter query used by the backend
    filter_query = {
        "course": "IBPS Clerk Prelims",
        "is_mock_eligible": True,
        "status": {"$ne": "needs_review"},
        "source_file": {"$ne": None, "$exists": True}
    }
    
    docs = list(questions_col.find(filter_query))
    print(f"\nExact Backend Filter matches: {len(docs)} documents")
    
    sub_types = Counter(d.get("sub_type", "None") for d in docs)
    for k, v in sorted(sub_types.items()):
        print(f"  - {k}: {v}")
        
except Exception as e:
    print(f"An error occurred: {e}")
