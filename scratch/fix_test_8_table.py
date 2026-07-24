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
    
    # 1. Format the new direction text with the clean table
    formatted_direction = (
        "Directions (36-40): The table given below shows the number of students from "
        "two different schools playing three different games i.e. cricket, hockey and football.\n\n"
        "-------------------------------------\n"
        "| Games    |  School A  |  School B  |\n"
        "-------------------------------------\n"
        "| Cricket  |     20     |     35     |\n"
        "| Hockey   |     25     |     30     |\n"
        "| Football |     64     |     36     |\n"
        "-------------------------------------"
    )
    
    # 2. Update local JSON on disk
    disk_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_8.json")
    with open(disk_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        q_id = q.get("id")
        if 36 <= q_id <= 40:
            q["direction"] = formatted_direction
            
    with open(disk_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Updated direction table layout in sbi_clerk_test_8.json on local disk.")
    
    # 3. Update live MongoDB database
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        res = questions_col.update_many(
            {"source_file": "sbi_clerk_test_8.json", "question_number": {"$gte": 36, "$lte": 40}},
            {"$set": {
                "direction": formatted_direction,
                "raw_direction": formatted_direction
            }}
        )
        print(f"Database updated for Q36-40 directions (Matched: {res.matched_count}, Modified: {res.modified_count}).")
        
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run_fix()
