from pymongo import MongoClient
import pprint

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    # Find one document
    doc = questions_col.find_one({"course": "IBPS Clerk Prelims"})
    if doc:
        print("\n--- Found One DB Document ---")
        pprint.pprint(doc)
    else:
        print("\nNo documents found for course='IBPS Clerk Prelims'")
        
        # Let's search for any clerk-like documents
        doc_any = questions_col.find_one({"course": {"$regex": "clerk", "$options": "i"}})
        if doc_any:
            print("\n--- Found Any Clerk Document ---")
            pprint.pprint(doc_any)
        else:
            print("No documents found with 'clerk' in course.")
            
except Exception as e:
    print(f"An error occurred: {e}")
