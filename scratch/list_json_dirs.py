import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json")
    
    print("Folders under QuestionBank/json:")
    for name in os.listdir(json_dir):
        full_path = os.path.join(json_dir, name)
        if os.path.isdir(full_path):
            # count JSON files inside
            json_files = [f for f in os.listdir(full_path) if f.endswith(".json")]
            print(f"  Folder: '{name}' -> contains {len(json_files)} JSON files")

if __name__ == "__main__":
    check()
