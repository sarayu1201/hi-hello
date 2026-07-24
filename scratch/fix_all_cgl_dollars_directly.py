import os
import json
import re
from pymongo import MongoClient

def clean_wrapped_dollar_text(text):
    if not text:
        return text
    text = text.strip()
    if text.startswith("$") and text.endswith("$") and text.count("$") == 2:
        inner = text[1:-1].strip()
        
        # 1. Separate common merged words
        inner = re.sub(r'\boftriangle\b', 'of triangle', inner, flags=re.I)
        inner = re.sub(r'\bABCandtriangle\b', 'ABC and triangle', inner, flags=re.I)
        inner = re.sub(r'\bDEFare\b', 'DEF are', inner, flags=re.I)
        inner = re.sub(r'\bofABis\b', 'of AB is', inner, flags=re.I)
        inner = re.sub(r'\bIfAB\b', 'If AB', inner, flags=re.I)
        inner = re.sub(r'\bangleBis\b', 'angle B is', inner, flags=re.I)
        inner = re.sub(r'\bsideAC\b', 'side AC', inner, flags=re.I)
        inner = re.sub(r'\bsideBC\b', 'side BC', inner, flags=re.I)
        inner = re.sub(r'\bBCandAD\b', 'BC and AD', inner, flags=re.I)
        inner = re.sub(r'\bmeetsBA\b', 'meets BA', inner, flags=re.I)
        inner = re.sub(r'\bcentreO\b', 'centre O', inner, flags=re.I)
        inner = re.sub(r'\blengthof\b', 'length of ', inner, flags=re.I)
        inner = re.sub(r'\bvalueof\b', 'value of ', inner, flags=re.I)
        inner = re.sub(r'\bIf177\b', 'If 177', inner, flags=re.I)
        inner = re.sub(r'\bratio\\frac\b', 'ratio \\frac', inner, flags=re.I)
        inner = re.sub(r'\bbridgeof\b', 'bridge of', inner, flags=re.I)
        inner = re.sub(r'\bspeedof\b', 'speed of', inner, flags=re.I)
        inner = re.sub(r'\btrainof\b', 'train of', inner, flags=re.I)
        inner = re.sub(r'\bproductof\b', 'product of', inner, flags=re.I)
        inner = re.sub(r'\bperimetersof\b', 'perimeters of', inner, flags=re.I)
        inner = re.sub(r'\bareaof\b', 'area of', inner, flags=re.I)
        
        # 2. Fix missing spaces around triangle/angle indicators and numbers
        inner = re.sub(r'\btriangle([A-Z])', r'triangle \1', inner)
        inner = re.sub(r'\bangle([A-Z])', r'angle \1', inner)
        inner = re.sub(r'([a-zA-Z]+)([0-9]+)', r'\1 \2', inner)
        inner = re.sub(r'([0-9]+)([a-zA-Z]+)', r'\1 \2', inner)
        inner = re.sub(r':([0-9])', r': \1', inner)
        
        # 3. Clean up LaTeX formatting helpers to plain text
        inner = re.sub(r'\\text\s*\{\s*cm\s*\}', 'cm', inner)
        inner = re.sub(r'\\text\s*\{\s*in sq cm\s*\}', 'in sq cm', inner)
        inner = re.sub(r'\\text\s*\{\s*km/h\s*\}', 'km/h', inner)
        
        # 4. Wrap math symbols back in $
        words = inner.split(" ")
        cleaned_words = []
        for word in words:
            if not word:
                continue
            is_math = any(sym in word for sym in ['\\', '^', '_', '=', '+', '-', '*', '/', '<', '>', ':', '%']) or re.match(r'^\d+$', word) or word in ['x', 'y', 'z', 'a', 'b', 'c', 'p', 'q', 'r']
            if is_math:
                # Clean up existing wrapping
                cleaned_word = word.replace("$", "")
                cleaned_words.append(f"${cleaned_word}$")
            else:
                cleaned_words.append(word)
                
        result = " ".join(cleaned_words)
        result = re.sub(r'\s+', ' ', result).strip()
        result = result.replace("$$", "$")
        return result
    return text

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
                
            print(f"\nProcessing {file}...")
            file_changes = 0
            
            for q in data:
                q_id = q.get("id")
                original_q = q.get("question") or q.get("question_text") or ""
                original_exp = q.get("explanation") or ""
                
                # Apply cleanups
                clean_q = clean_wrapped_dollar_text(original_q)
                clean_exp = clean_wrapped_dollar_text(original_exp)
                
                # Check options
                options_changed = False
                for opt in q.get("options", []):
                    original_opt = opt.get("text") or ""
                    clean_opt = clean_wrapped_dollar_text(original_opt)
                    if clean_opt != original_opt:
                        opt["text"] = clean_opt
                        options_changed = True
                
                # Save changes
                if clean_q != original_q or clean_exp != original_exp or options_changed:
                    # Update JSON structure on disk
                    q["question"] = clean_q
                    q["explanation"] = clean_exp
                    file_changes += 1
                    
                    # Update live database
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
            
            # Save the updated file back to disk
            with open(filepath, "w", encoding="utf-8") as fj:
                json.dump(data, fj, indent=2)
                
            print(f"  Fixed {file_changes} questions on disk for {file}.")
            
        print(f"\nDisk and Database formatting fix complete!")
        print(f"Total live MongoDB Atlas question documents updated: {total_questions_updated}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_migration()
