import os
import json

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_base = os.path.join(root_dir, "QuestionBank", "json", "sbi_po_prelims")
    
    out_lines = []
    
    for filename in sorted(os.listdir(json_base)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(json_base, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        subj_counts = {}
        for q in data:
            subj = q.get("subject") or q.get("section") or "Unknown"
            subj_counts[subj] = subj_counts.get(subj, 0) + 1
            
        out_lines.append(f"File: {filename} (Total: {len(data)})")
        for s, count in sorted(subj_counts.items()):
            out_lines.append(f"  - {s}: {count}")
        out_lines.append("-" * 30)
        
    with open(os.path.join(root_dir, "scratch", "analyze_subjects_output.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))
    print("Subject analysis output generated!")

if __name__ == "__main__":
    run()
