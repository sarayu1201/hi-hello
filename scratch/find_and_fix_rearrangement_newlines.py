import os
import json
import re
from pymongo import MongoClient

def clean_rearrangement_text(text):
    if not text:
        return text
        
    # Check if the text contains rearrangement patterns like (A), (B), (C)
    if "(A)" in text and "(B)" in text and "(C)" in text:
        # Replace newlines followed by markers (A), (B), (C), (D) with spaces
        # e.g., \n(A) ->  (A)
        # e.g., \n (A) ->  (A)
        fixed = re.sub(r'\n+\s*\((A|B|C|D)\)', r' (\1)', text)
        # Clean up any duplicate spaces
        fixed = re.sub(r'[ ]{2,}', ' ', fixed)
        return fixed.strip()
        
    return text

def run_fix():
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
    
    print("Connecting to live MongoDB database...")
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        print("Connected successfully to Atlas database!")
        
        json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
        total_fixed = 0
        
        for file in sorted(os.listdir(json_dir)):
            if not file.endswith(".json"):
                continue
            filepath = os.path.join(json_dir, file)
            
            with open(filepath, "r", encoding="utf-8") as fj:
                data = json.load(fj)
                
            print(f"\nScanning {file}...")
            file_changes = 0
            
            for q in data:
                q_id = q.get("id")
                q_text = q.get("question") or ""
                cleaned_text = clean_rearrangement_text(q_text)
                
                if cleaned_text != q_text:
                    q["question"] = cleaned_text
                    file_changes += 1
                    total_fixed += 1
                    print(f"  Fixed Q{q_id}:\n    BEFORE: {repr(q_text)}\n    AFTER : {repr(cleaned_text)}")
                    
                    # Update DB
                    res = questions_col.update_many(
                        {"source_file": file, "question_number": q_id},
                        {"$set": {"q": cleaned_text, "question": cleaned_text}}
                    )
            
            if file_changes > 0:
                with open(filepath, "w", encoding="utf-8") as fj:
                    json.dump(data, fj, indent=2)
                print(f"  Saved changes to disk for {file}.")
                
        print(f"\nWord rearrangement newlines cleanup complete!")
        print(f"Total questions fixed globally: {total_fixed}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_fix()
