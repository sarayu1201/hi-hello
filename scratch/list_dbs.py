from pymongo import MongoClient

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    
    print("\n--- Databases in Cluster ---")
    dbs = client.list_database_names()
    for db_name in dbs:
        db = client[db_name]
        print(f"Database: {db_name}")
        cols = db.list_collection_names()
        for col_name in cols:
            count = db[col_name].count_documents({})
            print(f"  - Collection: {col_name} ({count} documents)")
            
except Exception as e:
    print(f"An error occurred: {e}")
