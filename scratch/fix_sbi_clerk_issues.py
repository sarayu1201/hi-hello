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
                
    if not mongo_uri:
        print("Error: MONGODB_URI not found in backend/.env!")
        return
        
    # Parse username, password
    match = re.match(r'mongodb\+srv://([^:]+):([^@]+)@cluster0\.l1t116x\.mongodb.net/([^?]+)\?(.*)', mongo_uri)
    if not match:
        print("Error: Failed to parse MONGODB_URI pattern!")
        return
        
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
        
        json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
        total_directions_cleared = 0
        total_images_cleared = 0
        
        for file in sorted(os.listdir(json_dir)):
            if not file.endswith(".json"):
                continue
            filepath = os.path.join(json_dir, file)
            
            with open(filepath, "r", encoding="utf-8") as fj:
                data = json.load(fj)
                
            print(f"\nProcessing {file}...")
            file_direction_changes = 0
            file_image_changes = 0
            
            for q in data:
                q_id = q.get("id")
                direction = q.get("direction") or ""
                
                # Check 1: Parse range from direction text (e.g. "Directions (81-85)" or "Directions (3)")
                range_match = re.search(r'Direction[s]?\s*\((\d+)(?:-(\d+))?\)', direction, re.IGNORECASE)
                if range_match:
                    start_val = int(range_match.group(1))
                    end_val = int(range_match.group(2)) if range_match.group(2) else start_val
                    
                    # If question number falls outside this range, it's an unrelated/unwanted direction!
                    if q_id < start_val or q_id > end_val:
                        q["direction"] = None
                        file_direction_changes += 1
                        total_directions_cleared += 1
                        
                        # Clear in DB
                        questions_col.update_many(
                            {"source_file": file, "question_number": q_id},
                            {"$set": {"direction": "", "raw_direction": ""}}
                        )
                
                # Check 2: Remove the incorrect pie chart image in Test 3 Question 72
                if file == "sbi_clerk_test_3.json" and q_id == 72:
                    q["questionImage"] = None
                    file_image_changes += 1
                    total_images_cleared += 1
                    
                    # Clear in DB
                    questions_col.update_many(
                        {"source_file": file, "question_number": q_id},
                        {"$set": {"question_image": ""}}
                    )
                    print(f"  Removed incorrect pie chart image from Q72 in DB.")
            
            # Save updated file to disk
            with open(filepath, "w", encoding="utf-8") as fj:
                json.dump(data, fj, indent=2)
                
            print(f"  Fixed: Cleared {file_direction_changes} incorrect directions on disk for {file}.")
            
        print(f"\nSBI Clerk clean-up complete!")
        print(f"Total incorrect direction paragraphs cleared globally: {total_directions_cleared}")
        print(f"Total incorrect images removed: {total_images_cleared}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_fix()
