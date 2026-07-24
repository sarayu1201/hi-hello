import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_7.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 20:
            print("Question 20 Details:")
            print("Question:")
            print(repr(q.get("question") or q.get("question_text")))
            print("Options:")
            for opt in q.get("options", []):
                print(f"  {opt.get('id')}: {repr(opt.get('text'))}")
            print("Explanation:")
            print(repr(q.get("explanation")))

if __name__ == "__main__":
    check()
