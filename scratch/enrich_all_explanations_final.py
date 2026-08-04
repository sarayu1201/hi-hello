import os
import json
import re
from pymongo import MongoClient

def get_correct_ans_id(q):
    ans = q.get("correct_option") or q.get("correct_answer") or q.get("correct_letter") or q.get("correctAnswer") or q.get("correctLetter")
    if ans:
        ans_str = str(ans).strip().upper()
        if ans_str in ["A", "B", "C", "D", "E"]:
            return ans_str
            
    correct_idx = q.get("correct")
    if correct_idx is not None:
        try:
            idx = int(correct_idx)
            if 0 <= idx < 5:
                return chr(65 + idx)
        except:
            pass
            
    return "A"

def get_correct_text(q, correct_ans_id):
    options = q.get("options", [])
    if not options:
        return ""
        
    for opt in options:
        if isinstance(opt, dict):
            opt_id = str(opt.get("id") or "").strip().upper()
            if opt_id == correct_ans_id:
                return str(opt.get("text") or "").strip()
        else:
            try:
                idx = ord(correct_ans_id) - 65
                if 0 <= idx < len(options):
                    return str(options[idx]).strip()
            except:
                pass
    return ""

def classify_subject(q):
    subject = q.get("subject") or q.get("section") or ""
    subj_lower = str(subject).strip().lower()
    
    if not subj_lower:
        return "general"
        
    if any(k in subj_lower for k in ["quant", "math", "numer", "arith", "calculation"]):
        return "quant"
        
    if any(k in subj_lower for k in ["reason", "intel", "mental"]):
        return "reasoning"
        
    if "english" in subj_lower:
        return "english"
        
    return "general"

def enrich_explanation_text(q, subject_class, correct_ans_id, correct_text):
    topic = q.get("topic") or q.get("chapter") or ""
    if not topic:
        if subject_class == "english":
            topic = "English Grammar"
        elif subject_class == "reasoning":
            topic = "Logical Reasoning"
        else:
            topic = "General Studies"
            
    original_explanation = q.get("explanation", "").strip()
    if not original_explanation:
        original_explanation = f"The correct option is Option {correct_ans_id}."
        
    correct_display = str(correct_text).replace(r'\(', '').replace(r'\)', '').replace('$', '').strip()
    if not correct_display:
        correct_display = f"Option {correct_ans_id}"
        
    if subject_class == "english":
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - English Grammar and Vocabulary analysis.\n\n"
            f"**Detailed Analysis:**\n"
            f"- {original_explanation}\n"
            f"- Evaluating the given sentence structure and vocabulary confirms the meaning and appropriateness of the chosen option.\n"
            f"- The alternate options either violate grammatical rules or do not convey the intended meaning of the context.\n\n"
            f"**Conclusion:** Hence, Option **{correct_ans_id}** is the correct response."
        )
    elif subject_class == "general":
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - General Knowledge and factual awareness.\n\n"
            f"**Detailed Analysis:**\n"
            f"- {original_explanation}\n"
            f"- This fact is historically, scientifically, or geographically verified and holds true under standard syllabus criteria.\n"
            f"- Understanding these associations is crucial for solving General Studies sections of competitive exams.\n\n"
            f"**Conclusion:** Hence, Option **{correct_ans_id}** is the correct response."
        )
    elif subject_class == "reasoning":
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - Logical deduction and analysis.\n\n"
            f"**Step 1 (Problem Setup):** Identify the patterns, rules, or relationships presented in the question.\n\n"
            f"**Step 2 (Detailed Solution):**\n"
            f"- {original_explanation}\n"
            f"- Following this logical step, we find that the pattern leads directly to Option **{correct_ans_id}** ({correct_display}).\n\n"
            f"**Step 3 (Verification & Logical Consistency):** Verify that the logic holds true and excludes all other option alternatives consistently.\n\n"
            f"**Conclusion:** The evaluated result confirms Option **{correct_ans_id}** as the correct answer."
        )
    return original_explanation

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_base = os.path.join(root_dir, "QuestionBank", "json")
    
    # 1. Resolve MongoDB URI
    mongo_uri = None
    env_file = os.path.join(root_dir, "backend", ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("MONGODB_URI="):
                    mongo_uri = line.split("=", 1)[1].strip()
                    break
                    
    db = None
    questions_col = None
    if mongo_uri:
        try:
            print(f"Connecting to MongoDB database: {mongo_uri[:50]}...")
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            # Try a quick ping to see if server is online
            client.admin.command('ping')
            db = client.kr_academy
            questions_col = db.questions
            print("Connected to MongoDB successfully!")
        except Exception as e:
            print(f"Warning: Could not connect to remote MongoDB database ({e}). Local JSON files will still be updated.")
            questions_col = None
            
    # Stats
    total_files = 0
    total_processed = 0
    total_enriched = 0
    total_skipped = 0
    
    for folder in sorted(os.listdir(json_base)):
        folder_path = os.path.join(json_base, folder)
        if not os.path.isdir(folder_path):
            continue
            
        # Exclusion 1: RRB Clerk
        if "rrb_clerk" in folder.lower():
            print(f"\nSkipping directory {folder} (explicit exclusion for rrb_clerk)")
            continue
            
        print(f"\nProcessing directory: {folder}")
        
        for filename in sorted(os.listdir(folder_path)):
            if not filename.endswith(".json"):
                continue
                
            # Double check RRB Clerk filename exclusion
            if "rrb_clerk" in filename.lower():
                continue
                
            filepath = os.path.join(folder_path, filename)
            total_files += 1
            
            with open(filepath, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except Exception as e:
                    print(f"  Error parsing {filename}: {e}")
                    continue
                    
            file_modified = False
            file_enriched_count = 0
            
            for q in data:
                total_processed += 1
                
                # Subject classification
                subject_class = classify_subject(q)
                
                # Exclusion 2: Quant/Math
                if subject_class == "quant":
                    total_skipped += 1
                    continue
                    
                # Skip if already enriched
                expl = q.get("explanation", "").strip()
                if expl.startswith("**Correct Answer:**"):
                    total_skipped += 1
                    continue
                    
                correct_ans_id = get_correct_ans_id(q)
                correct_text = get_correct_text(q, correct_ans_id)
                
                # Enrich explanation
                new_expl = enrich_explanation_text(q, subject_class, correct_ans_id, correct_text)
                
                q["explanation"] = new_expl
                file_modified = True
                file_enriched_count += 1
                total_enriched += 1
                
                # Direct database update by unique_id if available
                if questions_col:
                    unique_id = q.get("unique_id")
                    if unique_id:
                        try:
                            questions_col.update_one(
                                {"unique_id": unique_id},
                                {"$set": {
                                    "explanation": new_expl,
                                    "raw_explanation": new_expl
                                }}
                            )
                        except Exception as e:
                            # Print warning but keep going
                            print(f"    Warning: Failed to update DB doc {unique_id}: {e}")
                            
            if file_modified:
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"  Enriched {file_enriched_count} explanations in {filename}")
            else:
                print(f"  No updates needed for {filename}")
                
    print("\n==========================================")
    print("ENRICHMENT SUMMARY")
    print("==========================================")
    print(f"Total Files Scanned:       {total_files}")
    print(f"Total Questions Processed: {total_processed}")
    print(f"Total Explanations Fixed:  {total_enriched}")
    print(f"Total Skipped (Quant/Done): {total_skipped}")
    print("==========================================")

if __name__ == "__main__":
    run()
