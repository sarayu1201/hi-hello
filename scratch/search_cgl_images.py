import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    img_questions = 0
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
            qid = q.get("id")
            q_img = q.get("questionImage") or q.get("question_image")
            options = q.get("options", [])
            
            has_opt_img = False
            for opt in options:
                if isinstance(opt, dict) and (opt.get("image") or opt.get("option_image")):
                    has_opt_img = True
                    
            if q_img or has_opt_img:
                print(f"Found image reference in {file} Q#{qid}:")
                if q_img:
                    print(f"  Question Image: {repr(q_img)}")
                if has_opt_img:
                    print(f"  Option Image: Present")
                img_questions += 1
                
    print(f"\nTotal CGL questions with image references: {img_questions}")

if __name__ == "__main__":
    check()
