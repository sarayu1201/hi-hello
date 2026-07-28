import os
import pymongo

# Find backend/.env URI
workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(workspace_root, "backend", ".env")

mongo_uri = None
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                mongo_uri = line.split("=", 1)[1].strip()
                break

if not mongo_uri:
    # Fallback to local
    mongo_uri = "mongodb://localhost:27017/kr_academy"

print(f"Connecting to database URI: {mongo_uri[:60]}...")

try:
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_default_database()
    attempts_col = db["attempts"]
    
    # Identify test titles to clear attempts for
    test_names_to_delete = [
        "IBPS RRB Clerk Prelims - Test 3",
        "IBPS RRB Clerk Prelims - Test 4",
        "IBPS RRB Clerk Prelims - Test 7",
        "IBPS RRB Clerk Prelims - Test 8",
        "IBPS RRB Clerk Prelims - Test 10",
        "IBPS RRB PO Prelims - Test 4",
        "IBPS RRB PO Prelims - Test 6",
        "IBPS RRB PO Prelims - Test 7",
        "IBPS RRB PO Prelims - Test 8",
        "IBPS RRB PO Prelims - Test 9",
        "SSC CHSL Prelims - Test 1",
        "SSC CHSL Prelims - Test 2"
    ]
    
    for name in test_names_to_delete:
        res = attempts_col.delete_many({"testName": name})
        print(f"Deleted {res.deleted_count} attempts for testName: '{name}'")
        
    print("\nSuccessfully cleared cached attempts! Please refresh your browser page now.")
except Exception as e:
    print("Error clearing attempts:", e)
