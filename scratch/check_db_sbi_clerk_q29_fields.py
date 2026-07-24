import os
import re
from pymongo import MongoClient
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                mongo_uri = line.split("MONGODB_URI=")[1].strip()
                break
                
    match = re.match(r'mongodb\+srv://([^:]+):([^@]+)@cluster0\.l1t116x\.mongodb.net/([^?]+)\?(.*)', mongo_uri)
    user = match.group(1)
    password = match.group(2)
    dbname = match.group(3)
    params = match.group(4)
    
    nodes = [
        "ac-sdbi3ps-shard-00-00.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-01.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-02.l1t116x.mongodb.net:27017"
    ]
    nodes_str = ",".join(nodes)
    direct_uri = f"mongodb://{user}:{password}@{nodes_str}/{dbname}?ssl=true&authSource=admin&{params}"
    
    client = MongoClient(direct_uri)
    db = client[dbname]
    questions_col = db["questions"]
    
    q = questions_col.find_one({"source_file": "sbi_clerk_test_9.json", "question_number": 29})
    if q:
        print("Keys present in Q29 document:")
        print({k: q.get(k) for k in q.keys() if "question" in k or k == "q"})
    else:
        print("Question 29 not found!")

if __name__ == "__main__":
    check()
