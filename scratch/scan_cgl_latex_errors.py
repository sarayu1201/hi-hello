import os
import json
import re

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        print(f"\n=== SCANNING {filename} FOR MATH LATEX ===")
        # Check first 5 quant/math questions
        math_count = 0
        for q in data:
            q_id = q.get("id")
            subject = q.get("subject", "")
            if subject == "Quantitative Aptitude" or "math" in subject.lower():
                print(f"Q{q_id} Question:")
                print(repr(q.get("question")))
                print(f"Q{q_id} Explanation:")
                print(repr(q.get("explanation")))
                print("-" * 50)
                math_count += 1
                if math_count >= 3:
                    break

if __name__ == "__main__":
    check()
