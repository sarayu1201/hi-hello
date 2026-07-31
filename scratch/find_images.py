import os

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main"

print("--- Searching for image files (.png / .jpg) under workspace ---")
image_files = []
for root, dirs, files in os.walk(workspace_dir):
    # Skip standard folders
    if ".git" in root or "node_modules" in root or ".gemini" in root:
        continue
    for file in files:
        if file.lower().endswith((".png", ".jpg", ".jpeg")):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, workspace_dir)
            image_files.append((rel_path, os.path.getsize(full_path)))

print(f"Found {len(image_files)} image files.")
for rel_path, size in sorted(image_files)[:50]:
    print(f"  - {rel_path} ({size} bytes)")
