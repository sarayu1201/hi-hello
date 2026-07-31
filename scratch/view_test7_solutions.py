import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"
file_path = os.path.join(dumps_dir, "test7_text.txt")

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print("--- Searching for Solutions in Test 7 text dump ---")
    # Search for "36." or "37." or "38." inside the solutions area
    # Usually solutions are at the end of the text file, e.g. starting around line 1200 or similar
    lines = text.split("\n")
    for idx, line in enumerate(lines):
        if "36." in line and idx > 800:
            print(f"Line {idx+1}: {line}")
            for k in range(1, 15):
                if idx+k < len(lines):
                    print(f"  {lines[idx+k]}")
            print("-" * 30)
else:
    print("Test 7 text dump not found.")
