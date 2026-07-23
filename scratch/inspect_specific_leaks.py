import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. Print Q#20 of Test 1
    t1_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_1.json")
    with open(t1_path, "r", encoding="utf-8") as f:
        t1_data = json.load(f)
    print("--- Q#20 in sbi_clerk_test_1.json ---")
    q20 = [q for q in t1_data if q.get("id") == 20][0]
    for k, v in q20.items():
        print(f"  {k}: {repr(v)}")
        
    # 2. Print Q#7 of Test 10
    t10_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_10.json")
    with open(t10_path, "r", encoding="utf-8") as f:
        t10_data = json.load(f)
    print("\n--- Q#7 in sbi_clerk_test_10.json ---")
    q7 = [q for q in t10_data if q.get("id") == 7][0]
    for k, v in q7.items():
        print(f"  {k}: {repr(v)}")

if __name__ == "__main__":
    check()
