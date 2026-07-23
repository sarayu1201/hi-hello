import os
import json

def fix_json_files():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json")
    
    modified_count = 0
    fixed_questions_count = 0
    
    for root, dirs, files in os.walk(json_dir):
        for file in files:
            if not file.endswith(".json"):
                continue
            filepath = os.path.join(root, file)
            
            with open(filepath, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except Exception as e:
                    print(f"Error parsing {file}: {e}")
                    continue
                    
            if not isinstance(data, list):
                continue
                
            file_modified = False
            for idx, q in enumerate(data):
                question_text = q.get("question", "") or ""
                options = q.get("options", [])
                
                if options:
                    first_opt = options[0]
                    if isinstance(first_opt, dict):
                        opt_text = first_opt.get("text", "") or ""
                        if opt_text.strip().startswith("?"):
                            # Move "?" to question text
                            if not question_text.strip().endswith("?"):
                                question_text = question_text.strip() + "?"
                                q["question"] = question_text
                            
                            # Clean the option text
                            cleaned = opt_text.strip()
                            if cleaned.startswith("?"):
                                cleaned = cleaned[1:].strip()
                            first_opt["text"] = cleaned
                            
                            file_modified = True
                            fixed_questions_count += 1
                            print(f"  Fixed Q#{q.get('id')} in '{file}': moved leading '?' to question.")
                            
                    elif isinstance(first_opt, str):
                        opt_text = first_opt
                        if opt_text.strip().startswith("?"):
                            # Move "?" to question text
                            if not question_text.strip().endswith("?"):
                                question_text = question_text.strip() + "?"
                                q["question"] = question_text
                            
                            # Clean the option text
                            cleaned = opt_text.strip()
                            if cleaned.startswith("?"):
                                cleaned = cleaned[1:].strip()
                            options[0] = cleaned
                            
                            file_modified = True
                            fixed_questions_count += 1
                            print(f"  Fixed Q#{q.get('id')} in '{file}': moved leading '?' to question.")
            
            if file_modified:
                with open(filepath, "w", encoding="utf-8") as fw:
                    json.dump(data, fw, indent=2, ensure_ascii=False)
                modified_count += 1
                
    print(f"\nSUCCESS: Applied options cleanup!")
    print(f"Total modified files: {modified_count}")
    print(f"Total fixed questions: {fixed_questions_count}")

if __name__ == "__main__":
    fix_json_files()
