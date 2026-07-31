import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"
file_path = os.path.join(dumps_dir, "test7_text.txt")

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    lines = text.split("\n")
    print("--- Scanning Test 7 Solutions Area ---")
    start_printing = False
    lines_printed = 0
    for idx, line in enumerate(lines):
        if "S36. Ans." in line:
            start_printing = True
            
        if start_printing:
            print(f"Line {idx+1}: {line}")
            lines_printed += 1
            if lines_printed > 80:
                break
else:
    print("Test 7 text file not found.")
