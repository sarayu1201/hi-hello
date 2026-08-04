import os
import json

root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
json_base = os.path.join(root_dir, "QuestionBank", "json")

stats = {}

for course in sorted(os.listdir(json_base)):
    course_path = os.path.join(json_base, course)
    if not os.path.isdir(course_path):
        continue
        
    stats[course] = {
        "total": 0,
        "missing": 0,
        "short": 0,
        "subjects": {}
    }
    
    for filename in sorted(os.listdir(course_path)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(course_path, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            continue
            
        for q in data:
            stats[course]["total"] += 1
            subj = q.get("subject") or q.get("section") or "Unknown"
            stats[course]["subjects"][subj] = stats[course]["subjects"].get(subj, 0) + 1
            
            expl = q.get("explanation", "").strip()
            if not expl:
                stats[course]["missing"] += 1
            elif len(expl) < 40:
                stats[course]["short"] += 1

print("=== EXPLANATIONS SCAN ===")
for course, data in stats.items():
    print(f"Course: {course}")
    print(f"  Total: {data['total']}")
    print(f"  Missing: {data['missing']}")
    print(f"  Short (<40 chars): {data['short']}")
    print(f"  Subjects: {data['subjects']}")
