import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main"
    print(f"Searching for 'Courses.jsx' under {root_dir}...")
    
    matches = []
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root or ".git" in root:
            continue
        for f in files:
            if f == "Courses.jsx":
                matches.append(os.path.join(root, f))
                
    print(f"Found {len(matches)} matches:")
    for m in matches:
        print(f"  {m}")
        
if __name__ == "__main__":
    search()
