from pymongo import MongoClient

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    print("Checking question counts in DB by test_id:")
    for i in range(1, 11):
        test_id = f"ibps_clerk_prelims_test{i}"
        count = questions_col.count_documents({"test_id": test_id})
        print(f"  - {test_id}: {count} questions in DB.")
        
except Exception as e:
    print(f"Error connecting to DB: {e}")
