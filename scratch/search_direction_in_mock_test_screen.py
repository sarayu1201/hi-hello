import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Searching for 'direction' in MockTestScreen.jsx:")
    for idx, line in enumerate(lines):
        if "direction" in line or "Direction" in line:
            print(f"  Line {idx+1}: {line.strip()}")

if __name__ == "__main__":
    search()
