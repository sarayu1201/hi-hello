import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_path = os.path.join(root_dir, "frontend")
    git_file = os.path.join(frontend_path, ".git")
    
    print(f"Checking '{git_file}':")
    print(f"  os.path.lexists: {os.path.lexists(git_file)}")
    if os.path.lexists(git_file):
        print(f"  os.path.isfile: {os.path.isfile(git_file)}")
        print(f"  os.path.isdir: {os.path.isdir(git_file)}")
        with open(git_file, "r", errors="ignore") as f:
            print(f"  Content: {repr(f.read())}")
            
    # List files in frontend to see if anything is there
    print(f"\nListing frontend directory contents (first 10):")
    if os.path.exists(frontend_path):
        for f in os.listdir(frontend_path)[:10]:
            print(f"  {f}")
            
if __name__ == "__main__":
    check()
