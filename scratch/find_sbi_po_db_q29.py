import os
import re
from pymongo import MongoClient

def run_search():
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
        
        # Search by regex in explanation
        q = questions_col.find_one({"explanation": {"$regex": "levels in the city", "$options": "i"}})
        if q:
            print("FOUND matching question in DB:")
            print(f"  ID: {q.get('_id')}")
            print(f"  source_file: {repr(q.get('source_file'))}")
            print(f"  exam_type: {repr(q.get('exam_type'))}")
            print(f"  sub_type: {repr(q.get('sub_type'))}")
            print(f"  question_number: {q.get('question_number')}")
            print(f"  question_text: {repr(q.get('q') or q.get('question'))}")
            print("  options:")
            for opt in q.get("options", []):
                print(f"    {opt.get('id')}: {repr(opt.get('text'))}")
            print(f"  explanation: {repr(q.get('explanation'))}")
        else:
            print("No matching question found in DB")
            
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run_search()
