import os
import json
import re

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    dummy_count = 0
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_id = q.get("id")
            options = q.get("options", [])
            opt_texts = [o.get("text", "") if isinstance(o, dict) else str(o) for o in options]
            
            # Check if options are just A, B, C, D placeholders
            is_dummy = all(t.strip() in ["A", "B", "C", "D", "E", "(A)", "(B)", "(C)", "(D)", "(E)"] for t in opt_texts)
            if is_dummy and len(opt_texts) >= 4:
                print(f"=== {filename} Q{q_id} ===")
                print(f"Question:    {repr(q.get('question'))}")
                print(f"Options:     {opt_texts}")
                print(f"Explanation: {repr(q.get('explanation'))}")
                print("-" * 60)
                dummy_count += 1
                
    print(f"Total questions with dummy placeholder options: {dummy_count}")

if __name__ == "__main__":
    check()
