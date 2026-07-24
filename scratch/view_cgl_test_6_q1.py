import os
import json
import re
from pymongo import MongoClient

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. Check local JSON
    path = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims", "sc_cgl_tier1_test6.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if data:
            print("=== LOCAL JSON (Test 6 Q1) ===")
            q1 = data[0]
            print(f"Question:    {repr(q1.get('question'))}")
            print(f"Explanation: {repr(q1.get('explanation'))}")
            
    # 2. Check Database
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
    
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        q = questions_col.find_one({"source_file": "sc_cgl_tier1_test6.json", "question_number": 1})
        if q:
            print("\n=== DATABASE (Test 6 Q1) ===")
            print(f"Question:    {repr(q.get('question'))}")
            print(f"Explanation: {repr(q.get('explanation'))}")
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    check()
