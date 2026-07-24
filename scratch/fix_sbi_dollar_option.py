import os
import json
import re
from pymongo import MongoClient

def run_fix():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    if not os.path.exists(env_path):
        print("Error: backend/.env not found!")
        return
        
    # Read MONGODB_URI
    mongo_uri = None
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
    
    print("Connecting to live MongoDB database...")
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        print("Connected successfully to Atlas database!")
        
        # 1. Update sbi_clerk_test_6.json on disk
        path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            if q.get("id") == 90:
                # Escape the dollar in direction text
                direction = q.get("direction") or ""
                if " 9 $ 7 6 " in direction:
                    q["direction"] = direction.replace(" 9 $ 7 6 ", " 9 \\$ 7 6 ")
                    print("  Escaped dollar in direction text on disk.")
                
                # Escape the dollar in Option D
                for opt in q.get("options", []):
                    if opt.get("id") == "D":
                        opt["text"] = "\\$"
                        print("  Changed Option D to escaped dollar '\\$' on disk.")
                        
        # Save updated json back to disk
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        # 2. Update MongoDB database representation
        # Retrieve the updated option structure for Q90
        updated_options = None
        updated_direction = None
        for q in data:
            if q.get("id") == 90:
                # Convert options to DB format (list of strings representing the text)
                updated_options = [opt.get("text") for opt in q.get("options", [])]
                updated_direction = q.get("direction")
                break
                
        if updated_options:
            res = questions_col.update_many(
                {"source_file": "sbi_clerk_test_6.json", "question_number": 90},
                {"$set": {
                    "options": updated_options,
                    "direction": updated_direction,
                    "raw_direction": updated_direction
                }}
            )
            print(f"  Database updated for Q90 (Modified count: {res.modified_count}).")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_fix()
