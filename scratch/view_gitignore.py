import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    gitignore_path = os.path.join(root_dir, ".gitignore")
    
    if os.path.exists(gitignore_path):
        print("FOUND .gitignore content:")
        with open(gitignore_path, "r", encoding="utf-8") as f:
            print(f.read())
    else:
        print(".gitignore not found")

if __name__ == "__main__":
    check()
