import os
import json
import re

def analyze_all_files():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sbi_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    if not os.path.exists(sbi_dir):
        print(f"Directory not found: {sbi_dir}")
        return
        
    files = sorted([f for f in os.listdir(sbi_dir) if f.endswith(".json")])
    print(f"Analyzing {len(files)} SBI Clerk files:")
    
    for filename in files:
        filepath = os.path.join(sbi_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"  Error loading {filename}: {e}")
                continue
                
        print(f"\nFile: {filename} (Total questions: {len(data)})")
        
        dollar_qs = []
        slash_qs = []
        latex_qs = []
        
        for q in data:
            q_id = q.get("id")
            q_text = q.get("question", "") or ""
            exp_text = q.get("explanation", "") or ""
            direction = q.get("direction", "") or ""
            
            # Check for dollar signs
            if "$" in q_text or "$" in exp_text or "$" in direction:
                dollar_qs.append(q_id)
                
            # Check for >/ or other slash anomalies
            if ">/" in q_text or ">/" in exp_text or ">/" in direction:
                slash_qs.append(q_id)
                
            # Check for raw LaTeX
            if "\\" in q_text or "\\" in exp_text or "\\" in direction:
                latex_qs.append(q_id)
                
        print(f"  Questions with dollar signs ($): {len(dollar_qs)} (sample IDs: {dollar_qs[:10]})")
        print(f"  Questions with slash anomalies (>/): {len(slash_qs)} (sample IDs: {slash_qs[:10]})")
        print(f"  Questions with raw LaTeX (\\): {len(latex_qs)} (sample IDs: {latex_qs[:10]})")
        
        # Let's inspect a sample of slash anomaly if any
        if slash_qs:
            for q in data:
                if q.get("id") == slash_qs[0]:
                    print(f"    Sample Slash Anomaly in Q#{q.get('id')}:")
                    print(f"      Direction: {repr(q.get('direction'))}")
                    print(f"      Question: {repr(q.get('question'))}")
                    break
                    
        # Let's inspect a sample of LaTeX if any
        if latex_qs:
            for q in data:
                if q.get("id") == latex_qs[0]:
                    print(f"    Sample LaTeX in Q#{q.get('id')}:")
                    print(f"      Question: {repr(q.get('question'))}")
                    print(f"      Options: {[opt.get('text') for opt in q.get('options', [])]}")
                    break

if __name__ == "__main__":
    analyze_all_files()
