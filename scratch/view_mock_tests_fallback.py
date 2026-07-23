import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTests.jsx")
    
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Inspecting MockTests.jsx lines 610-650:")
    for idx in range(610, min(650, len(lines))):
        print(f"  Line {idx+1}: {lines[idx].strip()}")

if __name__ == "__main__":
    search()
