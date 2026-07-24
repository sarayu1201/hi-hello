import os
import json
import re

def scan():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    issues_found = 0
    
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_id = q.get("id")
            question = q.get("question", "") or ""
            direction = q.get("direction", "") or ""
            options = q.get("options", [])
            
            reasons = []
            
            # 1. Check for unnecessary newlines in question
            # (e.g. newline inside a single sentence that isn't a list/table/dialogue)
            if "\n" in question:
                # If there are short lines (e.g., words wrapped by newlines)
                lines = [l.strip() for l in question.split("\n") if l.strip()]
                if len(lines) > 1 and any(len(l) < 30 for l in lines[:-1]) and not any(":" in l or "-" in l or "|" in l for l in lines):
                    reasons.append("unnecessary newlines in question text")
                    
            # 2. Check for option pollution
            for idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else str(opt)
                
                # Check for question marks in options
                if "?" in opt_text:
                    reasons.append(f"Option {chr(65+idx)} contains '?'")
                    
                # Check for long option texts (pollution usually appends large texts)
                if len(opt_text) > 80:
                    reasons.append(f"Option {chr(65+idx)} is unusually long ({len(opt_text)} chars)")
                    
                # Check for Option letters in the option text
                if re.search(r'\([B-E]\)\s|\b[B-E]\b\.', opt_text):
                    reasons.append(f"Option {chr(65+idx)} contains sub-options")
            
            if reasons:
                print(f"=== {filename} Q{q_id} ===")
                print(f"Question:    {repr(question)}")
                print(f"Direction:   {repr(direction)}")
                print("Options:")
                for idx, opt in enumerate(options):
                    opt_text = opt.get("text", "") if isinstance(opt, dict) else str(opt)
                    print(f"  {chr(65+idx)}: {repr(opt_text)}")
                print(f"Issues: {reasons}")
                print("-" * 60)
                issues_found += 1
                
    print(f"Total potential formatting/pollution issues found: {issues_found}")

if __name__ == "__main__":
    scan()
