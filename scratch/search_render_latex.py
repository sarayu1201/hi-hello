import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_src = os.path.join(root_dir, "frontend", "src")
    
    for root, dirs, files in os.walk(frontend_src):
        for f in files:
            if f.endswith((".js", ".jsx")):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    for line_num, line in enumerate(file):
                        if "const renderLaTeX" in line or "function renderLaTeX" in line:
                            print(f"Found renderLaTeX in {f}:{line_num+1}: {line.strip()}")
                            # Print next 20 lines
                            file.seek(0)
                            file_lines = file.readlines()
                            for idx in range(line_num, min(len(file_lines), line_num + 20)):
                                print(f"  Line {idx+1}: {file_lines[idx].strip()}")
                            return

if __name__ == "__main__":
    search()
