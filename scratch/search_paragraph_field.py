import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_1.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("Checking fields for the first 10 questions (English Language section):")
    for i in range(10):
        q = data[i]
        print(f"\nQuestion #{q.get('id')}:")
        print(f"  question:   {repr(q.get('question'))[:80]}...")
        # Check all other key-value pairs
        for k, v in q.items():
            if k not in ("id", "question", "options") and v:
                print(f"  {k}: {repr(v)[:150]}")

if __name__ == "__main__":
    check()
