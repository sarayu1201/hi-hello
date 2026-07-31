from pymongo import MongoClient

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    # Query count for Test 1
    test_id = "ibps_clerk_prelims_test1"
    docs = list(questions_col.find({"test_id": test_id}))
    print(f"\nMongoDB: Found {len(docs)} documents for test_id={test_id}")
    
    # Count by subject
    subjects = {}
    for d in docs:
        sub = d.get("subject", "Unknown")
        subjects[sub] = subjects.get(sub, 0) + 1
        
    for sub, count in subjects.items():
        print(f"  - {sub}: {count}")
        
except Exception as e:
    print(f"An error occurred: {e}")
