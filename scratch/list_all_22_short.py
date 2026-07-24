import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    clerk_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    files = [f"sbi_clerk_test_{i}.json" for i in range(1, 11)]
    
    really_short = []
    
    for filename in files:
        path = os.path.join(clerk_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            expl = q.get("explanation", "").strip()
            cleaned = expl.replace("**Correct Answer:**", "")
            cleaned = cleaned.replace("**Key Concept:**", "")
            cleaned = cleaned.replace("**Step 1 (Problem Setup):** Analyze the given conditions, parameters, and expressions in the problem statement.", "")
            cleaned = cleaned.replace("**Step 3 (Verification & Calculation):** Validate the calculated values against the options provided to confirm logical consistency.", "")
            cleaned = cleaned.replace("**Conclusion:**", "")
            cleaned = cleaned.replace("The evaluated result confirms Option", "")
            cleaned = cleaned.replace("as the correct answer.", "")
            cleaned = cleaned.strip()
            
            if len(cleaned) < 150:
                really_short.append((filename, q.get("id"), q.get("question"), q.get("options"), expl))
                
    print(f"Total: {len(really_short)}")
    for idx, (fn, q_id, q_text, opts, expl) in enumerate(really_short):
        print(f"\n[{idx+1}] {fn} Q{q_id}:")
        print(f"  Question: {repr(q_text)}")
        print("  Options:")
        for o in opts:
            print(f"    {o.get('id')}: {repr(o.get('text'))}")
        print("  Explanation:")
        print(repr(expl))

if __name__ == "__main__":
    check()
