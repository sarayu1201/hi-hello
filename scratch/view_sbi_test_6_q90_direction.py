import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 90:
            print("Question 90 Direction:")
            print(repr(q.get("direction") or q.get("directions")))
            print("Option D:")
            for opt in q.get("options", []):
                if opt.get("id") == "D":
                    print(repr(opt.get("text")))

if __name__ == "__main__":
    check()
