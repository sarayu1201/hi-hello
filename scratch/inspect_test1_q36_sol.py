import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test1_text.txt"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    lines = text.split("\n")
    sol_start = False
    for idx, line in enumerate(lines):
        if "solutions" in line.lower() or "hints" in line.lower():
            if idx > len(lines) // 2:
                sol_start = True
        if sol_start and "36." in line:
            print(f"--- Found Solution 36 at Line {idx+1} ---")
            for k in range(max(0, idx - 2), min(len(lines), idx + 10)):
                print(f"{k+1}: '{lines[k]}'")
            print("-" * 40)
            break
else:
    print("Test 1 text dump not found!")
