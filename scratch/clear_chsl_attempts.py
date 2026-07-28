import pymongo

remote_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(remote_uri)
db = client["kr_academy"]
attempts_col = db["attempts"]

query = {"testName": {"$regex": "CHSL.*(Test 3|Test 4|Test 5)", "$options": "i"}}
res_remote = attempts_col.delete_many(query)
print(f"Deleted {res_remote.deleted_count} attempts matching {query} in remote database.")
