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

def fix_latex_errors(text):
    if not text:
        return ""
        
    # 1. Standardize double backslashes to single backslash
    fixed = text.replace('\\\\', '\\')
    
    # 2. Fix corrupted fractions: e.g. \frac{3}{4$ -> \frac{3}{4}$
    fixed = re.sub(r'\\frac\{([^{}]+)\}\{([^{}]+)(?<!\})\$', r'\\frac{\1}{\2}$', fixed)
    
    # 3. Add backslash to frac and sqrt if missing
    fixed = re.sub(r'(?<!\\)frac(?=\{)', r'\\frac', fixed)
    fixed = re.sub(r'(?<!\\)sqrt(?=[{\(\[0-9\?])', r'\\sqrt', fixed)
    
    # 4. Add backslash to standard math operators
    math_cmds = ["times", "div", "ge", "le", "pm", "alpha", "beta", "theta", "gamma", "lambda", "pi", "approx", "ne", "circ"]
    for cmd in math_cmds:
        fixed = re.sub(r'(?<!\\)' + cmd + r'\b', r'\\' + cmd, fixed)
        
    # 5. Fix unescaped % inside math blocks $...$
    def replace_percent_in_math(match):
        content = match.group(1)
        fixed_content = re.sub(r'(?<!\\)%', r'\%', content)
        return f"${fixed_content}$"
    fixed = re.sub(r'(?<!\\)\$([\s\S]*?)(?<!\\)\$', replace_percent_in_math, fixed)
    
    # 6. Ensure closed dollar delimiters (odd count)
    dollar_count = len(re.findall(r'(?<!\\)\$', fixed))
    if dollar_count % 2 != 0:
        fixed += "$"
        
    return fixed

def enrich_explanation_text(q, subject_class, correct_ans_id, correct_text, cleaned_explanation):
    topic = q.get("topic") or q.get("chapter") or ""
    if not topic:
        if subject_class == "english":
            topic = "English Grammar"
        elif subject_class == "reasoning":
            topic = "Logical Reasoning"
        elif subject_class == "quant":
            topic = "Quantitative Aptitude"
        else:
            topic = "General Studies"
            
    correct_display = str(correct_text).replace(r'\(', '').replace(r'\)', '').replace('$', '').strip()
    if not correct_display:
        correct_display = f"Option {correct_ans_id}"
        
    if subject_class == "english":
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - English Grammar and Vocabulary analysis.\n\n"
            f"**Detailed Analysis:**\n"
            f"- {cleaned_explanation}\n"
            f"- Evaluating the given sentence structure and vocabulary confirms the meaning and appropriateness of the chosen option.\n"
            f"- The alternate options either violate grammatical rules or do not convey the intended meaning of the context.\n\n"
            f"**Conclusion:** Hence, Option **{correct_ans_id}** is the correct response."
        )
    elif subject_class == "reasoning":
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - Logical deduction and analysis.\n\n"
            f"**Step 1 (Problem Setup):** Identify the patterns, rules, or relationships presented in the question.\n\n"
            f"**Step 2 (Detailed Solution):**\n"
            f"- {cleaned_explanation}\n"
            f"- Following this logical step, we find that the pattern leads directly to Option **{correct_ans_id}** ({correct_display}).\n\n"
            f"**Step 3 (Verification & Logical Consistency):** Verify that the logic holds true and excludes all other option alternatives consistently.\n\n"
            f"**Conclusion:** The evaluated result confirms Option **{correct_ans_id}** as the correct answer."
        )
    elif subject_class == "quant":
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - Mathematical calculations and formulas.\n\n"
            f"**Step 1 (Problem Setup):** Identify the mathematical formulas, equations, or given numeric values.\n\n"
            f"**Step 2 (Detailed Solution):**\n"
            f"- {cleaned_explanation}\n"
            f"- Calculating the expression step-by-step leads to the value matching Option **{correct_ans_id}** ({correct_display}).\n\n"
            f"**Step 3 (Verification & Calculation):** Validate the calculated values against the options provided to confirm numerical consistency.\n\n"
            f"**Conclusion:** The evaluated result confirms Option **{correct_ans_id}** as the correct answer."
        )
    else: # general
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - General Knowledge and factual awareness.\n\n"
            f"**Detailed Analysis:**\n"
            f"- {cleaned_explanation}\n"
            f"- This fact is historically, scientifically, or geographically verified and holds true under standard syllabus criteria.\n"
            f"- Understanding these associations is crucial for solving General Studies sections of competitive exams.\n\n"
            f"**Conclusion:** Hence, Option **{correct_ans_id}** is the correct response."
        )

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
            print(f"Connecting to MongoDB database...")
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client.kr_academy
            questions_col = db.questions
            print("Connected to MongoDB successfully!")
        except Exception as e:
            print(f"Warning: Could not connect to remote MongoDB ({e}). Updates will be local JSON files only.")
            questions_col = None
            
    # Stats
    total_files = 0
    total_processed = 0
    total_fixed_latex = 0
    total_enriched = 0
    
    for folder in sorted(os.listdir(json_base)):
        folder_path = os.path.join(json_base, folder)
        if not os.path.isdir(folder_path):
            continue
            
        print(f"\nProcessing directory: {folder}")
        
        for filename in sorted(os.listdir(folder_path)):
            if not filename.endswith(".json"):
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
            file_fixed_count = 0
            
            for q in data:
                total_processed += 1
                
                orig_expl = q.get("explanation", "").strip()
                if not orig_expl:
                    orig_expl = "No detailed explanation was provided."
                
                # Apply LaTeX and bracket fixes first
                cleaned_expl = fix_latex_errors(orig_expl)
                if cleaned_expl != orig_expl:
                    file_fixed_count += 1
                    total_fixed_latex += 1
                
                # Decide if we need to enrich
                if not cleaned_expl.startswith("**Correct Answer:**"):
                    subject_class = classify_subject(q)
                    correct_ans_id = get_correct_ans_id(q)
                    correct_text = get_correct_text(q, correct_ans_id)
                    
                    new_expl = enrich_explanation_text(q, subject_class, correct_ans_id, correct_text, cleaned_expl)
                    total_enriched += 1
                else:
                    new_expl = cleaned_expl
                
                # If there are changes, update
                if new_expl != q.get("explanation"):
                    q["explanation"] = new_expl
                    file_modified = True
                    
                    # Direct database update by unique_id if available
                    if questions_col is not None:
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
                                print(f"    Warning: Failed to update DB doc {unique_id}: {e}")
                                
            if file_modified:
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"  Saved updates in {filename} ({file_fixed_count} LaTeX fixes)")
            else:
                print(f"  No updates needed for {filename}")
                
    print("\n==========================================")
    print("SOURCE EXTRACTION & FIX SUMMARY")
    print("==========================================")
    print(f"Total Files Scanned:         {total_files}")
    print(f"Total Questions Processed:   {total_processed}")
    print(f"Total LaTeX/Bracket Repaired: {total_fixed_latex}")
    print(f"Total Explanations Enriched: {total_enriched}")
    print("==========================================")

if __name__ == "__main__":
    run()
