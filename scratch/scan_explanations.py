import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    clerk_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    files = [f"sbi_clerk_test_{i}.json" for i in range(1, 11)]
    
    print("=== EXPLANATIONS SCAN FOR SBI CLERK 10 MOCKS ===")
    
    total_questions = 0
    missing_explanation = 0
    short_explanation = 0
    
    for filename in files:
        path = os.path.join(clerk_dir, filename)
        if not os.path.exists(path):
            print(f"File not found: {filename}")
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        file_q_count = len(data)
        file_missing = 0
        file_short = 0
        
        for q in data:
            expl = q.get("explanation", "").strip()
            if not expl:
                file_missing += 1
            elif len(expl) < 40:  # very short, like just 'Sol.' or 'Ans.(a)'
                file_short += 1
                
        total_questions += file_q_count
        missing_explanation += file_missing
        short_explanation += file_short
        
        print(f"{filename}: Total={file_q_count}, Missing={file_missing}, Short (<40 chars)={file_short}")
        
    print(f"\nSummary: Total={total_questions}, Missing={missing_explanation}, Short={short_explanation}")

if __name__ == "__main__":
    check()
