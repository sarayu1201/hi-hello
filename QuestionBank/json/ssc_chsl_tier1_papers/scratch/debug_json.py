import json

path = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main\QuestionBank\json\ssc_chsl_tier1_papers\ssc_chsl_tier1_paper4.json"

try:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print("Successfully parsed JSON!")
except Exception as e:
    print(f"Error: {e}")
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    # Print the lines around 1218 with their repr
    for idx in range(1210, 1225):
        if idx < len(lines):
            print(f"{idx+1}: {repr(lines[idx])}")
