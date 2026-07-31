from pymongo import MongoClient

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    print("Deleting all IBPS Clerk Prelims questions from database...")
    res = questions_col.delete_many({
        "$or": [
            {"course": "IBPS Clerk Prelims"},
            {"course": "ibps_clerk_prelims"},
            {"sub_type": {"$regex": "^IBPS Clerk Prelims", "$options": "i"}},
            {"test_id": {"$regex": "^ibps_clerk_prelims", "$options": "i"}}
        ]
    })
    print(f"Successfully deleted {res.deleted_count} questions from MongoDB.")
    
except Exception as e:
    print(f"An error occurred: {e}")
