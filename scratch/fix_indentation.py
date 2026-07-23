import os

def fix():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    # We want to remove the lines:
    # "if not text:\n" and "        return \"\"\n"
    # right after "    text = merge_adjacent_math_blocks(text)\n"
    
    target_idx = -1
    for idx, line in enumerate(lines):
        if "text = merge_adjacent_math_blocks(text)" in line:
            target_idx = idx
            break
            
    if target_idx != -1:
        # Check if the next two lines are the redundant ones
        if "if not text:" in lines[target_idx + 1] and "return" in lines[target_idx + 2]:
            print(f"Removing redundant lines at indices {target_idx + 2} and {target_idx + 3}")
            del lines[target_idx + 1:target_idx + 3]
            
            with open(importer_path, "w", encoding="utf-8") as f:
                f.writelines(lines)
            print("SUCCESS: Indentation fixed!")
        else:
            print("Could not verify redundant lines pattern")
    else:
        print("Could not locate merge_adjacent_math_blocks in file")

if __name__ == "__main__":
    fix()
