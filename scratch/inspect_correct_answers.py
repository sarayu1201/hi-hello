import os
import json

def inspect():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. ibps_clerk_prelims_test8.json Q79
    path1 = os.path.join(root_dir, "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test8.json")
    if os.path.exists(path1):
        with open(path1, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == 79 or q.get("question_number") == 79:
                print(f"Test 8 Q79 correct answer: {q.get('correctAnswer') or q.get('correct_answer')}")
                
    # 2. sbi_clerk_test_6.json Q90
    path2 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
    if os.path.exists(path2):
        with open(path2, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == 90 or q.get("question_number") == 90:
                print(f"Test 6 Q90 correct answer: {q.get('correctAnswer') or q.get('correct_answer')}")
                
    # 3. sbi_clerk_test_9.json Q44, Q54
    path3 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    if os.path.exists(path3):
        with open(path3, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") in [44, 54] or q.get("question_number") in [44, 54]:
                print(f"Test 9 Q{q.get('id')} correct answer: {q.get('correctAnswer') or q.get('correct_answer')}")

if __name__ == "__main__":
    inspect()
