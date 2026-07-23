import os
import json
import re

def analyze():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sbi_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    for filename in sorted(os.listdir(sbi_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(sbi_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_text = q.get("question", "") or ""
            # If there are 3 or more unescaped dollar signs
            dollars = re.findall(r'(?<!\\)\$', q_text)
            if len(dollars) >= 3:
                # Let's print the parts
                parts = q_text.split('$')
                # Parts at odd indices are INSIDE math blocks: e.g. parts[1], parts[3]
                # Parts at even indices are OUTSIDE math blocks: e.g. parts[0], parts[2], parts[4]
                # If the text outside math blocks between two math blocks is very short, print it
                gaps = []
                for idx in range(2, len(parts) - 1, 2):
                    gap = parts[idx]
                    gaps.append(repr(gap))
                if gaps:
                    print(f"[{filename}] Q#{q.get('id')}:")
                    print(f"  Raw:  {repr(q_text)}")
                    print(f"  Gaps: {', '.join(gaps)}")

if __name__ == "__main__":
    analyze()
