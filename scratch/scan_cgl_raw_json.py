import os
import json
import re

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        print(f"\n=== INSPECTING {filename} QUESTIONS ===")
        # Look for questions that have prepended directions or interesting characters
        printed = 0
        for q in data:
            q_id = q.get("id")
            question = q.get("question", "") or ""
            
            # Check for literal \n or \\n or /n
            has_raw_slash_n = "/n" in question or "\\n" in question
            
            # Check for prepended directions
            has_directions = question.startswith("Directions") or "Choose the alternative which best expresses" in question or "Improve the underlined part" in question or "Choose the correct alternative" in question
            
            # Check for double spaces or clumsy formatting in options
            options_clumsy = False
            options = q.get("options", [])
            for opt in options:
                opt_text = opt.get("text", "") if isinstance(opt, dict) else str(opt)
                if "  " in opt_text or "\\n" in opt_text or "/n" in opt_text:
                    options_clumsy = True
                    
            if has_raw_slash_n or has_directions or options_clumsy:
                print(f"Q{q_id}:")
                print(f"  Question: {repr(question)}")
                print(f"  Options:  {[opt.get('text', '') if isinstance(opt, dict) else str(opt) for opt in options]}")
                print("-" * 50)
                printed += 1
                if printed >= 5:
                    break

if __name__ == "__main__":
    check()
