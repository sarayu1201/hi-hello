import os

txt_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_2020_pdf_text.txt"

with open(txt_path, "r", encoding="utf-8") as f:
    text = f.read()

print("Searching for answer section headers...")
lines = text.split("\n")

for idx, line in enumerate(lines):
    if "english language" in line.lower() or "numerical ability" in line.lower() or "reasoning ability" in line.lower():
        if "solution" in line.lower() or "answer" in line.lower() or "keys" in line.lower():
            print(f"Header found on line {idx + 1}: '{line}'")
            
    if "s1. ans" in line.lower() or "s31. ans" in line.lower() or "s66. ans" in line.lower():
        print(f"Solution marker found on line {idx + 1}: '{line}'")
        # Print a bit of context
        print("\n--- Context ---")
        for j in range(max(0, idx - 1), min(len(lines), idx + 8)):
            print(f"  {j+1}: {lines[j]}")
        print("---------------\n")
