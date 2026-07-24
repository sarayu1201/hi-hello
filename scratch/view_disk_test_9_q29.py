import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 29:
            print("DISK Question 29:")
            print(f"  question: {repr(q.get('question'))}")

if __name__ == "__main__":
    check()
