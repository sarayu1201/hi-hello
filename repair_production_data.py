import pymongo
import re

MONGO_URI = "mongodb+srv://allampallivinaya_db_user:sarayu%40akhil2509@cluster0.l1t116x.mongodb.net/kr_academy?appName=Cluster0"

def repair_data():
    print("Connecting to MongoDB for production repair...")
    client = pymongo.MongoClient(MONGO_URI)
    db = client.kr_academy
    questions_col = db.questions
    
    questions = list(questions_col.find({}))
    print(f"Loaded {len(questions)} questions. Starting repair scan...")
    
    fixed_formulas = 0
    fixed_options = 0
    
    for q in questions:
        q_id = q["_id"]
        q_text = q.get("question", "") or q.get("q", "")
        options = q.get("options", [])
        changed = False
        
        # 1. LaTeX Formula repair
        # Correct uneven dollar signs
        if q_text.count('$') % 2 != 0:
            q_text += "$"
            changed = True
            fixed_formulas += 1
            
        # Clean unescaped '%' inside LaTeX math blocks
        parts = q_text.split('$')
        for i in range(len(parts)):
            if i % 2 != 0: # inside math block
                if "%" in parts[i] and "\\%" not in parts[i]:
                    parts[i] = parts[i].replace("%", "\\%")
                    changed = True
                    fixed_formulas += 1
                if "sqrt" in parts[i] and "\\sqrt" not in parts[i]:
                    parts[i] = parts[i].replace("sqrt", "\\sqrt")
                    changed = True
                    fixed_formulas += 1
        
        if changed:
            q_text = "$".join(parts)
            
        # 2. Options repair (remove placeholder / empty labels)
        new_options = []
        options_changed = False
        
        for idx, opt in enumerate(options):
            opt_text = opt
            is_dict = False
            opt_id = chr(65 + idx)
            
            if isinstance(opt, dict):
                opt_text = opt.get("text", "")
                opt_id = opt.get("id", opt_id)
                is_dict = True
                
            # If empty or placeholder, assign a clean option choice text
            if not opt_text or "placeholder" in str(opt_text).lower() or str(opt_text).strip() == "":
                opt_text = f"Choice {opt_id}"
                options_changed = True
                fixed_options += 1
                
            if is_dict:
                new_options.append({"id": opt_id, "text": opt_text})
            else:
                new_options.append(opt_text)
                
        # Perform DB updates
        update_fields = {}
        if changed:
            update_fields["question"] = q_text
            update_fields["q"] = q_text
        if options_changed:
            update_fields["options"] = new_options
            
        if update_fields:
            questions_col.update_one({"_id": q_id}, {"$set": update_fields})
            
    print("\n----------------------------------------------------")
    print("Database Self-Healing Repair Report")
    print("----------------------------------------------------")
    print(f"Total Malformed LaTeX Formulas Repaired: {fixed_formulas}")
    print(f"Total Placeholder Option Labels Corrected: {fixed_options}")
    print("----------------------------------------------------")

if __name__ == "__main__":
    repair_data()
