import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_3.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") in [11, 12, 13, 14]:
            print(f"\n--- Question ID {q.get('id')} ---")
            print("Question:")
            print(repr(q.get("question") or q.get("question_text")))
            print("Directions:")
            print(repr(q.get("direction") or q.get("directions") or q.get("direction_text")))

if __name__ == "__main__":
    check()
