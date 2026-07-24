import os
import json

def inspect():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. ibps_clerk_prelims_test10.json Q3, Q24, Q31, Q35
    path1 = os.path.join(root_dir, "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test10.json")
    if os.path.exists(path1):
        with open(path1, "r", encoding="utf-8") as f:
            data = json.load(f)
        for idx in [2, 23, 30, 34]: # 0-indexed indices for Q3, Q24, Q31, Q35
            if idx < len(data):
                q = data[idx]
                print(f"\n--- {os.path.basename(path1)} Q#{q.get('id')} ---")
                print(f"Explanation: {repr(q.get('explanation'))}")
                
    # 2. ibps_clerk_prelims_test8.json Q79
    path2 = os.path.join(root_dir, "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test8.json")
    if os.path.exists(path2):
        with open(path2, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == 79 or q.get("question_number") == 79:
                print(f"\n--- {os.path.basename(path2)} Q#79 ---")
                print(f"Options: {q.get('options')}")
                
    # 3. sbi_clerk_test_6.json Q90
    path3 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
    if os.path.exists(path3):
        with open(path3, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == 90 or q.get("question_number") == 90:
                print(f"\n--- {os.path.basename(path3)} Q#90 ---")
                print(f"Options: {q.get('options')}")
                
    # 4. sbi_clerk_test_9.json Q44, Q54
    path4 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    if os.path.exists(path4):
        with open(path4, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") in [44, 54] or q.get("question_number") in [44, 54]:
                print(f"\n--- {os.path.basename(path4)} Q#{q.get('id')} ---")
                print(f"Options: {q.get('options')}")

if __name__ == "__main__":
    inspect()
