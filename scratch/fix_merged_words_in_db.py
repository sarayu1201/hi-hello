import os
import json
import re
from pymongo import MongoClient

def separate_merged_words(text):
    if not text:
        return text
    
    fixed = text
    # 1. Correct common merged words
    fixed = re.sub(r'\boftriangle\b', 'of triangle', fixed, flags=re.I)
    fixed = re.sub(r'\bABCandtriangle\b', 'ABC and triangle', fixed, flags=re.I)
    fixed = re.sub(r'\bDEFare\b', 'DEF are', fixed, flags=re.I)
    fixed = re.sub(r'\bofABis\b', 'of AB is', fixed, flags=re.I)
    fixed = re.sub(r'\bIfAB\b', 'If AB', fixed, flags=re.I)
    fixed = re.sub(r'\bangleBis\b', 'angle B is', fixed, flags=re.I)
    fixed = re.sub(r'\bsideAC\b', 'side AC', fixed, flags=re.I)
    fixed = re.sub(r'\bsideBC\b', 'side BC', fixed, flags=re.I)
    fixed = re.sub(r'\bBCandAD\b', 'BC and AD', fixed, flags=re.I)
    fixed = re.sub(r'\bmeetsBA\b', 'meets BA', fixed, flags=re.I)
    fixed = re.sub(r'\bcentreO\b', 'centre O', fixed, flags=re.I)
    fixed = re.sub(r'\blengthof\b', 'length of ', fixed, flags=re.I)
    fixed = re.sub(r'\bvalueof\b', 'value of ', fixed, flags=re.I)
    fixed = re.sub(r'\bIf177\b', 'If 177', fixed, flags=re.I)
    fixed = re.sub(r'\bratio\\frac\b', 'ratio \\frac', fixed, flags=re.I)
    fixed = re.sub(r'\bbridgeof\b', 'bridge of', fixed, flags=re.I)
    fixed = re.sub(r'\bspeedof\b', 'speed of', fixed, flags=re.I)
    fixed = re.sub(r'\btrainof\b', 'train of', fixed, flags=re.I)
    fixed = re.sub(r'\bproductof\b', 'product of', fixed, flags=re.I)
    fixed = re.sub(r'\bperimetersof\b', 'perimeters of', fixed, flags=re.I)
    fixed = re.sub(r'\bareaof\b', 'area of', fixed, flags=re.I)
    
    # 2. Fix missing spaces around triangle/angle indicators and numbers
    fixed = re.sub(r'\btriangle([A-Z])', r'triangle \1', fixed)
    fixed = re.sub(r'\bangle([A-Z])', r'angle \1', fixed)
    fixed = re.sub(r':([0-9])', r': \1', fixed)
    
    # 3. Case-transition rules (camelCase separation)
    # Lowercase-to-Uppercase (e.g. "heightCD" -> "height CD")
    fixed = re.sub(r'([a-z])([A-Z])', r'\1 \2', fixed)
    # Multi-Uppercase-to-Lowercase (e.g. "CDintersects" -> "CD intersects")
    fixed = re.sub(r'([A-Z]{2,})([a-z])', r'\1 \2', fixed)
    
    # 4. Single-Uppercase variable followed by keywords (e.g. "Pand" -> "P and")
    # Using case-insensitive list for keywords
    fixed = re.sub(r'\b([A-Z])(and|are|respectively|is|at|intersects|height|width|length|cm|in|of|to)\b', r'\1 \2', fixed, flags=re.I)
    
    # Correct "Intriangle" and similar shapes
    fixed = re.sub(r'\bIn(triangle|circle|square|rectangle|cone|sphere)\b', r'In \1', fixed, flags=re.I)
    
    # Clean up double spaces
    fixed = re.sub(r'\s+', ' ', fixed).strip()
    return fixed

def run_migration():
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
                
    if not mongo_uri:
        print("Error: MONGODB_URI not found in backend/.env!")
        return
        
    # Parse username, password
    match = re.match(r'mongodb\+srv://([^:]+):([^@]+)@cluster0\.l1t116x\.mongodb.net/([^?]+)\?(.*)', mongo_uri)
    if not match:
        print("Error: Failed to parse MONGODB_URI pattern!")
        return
        
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
    
    print(f"Connecting to live MongoDB database...")
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        print("Connected successfully to Atlas database!")
        
        # Scan and fix files
        json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
        total_questions_updated = 0
        
        for file in sorted(os.listdir(json_dir)):
            if not file.endswith(".json"):
                continue
            filepath = os.path.join(json_dir, file)
            
            with open(filepath, "r", encoding="utf-8") as fj:
                data = json.load(fj)
                
            print(f"\nProcessing {file} for merged words...")
            file_changes = 0
            
            for q in data:
                original_q = q.get("question") or q.get("question_text") or ""
                original_exp = q.get("explanation") or ""
                
                clean_q = separate_merged_words(original_q)
                clean_exp = separate_merged_words(original_exp)
                
                # Check options
                options_changed = False
                for opt in q.get("options", []):
                    original_opt = opt.get("text") or ""
                    clean_opt = separate_merged_words(original_opt)
                    if clean_opt != original_opt:
                        opt["text"] = clean_opt
                        options_changed = True
                
                if clean_q != original_q or clean_exp != original_exp or options_changed:
                    q["question"] = clean_q
                    q["explanation"] = clean_exp
                    file_changes += 1
                    
                    # Update database
                    unique_id = q.get("unique_id")
                    filters = []
                    if unique_id:
                        filters.append({"unique_id": unique_id})
                        alt_uid = unique_id.replace("_2016_", "_2025_").replace("SSCCGL_", "SSCCGLPRELIMS_")
                        filters.append({"unique_id": alt_uid})
                    
                    filters.append({"q": original_q, "source_file": file})
                    
                    for filt in filters:
                        res = questions_col.update_many(
                            filt,
                            {"$set": {
                                "q": clean_q,
                                "explanation": clean_exp,
                                "options": q.get("options")
                            }}
                        )
                        if res.modified_count > 0:
                            total_questions_updated += res.modified_count
                            break
            
            with open(filepath, "w", encoding="utf-8") as fj:
                json.dump(data, fj, indent=2)
                
            print(f"  Fixed {file_changes} questions with merged words on disk for {file}.")
            
        print(f"\nMerged words database correction complete!")
        print(f"Total live MongoDB question documents corrected: {total_questions_updated}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_migration()
