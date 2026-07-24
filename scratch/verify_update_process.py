import os
import re
import urllib.request
import json
from pymongo import MongoClient

def run():
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
    
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        # Step 1: Print current options
        q = questions_col.find_one({"source_file": "sbi_clerk_test_6.json", "question_number": 90})
        print("1. BEFORE UPDATE in DB:", q.get("options") if q else "Not found")
        
        # Step 2: Update options
        res = questions_col.update_one(
            {"source_file": "sbi_clerk_test_6.json", "question_number": 90},
            {"$set": {"options": ["D", "U", "9", "\\$", "T"]}}
        )
        print(f"2. UPDATE PERFORMED (Matched: {res.matched_count}, Modified: {res.modified_count})")
        
        # Step 3: Print immediately after update
        q_after = questions_col.find_one({"source_file": "sbi_clerk_test_6.json", "question_number": 90})
        print("3. IMMEDIATELY AFTER UPDATE in DB:", q_after.get("options") if q_after else "Not found")
        
        # Step 4: Query API
        headers = {"User-Agent": "Mozilla/5.0"}
        url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=Banking&sub_type=SBI%20Clerk%20Prelims%20-%20Test%206&test_id=sbi_clerk_test_6"
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                questions = data.get("questions", [])
                api_q = next((item for item in questions if item.get("question_number") == 90 or item.get("id") == 90), None)
                print("4. LIVE API VALUE FOR Q90 OPTIONS:", api_q.get("options") if api_q else "Not found in API")
        except Exception as e:
            print("Failed to query live API:", e)
            
    except Exception as e:
        print("MongoDB connection error:", e)

if __name__ == "__main__":
    run()
