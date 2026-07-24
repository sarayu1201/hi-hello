import os
import json
import re
from pymongo import MongoClient

def clean_stray_text(text):
    if not text:
        return text
    
    # Specific fix for spelling cutoff
    if text.strip().startswith("None of thes") and "\n" in text:
        return "None of these"
        
    # Check for double newline separator
    if "\n\n" in text:
        part = text.split("\n")[0].strip()
        if text.startswith("$") and not part.endswith("$"):
            part = part + "$"
        return part
        
    # Check for "Solutions" on new line
    if "\n" in text and "solutions" in text.lower():
        part = text.split("\n")[0].strip()
        if text.startswith("$") and not part.endswith("$"):
            part = part + "$"
        return part
        
    # Check for test_10 Q43 A\nB\nC\nD layout
    if "\nA\nB\nC\nD" in text:
        part = text.split("\n")[0].strip()
        return part
        
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
        total_options_cleaned = 0
        
        for file in sorted(os.listdir(json_dir)):
            if not file.endswith(".json"):
                continue
            filepath = os.path.join(json_dir, file)
            
            with open(filepath, "r", encoding="utf-8") as fj:
                data = json.load(fj)
                
            print(f"\nProcessing {file}...")
            file_changes = 0
            
            for q in data:
                q_id = q.get("id")
                options_changed = False
                
                for opt in q.get("options", []):
                    original_opt = opt.get("text") or ""
                    cleaned_opt = clean_stray_text(original_opt)
                    
                    if cleaned_opt != original_opt:
                        opt["text"] = cleaned_opt
                        options_changed = True
                        file_changes += 1
                        total_options_cleaned += 1
                        print(f"  Q{q_id} Option {opt.get('id')}: {repr(original_opt)} -> {repr(cleaned_opt)}")
                
                # If changed, write to DB
                if options_changed:
                    res = questions_col.update_many(
                        {"source_file": file, "question_number": q_id},
                        {"$set": {"options": q.get("options")}}
                    )
            
            # Save file to disk
            with open(filepath, "w", encoding="utf-8") as fj:
                json.dump(data, fj, indent=2)
                
            print(f"  Fixed {file_changes} option formatting issues on disk for {file}.")
            
        print(f"\nOption formatting clean-up complete!")
        print(f"Total options cleaned up globally: {total_options_cleaned}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_fix()
