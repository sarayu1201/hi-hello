import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_py = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_py, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Searching for MongoDB connection string in import_all_papers.py:")
    for idx, line in enumerate(lines):
        if "MongoClient" in line or "mongodb" in line:
            print(f"  Line {idx+1}: {line.strip()}")

if __name__ == "__main__":
    check()
