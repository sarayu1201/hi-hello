import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        q_id = q.get("id")
        if 74 <= q_id <= 76:
            print(f"\n=================== Q{q_id} ===================")
            print("Direction:")
            print(repr(q.get("direction")))
            print("Question:")
            print(repr(q.get("question")))
            print("Explanation:")
            print(repr(q.get("explanation")))

if __name__ == "__main__":
    check()
