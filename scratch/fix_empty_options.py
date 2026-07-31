import os
import json

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

# Define the 42 questions that need options generated
syllogisms = [
    (1, 77), (1, 78), (1, 79), (1, 80),
    (3, 94), (3, 95), (3, 96),
    (4, 90), (4, 91), (4, 92), (4, 93), (4, 94),
    (5, 96), (5, 97),
    (6, 89), (6, 90), (6, 91)
]

inequalities = [
    (2, 77), (2, 78), (2, 79), (2, 80),
    (3, 83), (3, 84), (3, 85), (3, 86), (3, 87),
    (4, 71), (4, 72), (4, 73), (4, 74), (4, 75),
    (6, 71), (6, 72), (6, 73),
    (9, 71), (9, 72), (9, 73)
]

quadratics = [
    (2, 51), (2, 52), (2, 53), (2, 54), (2, 55)
]

# Standard option arrays
opts_syllogism = [
    {"id": "A", "text": "If only conclusion I follows"},
    {"id": "B", "text": "If only conclusion II follows"},
    {"id": "C", "text": "If either conclusion I or II follows"},
    {"id": "D", "text": "If neither conclusion I nor II follows"},
    {"id": "E", "text": "If both conclusions I and II follow"}
]

opts_inequality = [
    {"id": "A", "text": "If only conclusion I is true"},
    {"id": "B", "text": "If only conclusion II is true"},
    {"id": "C", "text": "If either conclusion I or II is true"},
    {"id": "D", "text": "If neither conclusion I nor II is true"},
    {"id": "E", "text": "If both conclusions I and II are true"}
]

opts_quadratic = [
    {"id": "A", "text": "If x > y"},
    {"id": "B", "text": "If x < y"},
    {"id": "C", "text": "If x ≥ y"},
    {"id": "D", "text": "If x ≤ y"},
    {"id": "E", "text": "If x = y or the relationship cannot be established"}
]

print("=== Fixing Empty Options in JSON Files ===")
for i in range(1, 11):
    filename = f"ibps_clerk_prelims_test{i}.json"
    filepath = os.path.join(json_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    updated = False
    for q in data:
        q_id = q.get("id")
        
        # Check if syllogism
        if (i, q_id) in syllogisms:
            q["options"] = opts_syllogism
            updated = True
            
        # Check if inequality
        elif (i, q_id) in inequalities:
            q["options"] = opts_inequality
            updated = True
            
        # Check if quadratic
        elif (i, q_id) in quadratics:
            q["options"] = opts_quadratic
            updated = True
            
    if updated:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  Fixed options for Test {i}")

print("\nAll empty options fixed successfully!")
