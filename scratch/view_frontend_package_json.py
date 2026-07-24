import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    pkg_path = os.path.join(root_dir, "frontend", "package.json")
    
    if os.path.exists(pkg_path):
        print("FOUND frontend/package.json content:")
        with open(pkg_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            print(json.dumps(data, indent=2))
    else:
        print("frontend/package.json not found")

if __name__ == "__main__":
    check()
