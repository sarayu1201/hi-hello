import os
import json
from pymongo import MongoClient

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_path = os.path.join(root_dir, "QuestionBank", "json", "sbi_po_prelims", "sbipo_test_1.json")
    
    clean_direction = (
        "Directions (23-27) : The five sentences given below are parts of a narrative, "
        "but not necessarily coherent in the current order. Rearrange the sentences to form the correct narrative and answer the question that follow.\n"
        "(A) Also, as the black hole is a dormant one, its discovery by astronomers is an astounding achievement.\n"
        "(B) Astronomers think there are about 100 million black holes in the Milky Way, but almost all of them are invisible.\n"
        "(C) The closest black hole yet found is just 1,560 light-years from Earth, a new study reports.\n"
        "(D) Even though the black hole might be nearest black hole to Earth ever discovered, it is probably not the closest that exists.\n"
        "(E) The black hole, dubbed Gaia BH1, is about 10 times the mass of the sun and orbits a sunlike star."
    )
    
    # 1. Update JSON file
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        modified = False
        for q in data:
            uid = q.get("unique_id")
            if uid in [f"sbi_po_prelims_test1_{i}" for i in range(23, 28)]:
                print(f"Updating direction for {uid}...")
                q["direction"] = clean_direction
                q["raw_direction"] = clean_direction
                modified = True
                
            if uid == "sbi_po_prelims_test1_27":
                print("Updating options for Q27 in JSON...")
                for opt in q.get("options", []):
                    if opt.get("id") == "c":
                        opt["text"] = "DABEC"
                modified = True
                
        if modified:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print("Successfully updated local JSON file!")
        else:
            print("No matching questions found in JSON file.")
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
            
            # Update directions for 23rd to 27th questions
            for i in range(23, 28):
                uid = f"sbi_po_prelims_test1_{i}"
                print(f"Updating direction in DB for {uid}...")
                questions_col.update_one(
                    {"unique_id": uid},
                    {"$set": {
                        "direction": clean_direction,
                        "raw_direction": clean_direction
                    }}
                )
                
            # Update Option C of Question 27 in DB
            print("Updating Question 27 options in DB...")
            q27 = questions_col.find_one({"unique_id": "sbi_po_prelims_test1_27"})
            if q27 and q27.get("options"):
                db_opts = q27.get("options")
                # Format check
                updated_opts = []
                for o in db_opts:
                    if isinstance(o, dict):
                        if o.get("id") == "c" or o.get("id") == "C":
                            o["text"] = "DABEC"
                        updated_opts.append(o)
                    else:
                        # String options
                        if "DABEC 5 |" in str(o):
                            updated_opts.append("DABEC")
                        else:
                            updated_opts.append(o)
                            
                questions_col.update_one(
                    {"unique_id": "sbi_po_prelims_test1_27"},
                    {"$set": {
                        "options": updated_opts,
                        "raw_options": updated_opts
                    }}
                )
                print("Successfully updated DB question 27 options!")
                
        except Exception as e:
            print(f"Error updating MongoDB: {e}")
    else:
        print("Error: MongoDB URI not found in backend/.env")

if __name__ == "__main__":
    run()
