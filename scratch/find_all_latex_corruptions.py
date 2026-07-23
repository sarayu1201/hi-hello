import os
import json
import re

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    corrupt_pattern = re.compile(r'\\frac\{[^{}]+\}\{[^{}]+(?<!\})\$')
    
    for file in sorted(os.listdir(json_dir)):
        if not file.endswith(".json"):
            continue
        filepath = os.path.join(json_dir, file)
        
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error parsing {file}: {e}")
                continue
                
        print(f"\nScanning {file} for fraction corruptions...")
        count = 0
        for q in data:
            qid = q.get("id")
            q_text = str(q.get("question", ""))
            options = q.get("options", [])
            
            has_corrupt = False
            if corrupt_pattern.search(q_text):
                print(f"  Q#{qid} Question: {repr(q_text)}")
                has_corrupt = True
                
            for opt_idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
                if corrupt_pattern.search(str(opt_text)):
                    print(f"  Q#{qid} Option {chr(65+opt_idx)}: {repr(opt_text)}")
                    has_corrupt = True
                    
            if has_corrupt:
                count += 1
                
        print(f"Total corrupted questions in {file}: {count}")

if __name__ == "__main__":
    check()
