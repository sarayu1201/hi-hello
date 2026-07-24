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
        
        # Find all questions for sbipo_test_9.json
        questions = list(questions_col.find({"source_file": "sbipo_test_9.json"}).sort("question_number", 1))
        
        print(f"Total questions found for sbipo_test_9.json: {len(questions)}")
        for q in questions:
            opts = q.get("options", [])
            if len(opts) > 5:
                print(f"  Q{q.get('question_number')}: options count = {len(opts)}")
                print(f"    Options: {opts}")
                
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    run_search()
