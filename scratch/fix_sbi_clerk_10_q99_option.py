import os
import re
from pymongo import MongoClient
import json

def run_fix():
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
    
    # 1. Update local JSON on disk
    disk_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_10.json")
    with open(disk_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 99:
            # Change Option E from 'Son' to 'Cannot be determined'
            for opt in q.get("options", []):
                if opt.get("id") == "E":
                    opt["text"] = "Cannot be determined"
            break
            
    with open(disk_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Updated Option E text for Q99 in sbi_clerk_test_10.json on disk.")
    
    # 2. Update live MongoDB database
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        q = questions_col.find_one({"source_file": "sbi_clerk_test_10.json", "question_number": 99})
        if q:
            opts = q.get("options", [])
            # Update options list
            for idx, opt in enumerate(opts):
                # Check if opt is dict or string
                if isinstance(opt, dict) and opt.get("id") == "E":
                    opt["text"] = "Cannot be determined"
                elif isinstance(opt, str) and idx == 4:
                    opts[idx] = "Cannot be determined"
            
            res = questions_col.update_one(
                {"_id": q["_id"]},
                {"$set": {
                    "options": opts,
                    "raw_options": opts
                }}
            )
            print(f"Database updated for Q99 options (Matched: {res.matched_count}, Modified: {res.modified_count}).")
        else:
            print("Question 99 not found in DB!")
            
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run_fix()
