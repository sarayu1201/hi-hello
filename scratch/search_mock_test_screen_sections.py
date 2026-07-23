import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    if not os.path.exists(filepath):
        print("MockTestScreen.jsx not found")
        return
        
    print("Inspecting how MockTestScreen.jsx handles sections/questions:")
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for idx, line in enumerate(lines):
        if "sections" in line or "sectionMap" in line or "questions.filter" in line or "cleanQuestions" in line:
            if idx > 150 and idx < 280:
                print(f"  Line {idx+1}: {line.strip()}")

if __name__ == "__main__":
    search()
