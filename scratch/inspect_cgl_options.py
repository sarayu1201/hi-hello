import os
import json
import re

def inspect_papers():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
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
                
        print(f"\n========================================")
        print(f"FILE: {file} (Total Questions: {len(data)})")
        print(f"========================================")
        
        for q in data:
            qid = q.get("id")
            options = q.get("options", [])
            q_text = str(q.get("question", ""))
            
            # 1. Check for option list leaked inside an option
            leaked_list = False
            for opt_idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
                opt_text = str(opt_text)
                
                # If option text has (a) and (b) and (c) inside it
                if len(re.findall(r'\([a-d]\)', opt_text.lower())) >= 2 or len(re.findall(r'\b[a-d]\b\s*[\)\.]', opt_text.lower())) >= 3:
                    leaked_list = True
                    print(f"  [LEAKED LIST] Q#{qid} - Option {chr(65+opt_idx)} contains a choice list:")
                    print(f"    {repr(opt_text)}")
                    
            # 2. Check for next question number leaked at the end of the last option
            if options:
                last_opt = options[-1]
                last_text = last_opt.get("text", "") if isinstance(last_opt, dict) else last_opt
                last_text = str(last_text).strip()
                
                # Check if it ends with a newline followed by a number, e.g. "\n2" or "\n24"
                lines = last_text.splitlines()
                if len(lines) > 1:
                    last_line = lines[-1].strip()
                    if last_line.isdigit() and int(last_line) < 100:
                        print(f"  [LEAKED NUM] Q#{qid} - Last Option contains leaked next question number: {repr(last_line)}")
                        print(f"    Full text: {repr(last_text)}")
                        
            # 3. Check for empty options or too few options
            if len(options) < 4:
                print(f"  [FEW OPTIONS] Q#{qid} has only {len(options)} options!")
            for opt_idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
                if not str(opt_text).strip():
                    print(f"  [EMPTY OPTION] Q#{qid} - Option {chr(65+opt_idx)} is empty!")
                    
            # 4. Check for fraction corruption
            has_corrupt = False
            if corrupt_pattern.search(q_text):
                print(f"  [CORRUPT FRAC] Q#{qid} Question: {repr(q_text)}")
                
            for opt_idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
                if corrupt_pattern.search(str(opt_text)):
                    print(f"  [CORRUPT FRAC] Q#{qid} Option {chr(65+opt_idx)}: {repr(opt_text)}")

if __name__ == "__main__":
    inspect_papers()
