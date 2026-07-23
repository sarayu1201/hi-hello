import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads"
    print(f"Searching for 'Courses.jsx' under {root_dir}...")
    
    matches = []
    # Limit walking to avoid scanning huge system/temp folders, but scan Downloads subfolders
    for item in os.listdir(root_dir):
        item_path = os.path.join(root_dir, item)
        if os.path.isdir(item_path):
            # Skip huge system/known dirs
            if item.startswith(".") or "cache" in item.lower():
                continue
            for sub_root, sub_dirs, sub_files in os.walk(item_path):
                if "node_modules" in sub_root or ".git" in sub_root:
                    continue
                for f in sub_files:
                    if f == "Courses.jsx":
                        matches.append(os.path.join(sub_root, f))
                        
    print(f"Found {len(matches)} matches:")
    for m in matches:
        print(f"  {m}")
        
if __name__ == "__main__":
    search()
