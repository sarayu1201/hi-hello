import os

def find():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    file_path = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    if not os.path.exists(file_path):
        print("MockTestScreen.jsx not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Matches for 'currentQuestion' in MockTestScreen.jsx:")
    for idx, line in enumerate(lines):
        if "currentQuestion" in line:
            print(f"  Line {idx+1}: {line.strip()}")
            
if __name__ == "__main__":
    find()
