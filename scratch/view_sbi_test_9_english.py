import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("=== ENGLISH QUESTIONS 27 TO 30 (Test 9) ===")
    for q in data:
        q_id = q.get("id")
        if 27 <= q_id <= 30:
            print(f"\n=================== Q{q_id} ===================")
            print("Question:")
            print(repr(q.get("question")))
            print("Options:")
            for opt in q.get("options", []):
                print(f"  {opt.get('id')}: {repr(opt.get('text'))}")
            print("Explanation:")
            print(repr(q.get("explanation")))

if __name__ == "__main__":
    check()
