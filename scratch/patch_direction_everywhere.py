import os

def patch():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    mock_tests_path = os.path.join(root_dir, "frontend", "src", "pages", "MockTests.jsx")
    courses_path = os.path.join(root_dir, "frontend", "src", "pages", "Courses.jsx")
    
    # 1. Patch MockTests.jsx (Replace all occurrences)
    if os.path.exists(mock_tests_path):
        print("Patching all occurrences of question_image in MockTests.jsx...")
        with open(mock_tests_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        target = 'question_image: q.question_image || "",'
        replacement = 'direction: q.direction || "",\n    question_image: q.question_image || "",'
        
        if target in content:
            new_content = content.replace(target, replacement)
            with open(mock_tests_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("SUCCESS: MockTests.jsx fully patched!")
        else:
            print("Warning: Could not find target in MockTests.jsx")
            
    # 2. Patch Courses.jsx (Replace all occurrences)
    if os.path.exists(courses_path):
        print("\nPatching all occurrences of question_image in Courses.jsx...")
        with open(courses_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        target = 'question_image: q.question_image || "",'
        replacement = 'direction: q.direction || "",\n    question_image: q.question_image || "",'
        
        if target in content:
            new_content = content.replace(target, replacement)
            with open(courses_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("SUCCESS: Courses.jsx fully patched!")
        else:
            print("Warning: Could not find target in Courses.jsx")

if __name__ == "__main__":
    patch()
