import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    print("Searching for files named 'sbi_clerk_test_1.json' on disk:")
    for root, dirs, files in os.walk(root_dir):
        for f in files:
            if f == "sbi_clerk_test_1.json":
                rel_path = os.path.relpath(os.path.join(root, f), root_dir)
                print(f"  Found file at: {rel_path}")

if __name__ == "__main__":
    search()
