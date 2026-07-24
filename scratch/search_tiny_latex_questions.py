import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    found = 0
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
            q_text = str(q.get("question", ""))
            exp_text = str(q.get("explanation", ""))
            
            if "bottom number" in exp_text.lower() or "adding the first two" in exp_text.lower():
                print(f"FOUND MATCH in {file} Q#{q.get('id')}:")
                print(f"  Explanation: {repr(exp_text)}")
                found += 1
                
    print(f"\nTotal matches found: {found}")

if __name__ == "__main__":
    check()
