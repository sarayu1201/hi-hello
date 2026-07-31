import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

scrambled_info = [
    (2, 32, "32."),
    (2, 34, "34."),
    (2, 35, "35."),
    (2, 40, "40."),
    (3, 40, "40."),
    (4, 47, "47."),
    (4, 48, "48."),
    (4, 51, "51."),
    (4, 55, "55."),
    (4, 56, "56."),
    (4, 60, "60.")
]

for test_idx, q_id, match_str in scrambled_info:
    file_name = f"test{test_idx}_text.txt"
    file_path = os.path.join(dumps_dir, file_name)
    if not os.path.exists(file_path):
        print(f"File not found: {file_name}")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    lines = text.split("\n")
    sol_start = False
    found = False
    for idx, line in enumerate(lines):
        if "solutions" in line.lower() or "hints" in line.lower():
            if idx > len(lines) // 2:
                sol_start = True
        if sol_start and line.strip().startswith(match_str):
            print(f"=== Test {test_idx} Q{q_id} Solution ===")
            for k in range(max(0, idx - 1), min(len(lines), idx + 8)):
                print(f"  {k+1}: '{lines[k]}'")
            print("-" * 40)
            found = True
            break
    if not found:
        print(f"Could not find solution for Test {test_idx} Q{q_id}")
