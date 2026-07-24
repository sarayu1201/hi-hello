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
    
    client = MongoClient(direct_uri)
    db = client[dbname]
    questions_col = db["questions"]
    
    results = list(questions_col.find({"question_number": 29}))
    print(f"Total documents found with question_number=29: {len(results)}")
    
    for idx, doc in enumerate(results):
        print(f"\nMatch [{idx}]:")
        print(f"  ID: {doc.get('_id')}")
        print(f"  source_file: {repr(doc.get('source_file'))}")
        print(f"  sub_type: {repr(doc.get('sub_type'))}")
        print(f"  q: {repr(doc.get('q'))}")
        print(f"  question: {repr(doc.get('question'))}")

if __name__ == "__main__":
    check()
