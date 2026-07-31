import json
import os

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"Test {i}: Total Questions in JSON = {len(data)}")
        
        # Count by subject
        subjects = {}
        for q in data:
            sub = q.get("subject", "Unknown")
            subjects[sub] = subjects.get(sub, 0) + 1
        for sub, count in subjects.items():
            print(f"  - {sub}: {count}")
    else:
        print(f"Test {i}: Not found.")
