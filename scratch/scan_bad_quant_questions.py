import json
import os
import re

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

scrambled_questions = []

for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q["subject"] not in ["Quantitative Aptitude", "Numerical Ability"]:
            continue
            
        q_text = q["question"]
        # Detect scrambled markers
        if "( )" in q_text or "× ÷" in q_text or "÷ ×" in q_text or re.search(r'[\+\-\*×÷=]{3,}', q_text) or q_text.endswith("="):
            scrambled_questions.append((i, q["id"], q_text, q["explanation"]))

print(f"Total scrambled/poorly-formatted math questions found: {len(scrambled_questions)}")
print("\n--- Scrambled Questions ---")
for idx, (test_num, q_id, text, exp) in enumerate(scrambled_questions, 1):
    print(f"{idx}. Test {test_num} Q{q_id}:")
    print(f"   Question:    {repr(text)}")
    print(f"   Explanation: {repr(exp)}")
    print("-" * 50)
