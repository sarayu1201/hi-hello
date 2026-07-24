import os
import json
import re
from pymongo import MongoClient

def check():
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
        
        # Query where test_id is sbi_clerk_test_3 and display_question_number or question_number is 72 or 7 (Reasoning Q7 is ID 72)
        q = questions_col.find_one({"test_id": "sbi_clerk_test_3", "id": 72})
        if q:
            print("FOUND Question 72 in DB:")
            print(f"  q text: {repr(q.get('q'))}")
            print(f"  question_image: {repr(q.get('question_image'))}")
            print(f"  option_images: {repr(q.get('option_images'))}")
        else:
            print("Question 72 not found in DB.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
