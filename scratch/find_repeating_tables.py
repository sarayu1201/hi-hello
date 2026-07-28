import os
import json
import re

dirpath = "QuestionBank/json/rrb_po"
print("Scanning RRB PO JSONs for text tables when an image is present:")
for root, dirs, files in os.walk(dirpath):
    for f in files:
        if f.endswith(".json"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file_obj:
                data = json.load(file_obj)
            for idx, q in enumerate(data):
                q_text = q.get("question") or ""
                img = q.get("questionImage")
                if img and "|" in q_text:
                    print(f"  File: {f}, Q{idx+1}: contains '|' and questionImage='{img}'")
                    # print first 3 lines of table if any
                    table_lines = [line for line in q_text.splitlines() if "|" in line]
                    print(f"    Table snippet: {repr(table_lines[:3])}")
