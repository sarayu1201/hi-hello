import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # Search all backend JS files
    backend_dir = os.path.join(root_dir, "backend")
    for root, dirs, files in os.walk(backend_dir):
        if "node_modules" in root:
            continue
        for f in files:
            if f.endswith(".js"):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    for line_num, line in enumerate(file):
                        if 'mongoose.model("Question"' in line or 'mongoose.model(\'Question\'' in line or 'const QuestionSchema' in line:
                            print(f"  Found Question Schema in {f} around line {line_num+1}:")
                            # Print 40 lines around it
                            file.seek(0)
                            file_lines = file.readlines()
                            start = max(0, line_num - 10)
                            end = min(len(file_lines), line_num + 35)
                            for idx in range(start, end):
                                print(f"    Line {idx+1}: {file_lines[idx].strip()}")

if __name__ == "__main__":
    search()
