import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    images_dir = os.path.join(root_dir, "QuestionBank", "images")
    
    print("Searching for images subdirectories:")
    for f in os.listdir(images_dir):
        path = os.path.join(images_dir, f)
        if os.path.isdir(path):
            print(f"  Folder: {f}")
            
    # Search for q18.png on disk under QuestionBank/images/
    found = []
    for root, dirs, files in os.walk(images_dir):
        for f in files:
            if "q18.png" in f.lower() or "test2_q16" in f.lower():
                found.append(os.path.join(root, f))
                
    print(f"\nSearch results for image files:")
    for f in found[:10]:
        print(f"  Found at: {os.path.relpath(f, images_dir)}")

if __name__ == "__main__":
    check()
