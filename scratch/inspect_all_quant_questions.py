import json
import os

json_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims\\ibps_clerk_prelims_test1.json"

if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("=== QUANT QUESTIONS IN TEST 1 ===")
    for q in data:
        if q["subject"] == "Quantitative Aptitude":
            print(f"Q{q['id']} (display {q['display_question_number']}): {repr(q['question'])}")
else:
    print("JSON file not found!")
