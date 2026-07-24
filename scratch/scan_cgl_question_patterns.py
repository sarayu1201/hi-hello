import os
import json
import re

def scan():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    pattern = r'\(A\).*?\(B\).*?\(C\).*?\(D\)'
    
    found_count = 0
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_id = q.get("id")
            question = q.get("question", "") or ""
            
            if re.search(pattern, question, re.IGNORECASE):
                print(f"=== {filename} Q{q_id} ===")
                print(f"Question: {repr(question)}")
                print(f"Options:  {q.get('options')}")
                print("-" * 60)
                found_count += 1
                
    print(f"Total matching questions: {found_count}")

if __name__ == "__main__":
    scan()
