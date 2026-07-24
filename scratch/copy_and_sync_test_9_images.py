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
    
    target_img_dir = os.path.join(root_dir, "backend", "uploads", "images", "sbi clerk test 9")
    os.makedirs(target_img_dir, exist_ok=True)
    
    # Target paths
    target_img_43_47 = os.path.join(target_img_dir, "sbi_clerk-q_43_47.png")
    target_img_48_52 = os.path.join(target_img_dir, "sbi_clerk-q_48_52.png")
    
    # Generated source images
    src_43_47 = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\e1ea14d5-872d-4e86-978b-abfae89d12a1\sbi_clerk_test_9_q43_47_line_graph_1784886489835.png"
    src_48_52 = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\e1ea14d5-872d-4e86-978b-abfae89d12a1\sbi_clerk_test_9_q48_52_table_1784886504698.png"
    
    # Copy files
    if os.path.exists(src_43_47):
        shutil.copy(src_43_47, target_img_43_47)
        print(f"Copied runs line graph to {target_img_43_47}")
    else:
        print(f"Error: Run graph {src_43_47} not found!")
        return
        
    if os.path.exists(src_48_52):
        shutil.copy(src_48_52, target_img_48_52)
        print(f"Copied book sales table to {target_img_48_52}")
    else:
        print(f"Error: Table image {src_48_52} not found!")
        return
        
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        # Verify and force-update DB references
        for q_num in range(43, 48):
            q = questions_col.find_one({"source_file": "sbi_clerk_test_9.json", "question_number": q_num})
            if q:
                questions_col.update_one(
                    {"_id": q["_id"]},
                    {"$set": {"question_image": "sbi clerk test 9/sbi_clerk-q_43_47.png"}}
                )
        print("Verified and updated DB question_image fields for Q43-47.")
        
        for q_num in range(48, 53):
            q = questions_col.find_one({"source_file": "sbi_clerk_test_9.json", "question_number": q_num})
            if q:
                questions_col.update_one(
                    {"_id": q["_id"]},
                    {"$set": {"question_image": "sbi clerk test 9/sbi_clerk-q_48_52.png"}}
                )
        print("Verified and updated DB question_image fields for Q48-52.")
        
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run()
