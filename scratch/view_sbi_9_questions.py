import os
import json

def inspect():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. sbi_clerk_test_6.json Q90
    path1 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
    with open(path1, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        if q.get("id") == 90 or q.get("question_number") == 90:
            print("\n--- Test 6 Q90 ---")
            print("Question:")
            print(q.get("question") or q.get("question_text"))
            print("Explanation:")
            print(q.get("explanation"))
            
    # 2. sbi_clerk_test_9.json Q44 and Q54
    path2 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    with open(path2, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        if q.get("id") in [44, 54] or q.get("question_number") in [44, 54]:
            print(f"\n--- Test 9 Q{q.get('id')} ---")
            print("Question:")
            print(q.get("question") or q.get("question_text"))
            print("Explanation:")
            print(q.get("explanation"))

if __name__ == "__main__":
    inspect()
