import pymongo

remote_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(remote_uri)
db = client["kr_academy"]
courses_col = db["courses"]

# Update remote None ID
res = courses_col.update_one({"title": "IBPS PO Prelims"}, {"$set": {"id": "ibps_po"}})
print("Remote update count:", res.modified_count)

# Update local None ID
client_local = pymongo.MongoClient("mongodb://localhost:27017/")
db_local = client_local["kr_academy"]
res_local = db_local["courses"].update_one({"title": "IBPS PO Prelims"}, {"$set": {"id": "ibps_po"}})
print("Local update count:", res_local.modified_count)
