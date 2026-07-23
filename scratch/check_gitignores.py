import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    parent_dir = os.path.dirname(root_dir)
    
    paths = [
        os.path.join(root_dir, ".gitignore"),
        os.path.join(parent_dir, ".gitignore"),
    ]
    
    for p in paths:
        if os.path.exists(p):
            print(f"Found gitignore at: {p}")
            with open(p, "r", encoding="utf-8") as f:
                print(f"--- CONTENT ({p}) ---")
                print(f.read())
                print("---------------------")
        else:
            print(f"No gitignore at: {p}")
            
if __name__ == "__main__":
    check()
