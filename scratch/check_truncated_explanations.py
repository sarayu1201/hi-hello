import json
import os

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        # Check if explanation or question ends with a colon or is extremely short
        exp = q["explanation"].strip()
        quest = q["question"].strip()
        
        # Look for suspicious truncations
        if exp and (exp.endswith(":") or len(exp) < 15 or exp.endswith("3") or exp.endswith("-")):
            print(f"Test {i} Q{q['id']}: Suspicious Explanation: {repr(exp)}")
        if quest and (quest.endswith(":") or len(quest) < 15 or quest.endswith("-")):
            # Some questions are naturally short or end with colon (like Cloze prompts), but let's print if they look truncated
            if "fill in the blank" not in quest.lower():
                print(f"Test {i} Q{q['id']}: Suspicious Question: {repr(quest)}")
