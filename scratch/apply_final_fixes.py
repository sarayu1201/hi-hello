import os
import shutil

def apply():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. Delete sbi_clerk_prelims duplicate folder
    duplicate_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi_clerk_prelims")
    if os.path.exists(duplicate_dir):
        print(f"Deleting duplicate folder: {duplicate_dir}")
        shutil.rmtree(duplicate_dir)
        print("Duplicate folder successfully deleted!")
    else:
        print("Duplicate folder sbi_clerk_prelims does not exist on disk.")
        
    # 2. Patch backend/server.js for 50mb body limit
    server_js_path = os.path.join(root_dir, "backend", "server.js")
    if os.path.exists(server_js_path):
        print("\nPatching backend/server.js body limit...")
        with open(server_js_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Target: app.use(express.json());
        target = "app.use(express.json());"
        replacement = "app.use(express.json({ limit: '50mb' }));\napp.use(express.urlencoded({ limit: '50mb', extended: true }));"
        
        if target in content:
            new_content = content.replace(target, replacement, 1)
            with open(server_js_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("SUCCESS: server.js updated with 50mb JSON limits!")
        else:
            print("Warning: Could not locate 'app.use(express.json());' in server.js")
    else:
        print("backend/server.js not found!")

if __name__ == "__main__":
    apply()
