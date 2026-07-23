import os

def find():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    print("DIRECTORY STRUCTURE (2 levels):")
    for root, dirs, files in os.walk(root_dir):
        depth = root[len(root_dir):].count(os.sep)
        if depth >= 2:
            continue
            
        indent = "  " * depth
        print(f"{indent}[DIR] {os.path.basename(root) or 'root'}")
        
        # Print first 10 files
        for f in sorted(files)[:10]:
            print(f"{indent}  [FILE] {f}")
            
if __name__ == "__main__":
    find()
