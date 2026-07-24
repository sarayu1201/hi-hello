import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    count = 0
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
            options = q.get("options", [])
            if options:
                first_opt = options[0]
                opt_text = first_opt.get("text", "") if isinstance(first_opt, dict) else first_opt
                opt_text = str(opt_text)
                if opt_text.strip().startswith("?"):
                    print(f"Found option mark bug in {file} Q#{q.get('id')}: {repr(opt_text)}")
                    count += 1
                    
    print(f"\nTotal CGL questions with option mark bug: {count}")

if __name__ == "__main__":
    check()
