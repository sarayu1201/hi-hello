import pymongo

remote_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(remote_uri)
db = client["kr_academy"]
courses_col = db["courses"]

res = courses_col.update_one(
    {"id": "ibps_po"},
    {"$set": {"logoType": "ibps"}}
)

print(f"Update result: matched={res.matched_count}, modified={res.modified_count}")
