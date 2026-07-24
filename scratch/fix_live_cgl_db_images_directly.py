import os
import json
import re
from pymongo import MongoClient

def run_migration():
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
        
    print("Found MONGODB_URI in env file.")
    
    # Parse username, password and replica parameters
    # example: mongodb+srv://username:password@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0
    match = re.match(r'mongodb\+srv://([^:]+):([^@]+)@cluster0\.l1t116x\.mongodb.net/([^?]+)\?(.*)', mongo_uri)
    if not match:
        print("Error: Failed to parse MONGODB_URI pattern!")
        return
        
    user = match.group(1)
    password = match.group(2)
    dbname = match.group(3) # kr_academy
    params = match.group(4)
    
    # Direct nodes resolved via Google DNS
    nodes = [
        "ac-sdbi3ps-shard-00-00.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-01.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-02.l1t116x.mongodb.net:27017"
    ]
    nodes_str = ",".join(nodes)
    
    # Construct direct connection string (using standard mongodb:// protocol, bypassing SRV lookup)
    direct_uri = f"mongodb://{user}:{password}@{nodes_str}/{dbname}?ssl=true&authSource=admin&{params}"
    
    print(f"Connecting to live MongoDB Atlas directly (SSL enabled, db: {dbname})...")
    
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        # Test connection
        db.list_collection_names()
        print("Connected successfully to the live Atlas database!")
        
        # Process files
        json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
        total_questions_updated = 0
        
        for file in sorted(os.listdir(json_dir)):
            if not file.endswith(".json"):
                continue
            filepath = os.path.join(json_dir, file)
            
            with open(filepath, "r", encoding="utf-8") as fj:
                data = json.load(fj)
                
            print(f"\nProcessing {file} ({len(data)} questions)...")
            file_updates = 0
            
            for q in data:
                q_text = q.get("question_text") or q.get("q") or q.get("question") or ""
                clean_q = q_text
                if clean_q.startswith("ParsedQuestion:"):
                    clean_q = clean_q.replace("ParsedQuestion:", "").strip()
                    
                q_img = q.get("question_image") or q.get("questionImage") or ""
                opt_imgs = q.get("option_images") or q.get("optionImages") or []
                
                # Check if there is an image to sync
                if q_img or any(opt_imgs):
                    # Try matching by unique_id or by exact q & source_file
                    filters = []
                    if q.get("unique_id"):
                        filters.append({"unique_id": q.get("unique_id")})
                        # Also add fallback unique_id with 2025/2016 variance
                        alt_uid = q.get("unique_id").replace("_2016_", "_2025_").replace("SSCCGL_", "SSCCGLPRELIMS_")
                        filters.append({"unique_id": alt_uid})
                        
                    filters.append({"q": clean_q, "source_file": file})
                    
                    # Run update
                    for filt in filters:
                        result = questions_col.update_many(
                            filt,
                            {"$set": {
                                "question_image": q_img,
                                "option_images": opt_imgs
                            }}
                        )
                        if result.modifiedCount > 0:
                            file_updates += result.modifiedCount
                            total_questions_updated += result.modifiedCount
                            break # matched successfully
                            
            print(f"  Updated {file_updates} question images in DB for {file}.")
            
        print(f"\nImage database migration complete!")
        print(f"Total question documents updated in live MongoDB Atlas: {total_questions_updated}")
        
    except Exception as e:
        print(f"Error during direct database migration: {e}")

if __name__ == "__main__":
    run_migration()
