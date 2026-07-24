import os

def find_file():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if "sbipo" in file.lower() or "sbi_po" in file.lower() or "sbi-po" in file.lower():
                print(f"Found match: {os.path.join(root, file)}")

if __name__ == "__main__":
    find_file()
