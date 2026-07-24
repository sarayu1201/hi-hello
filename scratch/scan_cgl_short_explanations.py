import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    really_short = []
    
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            expl = q.get("explanation", "").strip()
            # Clean generic boilerplate
            cleaned = expl.replace("**Correct Answer:**", "")
            cleaned = cleaned.replace("**Key Concept:**", "")
            cleaned = cleaned.replace("**Detailed Analysis:**", "")
            cleaned = cleaned.replace("**Conclusion:**", "")
            cleaned = cleaned.strip()
            
            # If length is small, or empty, or generic
            if len(cleaned) < 150 or not cleaned:
                really_short.append((filename, q.get("id"), expl))
                
    print(f"Total CGL questions with short explanations: {len(really_short)}")
    if really_short:
        print("\nFirst 15 short explanations found:")
        for fn, q_id, expl in really_short[:15]:
            print(f"  {fn} Q{q_id}:")
            print(repr(expl))
            print("-" * 30)

if __name__ == "__main__":
    check()
