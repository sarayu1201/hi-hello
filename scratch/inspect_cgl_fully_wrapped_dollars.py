import os
import json
import re

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    count = 0
    for file in sorted(os.listdir(json_dir)):
        if not file.endswith(".json"):
            continue
        filepath = os.path.join(json_dir, file)
        
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error: {e}")
                continue
                
        for q in data:
            qid = q.get("id")
            for field in ["question", "explanation"]:
                val = str(q.get(field, "")).strip()
                if val.startswith("$") and val.endswith("$") and val.count("$") == 2:
                    # Check if it has spaces and words (more than 3 words)
                    inner = val[1:-1].strip()
                    words = [w for w in inner.split() if len(w) > 2 and w.isalpha()]
                    if len(words) >= 3:
                        print(f"[{file}] Q#{qid} {field} is fully wrapped in dollars:")
                        print(f"  {repr(val)}")
                        count += 1
                        
    print(f"\nTotal fully wrapped dollar texts: {count}")

if __name__ == "__main__":
    check()
