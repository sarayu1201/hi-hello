import os
import json
import re
from pymongo import MongoClient

def run_sync():
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
        
        # We will scan ssc_cgl_prelims and sbi clerk folders on disk to build the source of truth
        folders = [
            os.path.join(root_dir, "QuestionBank", "json", "sbi clerk"),
            os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
        ]
        
        disk_images = {} # Map (source_file, question_number) -> has_image (True/False)
        
        for folder in folders:
            if not os.path.exists(folder):
                continue
            for file in os.listdir(folder):
                if not file.endswith(".json"):
                    continue
                filepath = os.path.join(folder, file)
                with open(filepath, "r", encoding="utf-8") as fj:
                    data = json.load(fj)
                    
                for q in data:
                    q_id = q.get("id")
                    q_img = q.get("questionImage") or q.get("question_image")
                    has_image = bool(q_img and q_img.strip())
                    disk_images[(file, q_id)] = has_image
                    
        # Now, query the database for all questions with a non-empty question_image
        db_questions_with_image = list(questions_col.find(
            {"question_image": {"$exists": True, "$ne": "", "$ne": None}}
        ))
        
        print(f"\nFound {len(db_questions_with_image)} questions in DB that currently have a question_image.")
        total_images_cleared = 0
        
        for db_q in db_questions_with_image:
            source_file = db_q.get("source_file")
            question_number = db_q.get("question_number")
            db_img = db_q.get("question_image")
            
            # Look up in our disk source of truth
            key = (source_file, question_number)
            if key in disk_images:
                disk_has_image = disk_images[key]
                if not disk_has_image:
                    # Disk says there should be NO image, but DB has one!
                    print(f"  Unnecessary image found: {source_file} Q{question_number} has '{db_img}' in DB but None on disk. Clearing...")
                    questions_col.update_one(
                        {"_id": db_q["_id"]},
                        {"$set": {"question_image": ""}}
                    )
                    total_images_cleared += 1
            else:
                # If the test is not in sbi clerk or ssc_cgl folders, skip it to avoid deleting valid images from other exams
                pass
                
        print(f"\nJunk image clean-up complete!")
        print(f"Total unnecessary database images cleared: {total_images_cleared}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_sync()
