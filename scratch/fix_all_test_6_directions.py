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
    
    # 1. Update JSON on disk
    disk_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
    with open(disk_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    target_direction_disk = "Directions (90-94): Study the following series carefully and answer the questions given below:\nB 3 @ Y P 8 * K 2 ! W # M 6 O & 4 D U 9 \\$ 7 6 ^ O 5"
    
    for q in data:
        q_id = q.get("id")
        if 90 <= q_id <= 94:
            q["direction"] = target_direction_disk
            
    with open(disk_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Updated directions for Q90-94 on local disk.")

    # 2. Update live database
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        target_direction_db = "Directions (90-94): Study the following series carefully and answer the question given below:\nB 3 @ Y P 8 * K 2 ! W # M 6 O & 4 D U 9 \\$ 7 6 ^ O 5"
        
        res = questions_col.update_many(
            {"source_file": "sbi_clerk_test_6.json", "question_number": {"$gte": 90, "$lte": 94}},
            {"$set": {
                "direction": target_direction_db,
                "raw_direction": target_direction_db
            }}
        )
        print(f"Database updated for Q90-94 directions (Matched: {res.matched_count}, Modified: {res.modified_count}).")
        
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run_fix()
