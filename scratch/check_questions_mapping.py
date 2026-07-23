import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    file_path = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    if not os.path.exists(file_path):
        print("MockTestScreen.jsx not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find activeQuestions or questionsList mapping
    lines = content.splitlines()
    print("Mapping of questions in state:")
    for idx, line in enumerate(lines):
        if "activeQuestions" in line or "questionsList" in line or "mockData.questions" in line or "setQuestions" in line:
            print(f"  Line {idx+1}: {line.strip()}")
            
if __name__ == "__main__":
    check()
