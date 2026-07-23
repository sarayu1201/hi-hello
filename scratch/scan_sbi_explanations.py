import os
import json

def scan_files():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sbi_folder = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    if not os.path.exists(sbi_folder):
        print("sbi clerk folder not found")
        return
        
    for file in sorted(os.listdir(sbi_folder)):
        if not file.endswith(".json"):
            continue
            
        filepath = os.path.join(sbi_folder, file)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            missing_exp = []
            invalid_opt = []
            
            for idx, q in enumerate(data):
                q_id = q.get("id", idx + 1)
                
                # Check explanation
                exp = q.get("explanation", "").strip()
                if not exp or len(exp) < 10:
                    missing_exp.append(q_id)
                    
                # Check options
                opts = q.get("options", [])
                if not opts or len(opts) < 4:
                    invalid_opt.append(q_id)
                    
            print(f"File: {file}")
            print(f"  Total Questions: {len(data)}")
            print(f"  Missing/Short Explanations: {len(missing_exp)} (IDs: {missing_exp[:15]}...)")
            print(f"  Invalid/Empty Options: {len(invalid_opt)} (IDs: {invalid_opt})")
            
        except Exception as e:
            print(f"Error reading {file}: {e}")

if __name__ == "__main__":
    scan_files()
