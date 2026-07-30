import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test7_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read().lower()

print("Simple substring checks in test7_text.txt:")
for word in ["english", "reason", "quant", "math", "numerical", "ability", "aptitude"]:
    count = text.count(word)
    print(f"  - '{word}': {count} occurrences")
