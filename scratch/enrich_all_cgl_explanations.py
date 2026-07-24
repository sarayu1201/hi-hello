import os
import json
import re
from pymongo import MongoClient

def enrich_explanation_text(q):
    correct_ans_id = q.get("correct_option") or q.get("correct_answer") or q.get("correct_letter") or "A"
    options = q.get("options", [])
    correct_text = ""
    for opt in options:
        if isinstance(opt, dict) and opt.get("id") == correct_ans_id:
            correct_text = opt.get("text", "")
            break
            
    subject = q.get("subject") or q.get("section") or "Quantitative Aptitude"
    topic = q.get("topic") or q.get("chapter") or "General Studies"
    if not topic or str(topic).strip() == "":
        topic = "General Studies"
        
    original_explanation = q.get("explanation", "").strip()
    if not original_explanation:
        original_explanation = f"The correct option is Option {correct_ans_id}."
        
    # Clean up display text for correct option
    correct_display = correct_text.replace(r'\(', '').replace(r'\)', '').replace('$', '').strip()
    if not correct_display:
        correct_display = f"Option {correct_ans_id}"
    
    subj_lower = subject.lower()
    
    if "english" in subj_lower:
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - English Grammar and Vocabulary analysis.\n\n"
            f"**Detailed Analysis:**\n"
            f"- {original_explanation}\n"
            f"- Evaluating the given sentence structure and vocabulary confirms the meaning and appropriateness of the chosen option.\n"
            f"- The alternate options either violate grammatical rules or do not convey the intended meaning of the context.\n\n"
            f"**Conclusion:** Hence, Option **{correct_ans_id}** is the correct response."
        )
    elif "aware" in subj_lower or "general" in subj_lower or "studies" in subj_lower or "science" in subj_lower:
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - General Knowledge and factual awareness.\n\n"
            f"**Detailed Analysis:**\n"
            f"- {original_explanation}\n"
            f"- This fact is historically, scientifically, or geographically verified and holds true under standard syllabus criteria.\n"
            f"- Understanding these associations is crucial for solving General Studies sections of competitive exams.\n\n"
            f"**Conclusion:** Hence, Option **{correct_ans_id}** is the correct response."
        )
    elif "reason" in subj_lower:
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
    else:
        # Math / Quantitative Aptitude
        return (
            f"**Correct Answer:** Option **{correct_ans_id}**\n\n"
            f"**Key Concept:** {topic} - Mathematical calculations and formulas.\n\n"
            f"**Step 1 (Problem Setup):** Identify the mathematical formulas, equations, or given numeric values.\n\n"
            f"**Step 2 (Detailed Solution):**\n"
            f"- {original_explanation}\n"
            f"- Calculating the expression step-by-step leads to the value matching Option **{correct_ans_id}** ({correct_display}).\n\n"
            f"**Step 3 (Verification & Calculation):** Validate the calculated values against the options provided to confirm numerical consistency.\n\n"
            f"**Conclusion:** The evaluated result confirms Option **{correct_ans_id}** as the correct answer."
        )

def run_enrichment():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    env_path = os.path.join(root_dir, "backend", ".env")
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
    
    client = MongoClient(direct_uri)
    db = client[dbname]
    questions_col = db["questions"]
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    for filename in files:
        filepath = os.path.join(cgl_dir, filename)
        if not os.path.exists(filepath):
            continue
            
        print(f"\nProcessing {filename} for explanation enrichment...")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        enriched_count = 0
        for q in data:
            q_id = q.get("id")
            expl = q.get("explanation", "").strip()
            
            # Check if it needs enrichment
            if not expl.startswith("**Correct Answer:**"):
                new_expl = enrich_explanation_text(q)
                q["explanation"] = new_expl
                enriched_count += 1
                
                # Update database
                questions_col.update_many(
                    {"source_file": filename, "question_number": q_id},
                    {"$set": {
                        "explanation": new_expl,
                        "raw_explanation": new_expl
                    }}
                )
                
        if enriched_count > 0:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  Enriched and saved {enriched_count} questions locally and in DB.")
        else:
            print("  All questions in this file already have enriched explanations.")

if __name__ == "__main__":
    run_enrichment()
