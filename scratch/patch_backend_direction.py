import os

def patch():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js_path = os.path.join(root_dir, "backend", "server.js")
    
    if os.path.exists(server_js_path):
        print("Patching server.js to include direction in getMockEligibleQuestions mapping...")
        with open(server_js_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        target = "question_image: q.question_image || \"\","
        replacement = "question_image: q.question_image || \"\",\n        direction: q.direction || \"\","
        
        # Replace the first occurrence (which is line 1533 in the getMockEligibleQuestions mapper)
        if target in content:
            # We replace only the first occurrence to target the exact block
            new_content = content.replace(target, replacement, 1)
            with open(server_js_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("SUCCESS: server.js patched successfully with direction field!")
        else:
            print("Error: Could not locate target in server.js")
    else:
        print("Error: backend/server.js not found")

if __name__ == "__main__":
    patch()
