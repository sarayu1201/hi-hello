import os
import json

workspace_root = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_root, "QuestionBank", "json", "ibps_clerk_prelims")

skips = [
    (1, 77), (1, 78), (1, 79), (1, 80),
    (2, 51), (2, 52), (2, 53), (2, 54), (2, 55), (2, 77), (2, 78), (2, 79), (2, 80),
    (3, 83), (3, 84), (3, 85), (3, 86), (3, 87), (3, 94), (3, 95), (3, 96),
    (4, 71), (4, 72), (4, 73), (4, 74), (4, 75), (4, 90), (4, 91), (4, 92), (4, 93), (4, 94),
    (5, 96), (5, 97),
    (6, 71), (6, 72), (6, 73), (6, 89), (6, 90), (6, 91),
    (9, 71), (9, 72), (9, 73)
]

print("=== Reading Skipped Questions Text ===")
for test_idx, q_id in skips:
    filename = f"ibps_clerk_prelims_test{test_idx}.json"
    filepath = os.path.join(json_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == q_id:
                print(f"\nTest {test_idx} Q{q_id} (Ans: {q.get('correct_answer')}):")
                print(f"  Q: {q.get('question')}")
