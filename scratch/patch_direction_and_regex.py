import os

def patch():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    mock_tests_path = os.path.join(root_dir, "frontend", "src", "pages", "MockTests.jsx")
    courses_path = os.path.join(root_dir, "frontend", "src", "pages", "Courses.jsx")
    server_js_path = os.path.join(root_dir, "backend", "server.js")
    
    # 1. Patch MockTests.jsx
    if os.path.exists(mock_tests_path):
        print("Patching MockTests.jsx direction field...")
        with open(mock_tests_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        target = "question_image: q.question_image || \"\","
        replacement = "direction: q.direction || \"\",\n        question_image: q.question_image || \"\","
        
        if target in content:
            new_content = content.replace(target, replacement, 1)
            with open(mock_tests_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("SUCCESS: MockTests.jsx direction patched!")
        else:
            print("Warning: Could not find target in MockTests.jsx")
            
    # 2. Patch Courses.jsx
    if os.path.exists(courses_path):
        print("\nPatching Courses.jsx direction field...")
        with open(courses_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        target = "question_image: q.question_image || \"\","
        replacement = "direction: q.direction || \"\",\n        question_image: q.question_image || \"\","
        
        if target in content:
            new_content = content.replace(target, replacement, 1)
            with open(courses_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("SUCCESS: Courses.jsx direction patched!")
        else:
            print("Warning: Could not find target in Courses.jsx")
            
    # 3. Patch backend/server.js regex
    if os.path.exists(server_js_path):
        print("\nPatching backend/server.js sub_type regex...")
        with open(server_js_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        target = "let numberMatch = queryStr.match(/\\b(?:mock|test|paper|cbt)?\\s*_?(\\d+)\\b/i) || queryStr.match(/_(\\d+)$/);"
        replacement = "let numberMatch = queryStr.match(/(?:mock|test|paper|cbt)?\\s*_?(\\d+)\\b/i);"
        
        if target in content:
            new_content = content.replace(target, replacement, 1)
            with open(server_js_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("SUCCESS: server.js regex patched!")
        else:
            # Let's search with alternate spacing or quotes if target isn't matched exactly
            print("Target regex not matched exactly, attempting fallback match...")
            # We can find resolveDbSubType block and replace
            start_str = "let numberMatch = queryStr.match("
            idx = content.find(start_str)
            if idx != -1:
                end_line_idx = content.find("\n", idx)
                old_line = content[idx:end_line_idx]
                print(f"Found line: {repr(old_line)}")
                new_content = content.replace(old_line, replacement, 1)
                with open(server_js_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print("SUCCESS: server.js regex patched via fallback search!")
            else:
                print("Error: Could not locate numberMatch in server.js")

if __name__ == "__main__":
    patch()
