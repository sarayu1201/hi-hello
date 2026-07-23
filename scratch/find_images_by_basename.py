import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sbi_json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    image_names = set()
    for filename in os.listdir(sbi_json_dir):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(sbi_json_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            q_img = q.get("questionImage") or q.get("question_image")
            if q_img:
                image_names.add(q_img)
            for opt in q.get("options", []):
                opt_img = opt.get("image") if isinstance(opt, dict) else None
                if opt_img:
                    image_names.add(opt_img)
                    
    sample_images = sorted(list(image_names))[:10]
    
    print("Searching for basenames on disk:")
    for img_path in sample_images:
        base_name = os.path.basename(img_path)
        found = False
        for root, dirs, files in os.walk(root_dir):
            if base_name in files:
                rel_path = os.path.relpath(os.path.join(root, base_name), root_dir)
                print(f"  Referenced: '{img_path}' -> Found file at: '{rel_path}'")
                found = True
        if not found:
            print(f"  Referenced: '{img_path}' -> NOT FOUND ANYWHERE!")

if __name__ == "__main__":
    check()
