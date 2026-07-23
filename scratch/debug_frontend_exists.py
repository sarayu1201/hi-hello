import os

def debug():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_path = os.path.join(root_dir, "frontend")
    
    print("Folders in root/frontend:")
    if os.path.exists(frontend_path):
        items = os.listdir(frontend_path)
        for item in items:
            full_path = os.path.join(frontend_path, item)
            print(f"  {item} (is_dir: {os.path.isdir(full_path)})")
            
        src_path = os.path.join(frontend_path, "src")
        print(f"\nsrc path exists: {os.path.exists(src_path)}")
        if os.path.exists(src_path):
            print("Contents of frontend/src:")
            print(os.listdir(src_path))
    else:
        print("frontend path does not exist")
        
if __name__ == "__main__":
    debug()
