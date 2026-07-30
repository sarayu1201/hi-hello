import os
import re

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test9_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

print("Finding occurrences of solutions-like terms in Test 9:")
lines = text.split("\n")
for idx, line in enumerate(lines):
    # Check if line has any Solutions, Answers, etc.
    if re.search(r'\b(solutions|answers|explanations|hints)\b', line, re.IGNORECASE):
        print(f"Line {idx+1}: '{line.strip()}'")

print("\nFinding first occurrence of S1. Ans in Test 9:")
first_sol_match = re.search(r'^\s*S1\s*\.\s*Ans', text, re.MULTILINE | re.IGNORECASE)
if first_sol_match:
    idx = first_sol_match.start()
    line_num = text[:idx].count("\n") + 1
    print(f"Found S1. Ans on Line {line_num}")
