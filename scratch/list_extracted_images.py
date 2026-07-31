import os

images_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images"

for d in sorted(os.listdir(images_dir)):
    sub_path = os.path.join(images_dir, d)
    if os.path.isdir(sub_path):
        files = [f for f in os.listdir(sub_path) if f.lower().endswith((".png", ".jpg"))]
        if files:
            print(f"Folder: {d} ({len(files)} files)")
            for f in sorted(files):
                print(f"  - {f}")
