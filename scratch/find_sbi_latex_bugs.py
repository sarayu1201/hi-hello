import os
import json

def search():
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
            # Search for the formulas from screenshots
            if "7" in q_text and "8)" in q_text:
                print(f"[{filename}] Q#{q.get('id')} matches '7 ... 8)':")
                print(f"  Raw JSON: {repr(q_text)}")
            if "36 + 30" in q_text or "30%" in q_text and "750" in q_text:
                print(f"[{filename}] Q#{q.get('id')} matches '36 + 30% ... 750':")
                print(f"  Raw JSON: {repr(q_text)}")

if __name__ == "__main__":
    search()
