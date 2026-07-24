import os
import json
import re

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    # Match "frac" NOT preceded by a backslash
    pattern = re.compile(r'(?<!\\)frac\{')
    
    total_count = 0
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
                
        file_count = 0
        for q in data:
            qid = q.get("id")
            q_text = str(q.get("question", ""))
            exp_text = str(q.get("explanation", ""))
            options = q.get("options", [])
            
            has_missing = False
            if pattern.search(q_text):
                print(f"  [{file}] Q#{qid} Question: {repr(q_text)}")
                has_missing = True
            if pattern.search(exp_text):
                print(f"  [{file}] Q#{qid} Explanation: {repr(exp_text)}")
                has_missing = True
                
            for opt_idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
                if pattern.search(str(opt_text)):
                    print(f"  [{file}] Q#{qid} Option {chr(65+opt_idx)}: {repr(opt_text)}")
                    has_missing = True
                    
            if has_missing:
                file_count += 1
                
        print(f"File {file}: found {file_count} questions with missing backslash before frac.")
        total_count += file_count
        
    print(f"\nTotal corrupted questions with missing backslash: {total_count}")

if __name__ == "__main__":
    check()
