import os
import json
import re
from pymongo import MongoClient

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
        
        # 1. FIX sbi_clerk_test_5.json
        path_5 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_5.json")
        with open(path_5, "r", encoding="utf-8") as f:
            data_5 = json.load(f)
            
        direction_text_40_50 = "Direction (40 – 50): What will come in the place of question (?) mark in following question."
        
        for q in data_5:
            q_id = q.get("id")
            
            # Clean up Word Swaps (Q5 to Q9)
            if q_id in [5, 6, 7, 8, 9]:
                original_q = q.get("question")
                # Strip newlines and spaces
                cleaned_q = re.sub(r'\s+', ' ', original_q).strip()
                # Remove trailing stray digits like " 2" from OCR
                cleaned_q = re.sub(r'\s+\d+$', '', cleaned_q)
                q["question"] = cleaned_q
                
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_5.json", "question_number": q_id},
                    {"$set": {"q": cleaned_q, "question": cleaned_q}}
                )
                print(f"  Fixed Word Swap newlines for Test 5 Q{q_id}.")
                
            # Clean up Option E of Q39
            if q_id == 39:
                for opt in q.get("options", []):
                    if opt.get("id") == "E":
                        opt["text"] = "$280$"
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_5.json", "question_number": 39},
                    {"$set": {
                        "options": q.get("options")
                    }}
                )
                print(f"  Fixed Test 5 Q39 Option E text.")
                
            # Set directions for Q40 to Q50
            if 40 <= q_id <= 50:
                q["direction"] = direction_text_40_50
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_5.json", "question_number": q_id},
                    {"$set": {
                        "direction": direction_text_40_50,
                        "raw_direction": direction_text_40_50
                    }}
                )
                print(f"  Set direction for Test 5 Q{q_id}.")
                
            # MATHBLOCK in Test 5 Q42
            if q_id == 42:
                formula = r"$\frac{(30\% \text{ of }4200 + 10\% \text{ of } 1200)}{1380} = ?$"
                q["question"] = f"What will come in the place of question mark (?) in the following question?\n{formula}"
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_5.json", "question_number": 42},
                    {"$set": {
                        "q": q["question"],
                        "question": q["question"]
                    }}
                )
                print(f"  Fixed MATHBLOCK for Test 5 Q42.")
                
        # Save Test 5 back
        with open(path_5, "w", encoding="utf-8") as f:
            json.dump(data_5, f, indent=2)
            
        # 2. FIX sbi_clerk_test_6.json
        path_6 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
        with open(path_6, "r", encoding="utf-8") as f:
            data_6 = json.load(f)
            
        for q in data_6:
            q_id = q.get("id")
            
            # Clean up Option E of Q4
            if q_id == 4:
                for opt in q.get("options", []):
                    if opt.get("id") == "E":
                        opt["text"] = "All are correct"
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_6.json", "question_number": 4},
                    {"$set": {
                        "options": q.get("options")
                    }}
                )
                print(f"  Fixed Test 6 Q4 Option E text.")
                
            # MATHBLOCK in Test 6 Q41
            if q_id == 41:
                formula = r"$55\% \text{ of } 300 - 424 = ?$"
                q["question"] = f"What will come in the place of question mark (?) in the following question?\n{formula}"
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_6.json", "question_number": 41},
                    {"$set": {
                        "q": q["question"],
                        "question": q["question"]
                    }}
                )
                print(f"  Fixed MATHBLOCK for Test 6 Q41.")
                
        # Save Test 6 back
        with open(path_6, "w", encoding="utf-8") as f:
            json.dump(data_6, f, indent=2)
            
        # 3. FIX sbi_clerk_test_7.json
        path_7 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_7.json")
        with open(path_7, "r", encoding="utf-8") as f:
            data_7 = json.load(f)
            
        for q in data_7:
            q_id = q.get("id")
            # MATHBLOCK in Test 7 Q54
            if q_id == 54:
                formula = r"$?^2 = 23^2 - (3 \times 2)^2 - 31 \times 3$"
                q["question"] = f"What will come in the place of question mark (?) in the following question?\n{formula}"
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_7.json", "question_number": 54},
                    {"$set": {
                        "q": q["question"],
                        "question": q["question"]
                    }}
                )
                print(f"  Fixed MATHBLOCK for Test 7 Q54.")
                
        # Save Test 7 back
        with open(path_7, "w", encoding="utf-8") as f:
            json.dump(data_7, f, indent=2)
            
        # 4. FIX sbi_clerk_test_10.json
        path_10 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_10.json")
        with open(path_10, "r", encoding="utf-8") as f:
            data_10 = json.load(f)
            
        for q in data_10:
            q_id = q.get("id")
            # MATHBLOCK in Test 10 Q61
            if q_id == 61:
                formula = r"$9990 \div 10 + 4769 - 4731 = ?$"
                q["question"] = f"What will come in the place of question mark (?) in the following question?\n{formula}"
                # Update DB
                questions_col.update_many(
                    {"source_file": "sbi_clerk_test_10.json", "question_number": 61},
                    {"$set": {
                        "q": q["question"],
                        "question": q["question"]
                    }}
                )
                print(f"  Fixed MATHBLOCK for Test 10 Q61.")
                
        # Save Test 10 back
        with open(path_10, "w", encoding="utf-8") as f:
            json.dump(data_10, f, indent=2)
            
        print("\nAll custom fixes applied successfully to disk and database!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_fix()
