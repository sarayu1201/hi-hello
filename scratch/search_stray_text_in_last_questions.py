import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    for file in sorted(os.listdir(json_dir)):
        if not file.endswith(".json"):
            continue
            
        filepath = os.path.join(json_dir, file)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Scan last 6 questions (IDs 95 to 100)
        for q in data:
            q_id = q.get("id")
            if q_id >= 95:
                for opt in q.get("options", []):
                    opt_text = opt.get("text") or ""
                    # Check for "Solutions", "Solution", or newlines with numbers at the end
                    if "solution" in opt_text.lower() or "\n" in opt_text:
                        print(f"\n=================== {file} Q{q_id} Option {opt.get('id')} ===================")
                        print(repr(opt_text))

if __name__ == "__main__":
    check()
