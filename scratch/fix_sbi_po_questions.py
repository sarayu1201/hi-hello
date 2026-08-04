import os
import json
from pymongo import MongoClient

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_path = os.path.join(root_dir, "QuestionBank", "json", "sbi_po_prelims", "sbipo_test_1.json")
    
    updates = {
        "sbi_po_prelims_test1_14": "Nearly four years have **withdrawal (A)** since China's **decided (B)** from the project before Nepal **passed (C)** to grant the project to India.",
        "sbi_po_prelims_test1_15": "India ranks **high (A)** **quite (B)** in the list of countries that make regular requests for removal of **online (C)** content.",
        "sbi_po_prelims_test1_16": "The Indian Railways' **started (A)** to introduce AC III tier economy class **coaches (B)** has **experiment (C)** to pay off.",
        "sbi_po_prelims_test1_17": "During the **bagging (A)** of the **peak (B)** season, we keep seeing news about engineering graduates **placement (C)** job offers worth lakhs of rupees.",
        "sbi_po_prelims_test1_18": "Down a narrow street **attention (A)** the seawall, another fisherman draws **hugging (B)** to his house, whose roof has been tightly **protect (C)** in blue tarpaulin to **wrapped (D)** it from the waves."
    }
    
    # 1. Update JSON file
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        modified = False
        for q in data:
            uid = q.get("unique_id")
            if uid in updates:
                new_q = updates[uid]
                print(f"Updating JSON question {uid}: '{q.get('question')}' -> '{new_q}'")
                q["question"] = new_q
                q["q"] = new_q
                q["raw_question"] = new_q
                modified = True
                
        if modified:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print("Successfully updated local JSON file!")
        else:
            print("No matching questions found in local JSON file.")
    else:
        print(f"Error: JSON file not found at {json_path}")
        
    # 2. Update MongoDB
    mongo_uri = None
    env_file = os.path.join(root_dir, "backend", ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("MONGODB_URI="):
                    mongo_uri = line.split("=", 1)[1].strip()
                    break
                    
    if mongo_uri:
        try:
            print("Connecting to MongoDB database...")
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client.kr_academy
            questions_col = db.questions
            print("Connected to MongoDB successfully!")
            
            for uid, new_q in updates.items():
                print(f"Updating MongoDB question {uid}...")
                res = questions_col.update_one(
                    {"unique_id": uid},
                    {"$set": {
                        "question": new_q,
                        "q": new_q,
                        "raw_question": new_q
                    }}
                )
                print(f"  Matched count: {res.matched_count}, Modified count: {res.modified_count}")
        except Exception as e:
            print(f"Error updating MongoDB: {e}")
    else:
        print("Error: MongoDB URI not found in backend/.env")

if __name__ == "__main__":
    run()
