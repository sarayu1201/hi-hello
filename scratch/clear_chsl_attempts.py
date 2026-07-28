import pymongo

remote_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(remote_uri)
db = client["kr_academy"]
attempts_col = db["attempts"]

# We will delete all attempts for CHSL Test 3
query = {"testName": {"$regex": "CHSL.*Test 3", "$options": "i"}}
res = attempts_col.delete_many(query)
print(f"Deleted {res.deleted_count} attempts matching {query} in remote database.")

# Also do it for local database
client_local = pymongo.MongoClient("mongodb://localhost:27017/")
db_local = client_local["kr_academy"]
res_local = db_local["attempts"].delete_many(query)
print(f"Deleted {res_local.deleted_count} attempts matching {query} in local database.")
