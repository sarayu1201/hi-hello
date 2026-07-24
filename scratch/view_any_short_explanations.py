import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    clerk_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    files = [f"sbi_clerk_test_{i}.json" for i in range(1, 11)]
    
    for filename in files:
        path = os.path.join(clerk_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        print(f"\n=== SAMPLE EXPLANATIONS FROM {filename} ===")
        # Print first 3 questions' explanations
        count = 0
        for q in data:
            expl = q.get("explanation", "").strip()
            print(f"Q{q.get('id')}:")
            print(expl)
            print("-" * 40)
            count += 1
            if count >= 3:
                break

if __name__ == "__main__":
    check()
