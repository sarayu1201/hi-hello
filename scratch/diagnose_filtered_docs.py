from pymongo import MongoClient

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    # Get all 1000 clerk docs
    all_docs = list(questions_col.find({"course": "IBPS Clerk Prelims"}))
    
    # Get the ones that pass the filter
    filter_query = {
        "course": "IBPS Clerk Prelims",
        "is_mock_eligible": True,
        "status": {"$ne": "needs_review"},
        "source_file": {"$ne": None, "$exists": True}
    }
    passing_ids = set(d["_id"] for d in questions_col.find(filter_query))
    
    print(f"Total: {len(all_docs)}, Passing: {len(passing_ids)}")
    
    # Print the fields of a few failing docs
    failing_count = 0
    for d in all_docs:
        if d["_id"] not in passing_ids:
            failing_count += 1
            if failing_count <= 5:
                print(f"\n--- Failing Document {failing_count} ---")
                print(f"  ID: {d.get('id')}")
                print(f"  Unique ID: {d.get('unique_id')}")
                print(f"  is_mock_eligible: {repr(d.get('is_mock_eligible'))}")
                print(f"  status: {repr(d.get('status'))}")
                print(f"  source_file: {repr(d.get('source_file'))}")
                print(f"  sub_type: {repr(d.get('sub_type'))}")
                
except Exception as e:
    print(f"An error occurred: {e}")
