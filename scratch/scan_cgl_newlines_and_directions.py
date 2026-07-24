import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    total_newlines_questions = 0
    total_newlines_options = 0
    total_with_directions = 0
    
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_id = q.get("id")
            question = q.get("question", "") or ""
            direction = q.get("direction", "") or ""
            options = q.get("options", [])
            
            if "\n" in question:
                total_newlines_questions += 1
                # If there are many newlines, print it
                if question.count("\n") > 1:
                    print(f"[{filename} Q{q_id}] Question has newlines:")
                    print(repr(question))
                    print("-" * 50)
            
            for idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else str(opt)
                if "\n" in opt_text:
                    total_newlines_options += 1
                    print(f"[{filename} Q{q_id}] Option {chr(65+idx)} has newlines: {repr(opt_text)}")
                    print("-" * 50)
                    
            if direction:
                total_with_directions += 1
                
    print(f"Summary:")
    print(f"Total questions with newlines: {total_newlines_questions}")
    print(f"Total options with newlines: {total_newlines_options}")
    print(f"Total questions with directions: {total_with_directions}")

if __name__ == "__main__":
    check()
