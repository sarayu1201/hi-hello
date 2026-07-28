import os
import json
import re

dirpath = "QuestionBank/json/rrb_po"
print("Auditing LaTeX syntax in RRB PO JSONs:")

odd_dollar_questions = []
raw_percent_in_math = []
sqrt_paren_issues = []

for root, dirs, files in os.walk(dirpath):
    for f in files:
        if f.endswith(".json"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file_obj:
                data = json.load(file_obj)
            for idx, q in enumerate(data):
                q_text = q.get("question") or ""
                explanation = q.get("explanation") or ""
                
                # Check 1: Odd number of $ (excluding escaped \$)
                clean_q_text = q_text.replace(r"\$", "")
                dollars_count = clean_q_text.count("$")
                if dollars_count % 2 != 0:
                    odd_dollar_questions.append((f, idx+1, "question", q_text))
                
                clean_exp = explanation.replace(r"\$", "")
                dollars_exp_count = clean_exp.count("$")
                if dollars_exp_count % 2 != 0:
                    odd_dollar_questions.append((f, idx+1, "explanation", explanation))
                
                # Check 2: Raw % in math blocks
                # Find all math blocks $...$
                math_blocks = re.findall(r'(?<!\\)\$([\s\S]*?)(?<!\\)\$', q_text)
                for block in math_blocks:
                    if re.search(r'(?<!\\)%', block):
                        raw_percent_in_math.append((f, idx+1, "question", block))
                
                math_blocks_exp = re.findall(r'(?<!\\)\$([\s\S]*?)(?<!\\)\$', explanation)
                for block in math_blocks_exp:
                    if re.search(r'(?<!\\)%', block):
                        raw_percent_in_math.append((f, idx+1, "explanation", block))
                
                # Check 3: sqrt( or \sqrt( instead of \sqrt{
                if "sqrt(" in q_text.lower() or "\\sqrt(" in q_text.lower():
                    sqrt_paren_issues.append((f, idx+1, "question", q_text))
                if "sqrt(" in explanation.lower() or "\\sqrt(" in explanation.lower():
                    sqrt_paren_issues.append((f, idx+1, "explanation", explanation))
                for opt in q.get("options") or []:
                    opt_text = opt.get("text") or ""
                    if "sqrt(" in opt_text.lower() or "\\sqrt(" in opt_text.lower():
                        sqrt_paren_issues.append((f, idx+1, f"option {opt.get('id')}", opt_text))

if odd_dollar_questions:
    print(f"\nFound {len(odd_dollar_questions)} questions with odd dollar count:")
    for f, qn, field, text in odd_dollar_questions[:10]:
        print(f"  File: {f}, Q{qn} ({field}): {repr(text[:120])}")
else:
    print("\nNo odd dollar count issues found.")

if raw_percent_in_math:
    print(f"\nFound {len(raw_percent_in_math)} math blocks with raw % (should be \\%):")
    for f, qn, field, block in raw_percent_in_math[:15]:
        print(f"  File: {f}, Q{qn} ({field}): {repr(block[:120])}")
else:
    print("\nNo raw percent in math issues found.")

if sqrt_paren_issues:
    print(f"\nFound {len(sqrt_paren_issues)} items with sqrt( parenthesis instead of braces:")
    for f, qn, field, text in sqrt_paren_issues[:10]:
        print(f"  File: {f}, Q{qn} ({field}): {repr(text[:120])}")
else:
    print("\nNo sqrt parenthesis issues found.")
