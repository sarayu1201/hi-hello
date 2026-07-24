import os
import shutil
import re
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
    
    # Target image path on disk
    target_img_dir = os.path.join(root_dir, "backend", "uploads", "images", "sbi clerk test 8")
    os.makedirs(target_img_dir, exist_ok=True)
    target_img_path = os.path.join(target_img_dir, "sbi_clerk-q_31_35.png")
    
    # Source generated image
    src_img = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\e1ea14d5-872d-4e86-978b-abfae89d12a1\sbi_clerk_test_8_q31_35_line_graph_1784885760568.png"
    
    # Copy the file
    if os.path.exists(src_img):
        shutil.copy(src_img, target_img_path)
        print(f"Copied generated image to {target_img_path}")
    else:
        print(f"Error: source image {src_img} not found!")
        return
        
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        # Check current DB values and update them
        for q_num in range(31, 36):
            q = questions_col.find_one({"source_file": "sbi_clerk_test_8.json", "question_number": q_num})
            if q:
                print(f"Q{q_num} BEFORE in DB: question_image = {repr(q.get('question_image'))}")
                
                # Make sure the question_image is set to the correct relative path: "sbi clerk test 8/sbi_clerk-q_31_35.png"
                questions_col.update_one(
                    {"_id": q["_id"]},
                    {"$set": {"question_image": "sbi clerk test 8/sbi_clerk-q_31_35.png"}}
                )
                
                q_after = questions_col.find_one({"_id": q["_id"]})
                print(f"Q{q_num} AFTER in DB: question_image = {repr(q_after.get('question_image'))}")
            else:
                print(f"Q{q_num} not found in DB!")
                
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run()
