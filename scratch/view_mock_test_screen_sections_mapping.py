import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Inspecting MockTestScreen.jsx lines 220-285:")
    for idx in range(220, min(285, len(lines))):
        print(f"  Line {idx+1}: {lines[idx].strip()}")

if __name__ == "__main__":
    search()
