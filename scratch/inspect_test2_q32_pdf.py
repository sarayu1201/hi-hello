import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test2_text.txt"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    lines = text.split("\n")
    print("--- Searching for 656 ---")
    for idx, line in enumerate(lines):
        if "656" in line:
            print(f"Line {idx+1}: '{line}'")
            for k in range(max(0, idx - 5), min(len(lines), idx + 10)):
                print(f"  {k+1}: '{lines[k]}'")
            print("-" * 30)
            break
            
    print("\n--- Searching for 31728 ---")
    for idx, line in enumerate(lines):
        if "31728" in line or "1728" in line:
            print(f"Line {idx+1}: '{line}'")
            for k in range(max(0, idx - 5), min(len(lines), idx + 10)):
                print(f"  {k+1}: '{lines[k]}'")
            print("-" * 30)
            break
else:
    print("Test 2 text dump not found!")
