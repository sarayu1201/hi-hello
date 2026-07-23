import os

def patch():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    test_merger_path = os.path.join(root_dir, "scratch", "test_merger_v2.py")
    
    # Read test_merger_v2.py content
    with open(test_merger_path, "r", encoding="utf-8") as f:
        merger_content = f.read()
        
    # Extract the merge_adjacent_math_blocks function
    start_idx = merger_content.find("def merge_adjacent_math_blocks(text):")
    end_idx = merger_content.find("def test():")
    if start_idx == -1 or end_idx == -1:
        print("Error: Could not locate helper function in test_merger_v2.py")
        return
        
    helper_code = merger_content[start_idx:end_idx].strip()
    
    # Read import_all_papers.py
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Locate where our current merge_adjacent_math_blocks starts and ends
    func_start = content.find("def merge_adjacent_math_blocks(text):")
    func_end = content.find("def to_latex(text):")
    
    if func_start == -1 or func_end == -1:
        print("Error: Could not locate function boundaries in import_all_papers.py")
        return
        
    # Overwrite
    patched_content = content[:func_start] + helper_code + "\n\n\n" + content[func_end:]
    
    with open(importer_path, "w", encoding="utf-8") as f:
        f.write(patched_content)
        
    print("SUCCESS: import_all_papers.py updated directly from working file!")

if __name__ == "__main__":
    patch()
