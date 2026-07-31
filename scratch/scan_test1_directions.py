import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

for i in range(1, 11):
    file_path = os.path.join(dumps_dir, f"test{i}_text.txt")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print(f"=== Test {i} Directions ===")
    lines = text.split("\n")
    for idx, line in enumerate(lines):
        if "directions" in line.lower() and any(f"({x}" in line for x in range(31, 71)):
            print(f"Line {idx+1}: {line}")
