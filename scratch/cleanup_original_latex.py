import json
import os
import re

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

def clean_text_artifacts(t):
    if not isinstance(t, str) or not t:
        return t
        
    # Replace \x08 control characters
    t = t.replace('\x08', '')
    
    # Replace double backslashes \\ with a space
    t = t.replace('\\\\', ' ')
    t = t.replace('\\', ' ')
    
    # Replace corrupt encoding characters (Þ -> ⇒)
    t = t.replace('Þ', '⇒')
    
    # Standardize multiple spaces
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def cleanup_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    updated_count = 0
    for q in data:
        # Clean question
        old_q = q["question"]
        q["question"] = clean_text_artifacts(q["question"])
        q["q"] = q["question"]
        if old_q != q["question"]:
            updated_count += 1
            
        # Clean options
        for opt in q["options"]:
            opt["text"] = clean_text_artifacts(opt["text"])
            
        # Clean explanation
        q["explanation"] = clean_text_artifacts(q["explanation"])
        
        # Clean direction
        q["direction"] = clean_text_artifacts(q["direction"])
        
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    return updated_count

def run():
    print("=== Cleaning up original JSON text artifacts ===")
    for i in range(1, 11):
        file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
        if not os.path.exists(file_path):
            continue
        cleaned = cleanup_file(file_path)
        print(f"Test {i}: Cleaned text artifacts.")

    print("\n=== Cleanup Complete! ===")

if __name__ == "__main__":
    run()
