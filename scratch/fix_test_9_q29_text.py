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
    
    cleaned_text = "He realized (A) he lost his book (B) at school (C) when the teacher (D) asked him to read (E) ."
    
    # 1. Update local JSON on disk
    disk_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    with open(disk_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 29:
            q["question"] = cleaned_text
            
    with open(disk_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Updated Question 29 text locally in sbi_clerk_test_9.json.")
    
    # 2. Update live MongoDB database
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        res = questions_col.update_many(
            {"source_file": "sbi_clerk_test_9.json", "question_number": 29},
            {"$set": {
                "q": cleaned_text,
                "question": cleaned_text
            }}
        )
        print(f"Database updated for Q29 text (Matched: {res.matched_count}, Modified: {res.modified_count}).")
        
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run_fix()
