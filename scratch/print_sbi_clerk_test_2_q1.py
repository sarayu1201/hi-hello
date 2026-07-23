import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_2.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("--- Q#1 in sbi_clerk_test_2.json ---")
    q1 = data[0]
    for k, v in q1.items():
        if k != "options":
            print(f"  {k}: {repr(v)}")
        else:
            print("  options:")
            for opt in v:
                print(f"    {repr(opt)}")

if __name__ == "__main__":
    check()
