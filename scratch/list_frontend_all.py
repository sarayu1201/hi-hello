import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_path = os.path.join(root_dir, "frontend")
    
    print(f"Listing all files in '{frontend_path}':")
    if not os.path.exists(frontend_path):
        print("frontend directory does not exist")
        return
        
    for root, dirs, files in os.walk(frontend_path):
        # Skip node_modules and dist for print efficiency
        if "node_modules" in root or "dist" in root:
            continue
            
        rel_path = os.path.relpath(root, frontend_path)
        print(f"  [DIR] frontend/{rel_path if rel_path != '.' else ''}")
        for f in files:
            print(f"    [FILE] {f}")
            
if __name__ == "__main__":
    check()
