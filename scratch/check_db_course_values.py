from pymongo import MongoClient

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    print("Question counts by course field:")
    c1 = questions_col.count_documents({"course": "ibps_clerk_prelims"})
    c2 = questions_col.count_documents({"course": "IBPS Clerk Prelims"})
    print(f"  - 'ibps_clerk_prelims': {c1} questions in DB.")
    print(f"  - 'IBPS Clerk Prelims': {c2} questions in DB.")
    
    # Also check a sample sub_type for both
    print("\nChecking sample sub_types for 'ibps_clerk_prelims':")
    pipeline = [
        {"$match": {"course": "ibps_clerk_prelims"}},
        {"$group": {"_id": "$sub_type", "count": {"$sum": 1}}},
        {"$limit": 10}
    ]
    for r in list(questions_col.aggregate(pipeline)):
        print(f"  - {r['_id']}: {r['count']} questions")
        
    print("\nChecking sample sub_types for 'IBPS Clerk Prelims':")
    pipeline2 = [
        {"$match": {"course": "IBPS Clerk Prelims"}},
        {"$group": {"_id": "$sub_type", "count": {"$sum": 1}}},
        {"$limit": 10}
    ]
    for r in list(questions_col.aggregate(pipeline2)):
        print(f"  - {r['_id']}: {r['count']} questions")
        
except Exception as e:
    print(f"Error: {e}")
