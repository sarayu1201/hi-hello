import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test1_text.txt"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    lines = text.split("\n")
    for idx, line in enumerate(lines):
        if "136" in line or "17%" in line:
            print(f"--- Found at Line {idx+1} ---")
            for k in range(max(0, idx - 5), min(len(lines), idx + 10)):
                print(f"{k+1}: '{lines[k]}'")
            print("-" * 40)
            break
else:
    print("Test 1 text dump not found!")
