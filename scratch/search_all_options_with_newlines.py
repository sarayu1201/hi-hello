import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    found = 0
    for file in sorted(os.listdir(json_dir)):
        if not file.endswith(".json"):
            continue
            
        filepath = os.path.join(json_dir, file)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            for opt in q.get("options", []):
                opt_text = opt.get("text") or ""
                if "\n" in opt_text:
                    found += 1
                    print(f"[{file}] Q{q.get('id')} Option {opt.get('id')}: {repr(opt_text)}")
                    
    print(f"\nTotal options with newlines found: {found}")

if __name__ == "__main__":
    check()
