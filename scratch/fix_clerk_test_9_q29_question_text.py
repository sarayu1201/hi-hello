import os
import re
from pymongo import MongoClient

def run_fix():
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
    
    cleaned_text = "He realized (A) he lost his book (B) at school (C) when the teacher (D) asked him to read (E) ."
    
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        # Update ALL question-text-related fields to be clean and single-line
        res = questions_col.update_many(
            {"source_file": "sbi_clerk_test_9.json", "question_number": 29},
            {"$set": {
                "question_text": cleaned_text,
                "q": cleaned_text,
                "question": cleaned_text,
                "raw_question": cleaned_text
            }}
        )
        print(f"Database updated (Matched: {res.matched_count}, Modified: {res.modified_count}).")
        
        # Double check the result
        q = questions_col.find_one({"source_file": "sbi_clerk_test_9.json", "question_number": 29})
        if q:
            print("Verifying Q29 fields in DB:")
            print(f"  question_text: {repr(q.get('question_text'))}")
            print(f"  question: {repr(q.get('question'))}")
            
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run_fix()
