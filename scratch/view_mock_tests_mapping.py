import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTests.jsx")
    
    if not os.path.exists(filepath):
        print("MockTests.jsx not found")
        return
        
    print("Inspecting MockTests.jsx lines 980-1040:")
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for idx in range(980, min(1040, len(lines))):
        print(f"  Line {idx+1}: {lines[idx].strip()}")

if __name__ == "__main__":
    search()
