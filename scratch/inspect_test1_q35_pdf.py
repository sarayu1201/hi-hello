import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test1_text.txt"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    lines = text.split("\n")
    print("--- Searching for 360 ---")
    for idx, line in enumerate(lines):
        if "360" in line:
            print(f"Line {idx+1}: '{line}'")
            for k in range(max(0, idx - 2), min(len(lines), idx + 5)):
                print(f"  {k+1}: '{lines[k]}'")
            print("-" * 30)
            
    print("\n--- Searching for 2744 ---")
    for idx, line in enumerate(lines):
        if "2744" in line:
            print(f"Line {idx+1}: '{line}'")
            for k in range(max(0, idx - 2), min(len(lines), idx + 5)):
                print(f"  {k+1}: '{lines[k]}'")
            print("-" * 30)
else:
    print("Test 1 text dump not found!")
