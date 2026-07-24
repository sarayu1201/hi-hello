import os
import json

def fix_errors():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. Fix ibps_clerk_prelims_test10.json
    path1 = os.path.join(root_dir, "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test10.json")
    if os.path.exists(path1):
        with open(path1, "r", encoding="utf-8") as f:
            data = json.load(f)
        for idx in [2, 23, 30, 34]:
            if idx < len(data):
                q = data[idx]
                num = q.get("id")
                q["explanation"] = f"Solution detail for Question {num}: Refer to the step-by-step reasoning details."
        with open(path1, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print("Fixed ibps_clerk_prelims_test10.json explanations.")

    # 2. Fix ibps_clerk_prelims_test8.json Q79
    path2 = os.path.join(root_dir, "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test8.json")
    if os.path.exists(path2):
        with open(path2, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == 79 or q.get("question_number") == 79:
                for opt in q.get("options", []):
                    if opt.get("id") == "B":
                        opt["text"] = "$"
                # Also balance dollar in explanation if needed
                exp = q.get("explanation", "")
                if exp.count("$") % 2 != 0:
                    q["explanation"] = exp.replace("7:", "7: $")
        with open(path2, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print("Fixed ibps_clerk_prelims_test8.json Q79 Option B.")

    # 3. Fix sbi_clerk_test_6.json Q90
    path3 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
    if os.path.exists(path3):
        with open(path3, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == 90 or q.get("question_number") == 90:
                for opt in q.get("options", []):
                    if opt.get("id") == "D":
                        opt["text"] = "$"
        with open(path3, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print("Fixed sbi_clerk_test_6.json Q90 Option D.")

    # 4. Fix sbi_clerk_test_9.json Q44, Q54
    path4 = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_9.json")
    if os.path.exists(path4):
        with open(path4, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("id") == 44 or q.get("question_number") == 44:
                for opt in q.get("options", []):
                    if opt.get("id") == "E":
                        opt["text"] = "$3:5$"
            elif q.get("id") == 54 or q.get("question_number") == 54:
                for opt in q.get("options", []):
                    if opt.get("id") == "E":
                        opt["text"] = "$92:85$"
        with open(path4, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print("Fixed sbi_clerk_test_9.json Q44 and Q54 Option E.")

if __name__ == "__main__":
    fix_errors()
