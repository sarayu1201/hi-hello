import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test8_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
# Search from the 60% mark onwards
start_idx = int(len(lines) * 0.6)
for idx in range(start_idx, len(lines)):
    line = lines[idx]
    if "18." in line or "s18" in line.lower() or "ans18" in line.lower() or "ans.18" in line.lower():
        print(f"--- Found Solution 18 at Line {idx+1} ---")
        for k in range(max(0, idx - 5), min(len(lines), idx + 15)):
            print(f"{k+1}: '{lines[k]}'")
        print("-" * 40)
        break
