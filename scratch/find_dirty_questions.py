import os
import json

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

print("=== Scanning JSON Files for Leaked Chart/Table Text ===")

for i in range(1, 11):
    filename = f"ibps_clerk_prelims_test{i}.json"
    filepath = os.path.join(json_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        q_id = q.get("id")
        q_text = q.get("question", "")
        options = q.get("options", [])
        
        # Check if question text or options contain leaked data
        leaks = []
        words = ["residents", "bhopal", "lucknow", "houses sold", "functions", "boats", "ships", "bikes sold", "kiwi", "plums", "visitors", "restaurant"]
        
        # We are looking for numbers like 200/250/300 or axis labels that don't belong in the question/option
        text_to_check = q_text + " " + " ".join(opt.get("text", "") if isinstance(opt, dict) else str(opt) for opt in options)
        
        # Specifically check if we have things like "200/250/300" or list of years or axis names in questions that shouldn't have them
        # (e.g. interest calculations or time/work questions)
        # Let's check for "200/250/300", "A B C D", or "2008 2018"
        if "200/250" in text_to_check or "Number of Residents" in text_to_check or "Houses sold in India" in text_to_check:
            print(f"Test {i} Q{q_id} has leak: {text_to_check[:100]}...")
            
        # Let's print out the exact content of Test 1 Q17 (Quant, which is absolute Q47 or something)
        # Let's find any question where option E contains "Number of Residents"
        for opt_idx, opt in enumerate(options):
            opt_text = opt.get("text", "") if isinstance(opt, dict) else str(opt)
            if "Number of" in opt_text or "200/250" in opt_text or "2008" in opt_text:
                print(f"Test {i} Q{q_id} Option {opt_idx} Leak: {opt_text}")
