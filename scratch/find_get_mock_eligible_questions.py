import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("function getMockEligibleQuestions")
    if start_idx == -1:
        start_idx = content.find("const getMockEligibleQuestions")
        
    if start_idx != -1:
        line_num = content[:start_idx].count("\n") + 1
        print(f"getMockEligibleQuestions starts at line {line_num}")
        lines = content[start_idx:start_idx+120].splitlines()
        for idx, line in enumerate(lines):
            print(f"  Line {line_num + idx}: {line}")
    else:
        print("getMockEligibleQuestions function not found")

if __name__ == "__main__":
    check()
