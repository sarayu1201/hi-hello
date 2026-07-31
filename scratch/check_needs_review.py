import json
import os

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

total_needs_review = 0
for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        test_needs_review = sum(1 for q in data if q.get("status") == "needs_review")
        print(f"Test {i}: {test_needs_review} questions have status='needs_review'")
        total_needs_review += test_needs_review

print(f"\nTotal questions with needs_review: {total_needs_review}")
