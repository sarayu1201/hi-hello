import os
import re
from pymongo import MongoClient
import json

def inspect():
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
    
    # List of polluted question numbers
    polluted_ids = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 18, 19, 28, 29, 30, 36, 37, 38, 39, 58, 75]
    
    for q_num in polluted_ids:
        q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": q_num})
        if q:
            print(f"\n=================== Q{q_num} ===================")
            print(f"Question: {repr(q.get('question'))}")
            print(f"Options: {q.get('options')}")
            print(f"Correct Index (correct): {q.get('correct')}")
            print(f"Correct Option: {repr(q.get('correct_option'))}")
            print(f"Correct Answer: {repr(q.get('correct_answer'))}")
            print(f"Correct Letter: {repr(q.get('correct_letter'))}")
            print(f"Explanation (first 150 chars): {repr(q.get('explanation')[:150] if q.get('explanation') else '')}")

if __name__ == "__main__":
    inspect()
