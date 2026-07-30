from pymongo import MongoClient

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    # Aggregate counts by sub_type
    pipeline = [
        {"$group": {"_id": "$sub_type", "count": {"$sum": 1}, "test_id": {"$first": "$test_id"}}},
        {"$sort": {"_id": 1}}
    ]
    
    results = list(questions_col.aggregate(pipeline))
    print(f"Total different sub_types in DB: {len(results)}\n")
    print(f"{'Sub Type (Mock Paper)':<45} | {'Test ID':<25} | {'Count':<5}")
    print("-" * 80)
    for r in results:
        sub_type = r["_id"] or "N/A"
        test_id = r["test_id"] or "N/A"
        count = r["count"]
        # Highlight any count that is not standard (e.g. 100, 120, 80)
        status = ""
        if count != 100 and count != 120 and count != 80:
            status = " <- WARNING: NOT STANDARD"
        print(f"{sub_type:<45} | {test_id:<25} | {count:<5}{status}")
        
except Exception as e:
    print(f"Error: {e}")
