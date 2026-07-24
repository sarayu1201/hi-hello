import os
import json
import re

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    malformed_count = 0
    
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_id = q.get("id")
            for field in ["question", "explanation"]:
                text = q.get(field, "") or ""
                if not text:
                    continue
                
                # Check for common LaTeX errors
                errors = []
                
                # 1. Check for \d\frac or \d or \dfrac problems
                if r"\d\frac" in text:
                    errors.append(r"contains '\d\frac'")
                if r"\d{" in text:
                    errors.append(r"contains '\d{'")
                
                # 2. Check for text{...} inside math or missing backslash
                # e.g., "text{" not preceded by backslash, or "text{" within a math block
                if re.search(r'(?<!\\)text\s*\{', text):
                    errors.append("contains 'text{' without backslash")
                    
                # 3. Check for merged words with LaTeX commands, e.g. "is\frac", "remaining\frac"
                merged = re.findall(r'\b[a-zA-Z]+(?=\\(?:frac|sqrt|dfrac|le|ge|div|times))', text)
                if merged:
                    errors.append(f"merged words before command: {merged}")
                    
                # 4. Check for merged words after LaTeX brackets, e.g. "\frac{1}{2}of"
                merged_after = re.findall(r'\\(?:frac|dfrac)\{[^}]*\}\{[^}]*\}([a-zA-Z]+)', text)
                if merged_after:
                    errors.append(f"merged words after fraction: {merged_after}")
                    
                # 5. Check for raw backslashes without commands in normal text
                # e.g. "Rs. \ 500" or similar
                
                if errors:
                    print(f"{filename} Q{q_id} ({field}):")
                    print(f"  Text: {repr(text)}")
                    print(f"  Errors: {errors}")
                    print("-" * 50)
                    malformed_count += 1
                    
    print(f"Total malformed questions/fields found: {malformed_count}")

if __name__ == "__main__":
    check()
