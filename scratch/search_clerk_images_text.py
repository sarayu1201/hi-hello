import json
import os

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

print("=== Scanning Quantitative Aptitude for Questions Needing Graphs/Tables ===")
for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("subject") == "Quantitative Aptitude":
            dir_text = q.get("direction", "")
            q_text = q.get("question", "")
            full_text = f"{dir_text} {q_text}".lower()
            
            # Look for indicators of visual data representation
            if any(k in full_text for k in ["graph", "chart", "table shows", "table given", "pie chart", "following table", "bar diagram"]):
                print(f"Test {i} Q{q['id']}:")
                print(f"  Direction: {q.get('direction')}")
                print(f"  Question: {q.get('question')}")
                print(f"  Current image: {repr(q.get('question_image'))}")
                print("-" * 30)
