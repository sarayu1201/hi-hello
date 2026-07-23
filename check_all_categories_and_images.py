import os
import glob

json_base = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json"
img_base = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\backend\uploads\images"

print("=== JSON DIRECTORIES ===")
if os.path.exists(json_base):
    for d in sorted(os.listdir(json_base)):
        dpath = os.path.join(json_base, d)
        if os.path.isdir(dpath):
            files = os.listdir(dpath)
            print(f"{d:<25} -> {len(files)} files (e.g. {files[:3]})")

print("\n=== IMAGE DIRECTORIES ===")
if os.path.exists(img_base):
    subdirs = [s for s in os.listdir(img_base) if os.path.isdir(os.path.join(img_base, s))]
    files = [f for f in os.listdir(img_base) if os.path.isfile(os.path.join(img_base, f))]
    print(f"Total image subdirectories: {len(subdirs)}")
    print(f"Total standalone image files in root: {len(files)}")
    print("Sample subdirs:", subdirs[:15])

