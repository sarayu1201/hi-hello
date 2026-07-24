import os
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
        
        # Search all documents containing the question text
        docs = list(questions_col.find({"q": {"$regex": "sixth to the right of the twelfth", "$options": "i"}}))
        print(f"Found {len(docs)} matching documents in DB:")
        for idx, d in enumerate(docs):
            print(f"\n--- Document {idx+1} ---")
            print(f"  _id: {d.get('_id')}")
            print(f"  unique_id: {repr(d.get('unique_id'))}")
            print(f"  source_file: {repr(d.get('source_file'))}")
            print(f"  sub_type: {repr(d.get('sub_type'))}")
            print(f"  question_number: {repr(d.get('question_number'))}")
            print(f"  direction: {repr(d.get('direction'))}")
            print(f"  options: {repr(d.get('options'))}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
