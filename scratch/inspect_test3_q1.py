import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_3.json")
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("--- Q#1 in sbi_clerk_test_3.json ---")
    q1 = data[0]
    for k, v in q1.items():
        print(f"  {k}: {repr(v)}")

if __name__ == "__main__":
    check()
