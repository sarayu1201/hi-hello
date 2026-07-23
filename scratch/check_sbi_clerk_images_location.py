import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sbi_json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    # Let's collect some image filenames referenced in SBI Clerk JSONs
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
                    
    print(f"Total image files referenced in SBI Clerk JSONs: {len(image_names)}")
    if not image_names:
        print("No images referenced in the JSONs.")
        return
        
    sample_images = sorted(list(image_names))[:10]
    print(f"Sample image names: {sample_images}")
    
    # Let's find where these files actually exist on disk
    print("\nSearching for these sample files on disk:")
    for img in sample_images:
        found = False
        for root, dirs, files in os.walk(root_dir):
            if img in files:
                rel_path = os.path.relpath(os.path.join(root, img), root_dir)
                print(f"  Found '{img}' at: {rel_path}")
                found = True
        if not found:
            print(f"  Could NOT find '{img}' anywhere in the workspace!")

if __name__ == "__main__":
    check()
