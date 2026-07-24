import os
import json
import re

def fix_missing_backslashes():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    modified_files_count = 0
    fixed_questions_count = 0
    
    # Matches frac{ or dfrac{ NOT preceded by a backslash
    pattern = re.compile(r'(?<!\\)(d?frac\{)')
    
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
                
        file_modified = False
        print(f"\nProcessing {file}...")
        
        for q in data:
            qid = q.get("id")
            question_text = q.get("question", "") or ""
            explanation = q.get("explanation", "") or ""
            options = q.get("options", [])
            
            q_fixed = False
            
            # 1. Fix question text
            new_q = pattern.sub(r'\\\1', question_text)
            if new_q != question_text:
                q["question"] = new_q
                q_fixed = True
                print(f"  Q#{qid} Question Fixed:")
                print(f"    Old: {repr(question_text)}")
                print(f"    New: {repr(new_q)}")
                
            # 2. Fix explanation
            new_exp = pattern.sub(r'\\\1', explanation)
            if new_exp != explanation:
                q["explanation"] = new_exp
                q_fixed = True
                print(f"  Q#{qid} Explanation Fixed:")
                print(f"    Old: {repr(explanation)}")
                print(f"    New: {repr(new_exp)}")
                
            # 3. Fix options
            for opt_idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
                opt_text = str(opt_text)
                new_opt = pattern.sub(r'\\\1', opt_text)
                if new_opt != opt_text:
                    if isinstance(opt, dict):
                        opt["text"] = new_opt
                    else:
                        options[opt_idx] = new_opt
                    q_fixed = True
                    print(f"  Q#{qid} Option {chr(65+opt_idx)} Fixed:")
                    print(f"    Old: {repr(opt_text)}")
                    print(f"    New: {repr(new_opt)}")
                    
            if q_fixed:
                fixed_questions_count += 1
                file_modified = True
                
        if file_modified:
            with open(filepath, "w", encoding="utf-8") as fw:
                json.dump(data, fw, indent=2, ensure_ascii=False)
            modified_files_count += 1
            print(f"  [SAVED] {file} saved successfully.")
            
    print(f"\nLaTeX fraction backslash fix complete!")
    print(f"Total modified files: {modified_files_count}")
    print(f"Total fixed questions: {fixed_questions_count}")

if __name__ == "__main__":
    fix_missing_backslashes()
