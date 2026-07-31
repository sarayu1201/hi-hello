import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test3_text.txt"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    lines = text.split("\n")
    for k in range(1538, 1570):
        print(f"{k+1}: '{lines[k]}'")
else:
    print("Test 3 text dump not found!")
