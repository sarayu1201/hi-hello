import os
import json
import re

workspace_root = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_root, "QuestionBank", "json", "ibps_clerk_prelims")

def map_filename_to_subtype(name):
    m = re.match(r'sbi_?clerk_test_(\d+)', name, re.IGNORECASE)
    if m: return f"SBI Clerk Prelims - Test {m.group(1)}"
    m = re.match(r'ibps_?clerk_(?:prelims_)?test_?(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS Clerk Prelims - Test {m.group(1)}"
    m = re.match(r'rrb_clerk_paper(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS RRB Clerk Prelims - Test {m.group(1)}"
    return name

def get_standardized_subject(exam_type, sub_type_val, q_id, original_subject):
    exam_lower = str(exam_type).lower()
    sub_lower = str(sub_type_val).lower()
    try:
        q_num = int(q_id)
    except:
        q_num = 1
    if "bank" in exam_lower or "sbi" in sub_lower or "ibps" in sub_lower:
        if q_num <= 30:
            return "English Language"
        elif q_num <= 65:
            return "Quantitative Aptitude"
        else:
            return "Reasoning Ability"
    return original_subject

def choose_cleanest_question(q):
    return q.get("question") or q.get("q") or q.get("question_text") or ""

print("=== Dry-running import_all_papers parsing logic locally ===")
total_success = 0
total_error = 0

for i in range(1, 11):
    filename = f"ibps_clerk_prelims_test{i}.json"
    filepath = os.path.join(json_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
        
    sub_type_val = map_filename_to_subtype(filename)
    
    with open(filepath, "r", encoding="utf-8") as f:
        questions_list = json.load(f)
        
    for idx, q in enumerate(questions_list):
        try:
            q_id = q.get("id") or q.get("question_number") or q.get("display_question_number")
            exam = q.get("course") or q.get("exam") or "IBPS Clerk Prelims"
            original_subject = q.get("subject")
            subject = get_standardized_subject(exam, sub_type_val, q_id, original_subject)
            
            question_text = choose_cleanest_question(q)
            direction = q.get("direction", "") or ""
            question_image_ref = q.get("question_image") or q.get("questionImage") or ""
            correct_ans = q.get("correct_answer") or q.get("correctAnswer") or q.get("correct_letter") or q.get("correct_option")
            options = q.get("options", [])
            
            has_question_content = bool(str(question_text).strip() or str(direction).strip() or str(question_image_ref).strip())
            
            if not q_id or not subject or not has_question_content or not correct_ans or len(options) < 2:
                print(f"Skipping Q index {idx} in {filename}: id={q_id}, subject={subject}, has_content={has_question_content}, correct_ans={correct_ans}, options_len={len(options)}")
                total_error += 1
                continue
                
            total_success += 1
        except Exception as e:
            print(f"Error processing index {idx} in {filename}: {e}")
            total_error += 1

print(f"\nDry Run Complete. Success: {total_success}, Errors/Skips: {total_error}")
