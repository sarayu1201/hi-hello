import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("async function getMockEligibleQuestions")
    if start_idx == -1:
        start_idx = content.find("const getMockEligibleQuestions")
        
    if start_idx != -1:
        print("FOUND getMockEligibleQuestions implementation:")
        lines = content[start_idx:start_idx+1500].splitlines()
        for idx, line in enumerate(lines):
            print(f"  Line {idx+1}: {line}")
    else:
        print("getMockEligibleQuestions not found")

if __name__ == "__main__":
    search()
