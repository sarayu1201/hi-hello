import json
import os

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    found_qs = []
    for q in data:
        for opt in q["options"]:
            text = opt["text"].strip().lower()
            if "option" in text and len(text) < 25:
                found_qs.append((q["id"], opt["id"], opt["text"]))
                
    if found_qs:
        print(f"Test {i}: Options containing 'option': {found_qs}")
