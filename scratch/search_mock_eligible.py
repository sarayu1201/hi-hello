import os

def find():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_path = os.path.join(root_dir, "backend", "server.js")
    
    if not os.path.exists(server_path):
        return
        
    with open(server_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    print("SEARCHING FOR KEYWORDS IN server.js:")
    
    keywords = ["getMockEligibleQuestions", "questions", "mapTestIdToSubtype", "mapTestId", "Subtype", "test_id"]
    for kw in keywords:
        count = content.count(kw)
        print(f"  Keyword '{kw}': {count} occurrences")
        
    # Print lines containing getMockEligibleQuestions if found
    lines = content.splitlines()
    for idx, line in enumerate(lines):
        if "getMockEligibleQuestions" in line:
            print(f"    Line {idx+1}: {line.strip()}")
            
if __name__ == "__main__":
    find()
