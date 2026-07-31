import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"
file_path = os.path.join(dumps_dir, "test1_text.txt")

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    lines = text.split("\n")
    print("=== Test 1 Original Q47 ===")
    for idx, line in enumerate(lines):
        if "invested Rs.P" in line or "invested Rs. P" in line or "Rs.3456" in line:
            for i in range(max(0, idx-5), min(len(lines), idx+15)):
                print(f"Line {i+1}: {lines[i]}")
            break
else:
    print("Test 1 text dump not found.")
