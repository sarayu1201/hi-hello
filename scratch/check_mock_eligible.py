import json
import os

json_dir = "c:\\Users\\LENOVO\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        mock_eligible = sum(1 for q in data if q.get("is_mock_eligible") is True)
        not_eligible = sum(1 for q in data if q.get("is_mock_eligible") is not True)
        print(f"Test {i}: {mock_eligible} eligible, {not_eligible} NOT eligible")
