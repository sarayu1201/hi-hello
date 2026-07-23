import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "Courses.jsx")
    
    if not os.path.exists(filepath):
        print("Courses.jsx not found")
        return
        
    print("Inspecting Courses.jsx lines 2390-2435:")
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for idx in range(2390, min(2435, len(lines))):
        print(f"  Line {idx+1}: {lines[idx].strip()}")

if __name__ == "__main__":
    search()
