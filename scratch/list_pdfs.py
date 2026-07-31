import os

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main"

print("--- Searching for PDF files (.pdf) under workspace ---")
pdf_files = []
for root, dirs, files in os.walk(workspace_dir):
    if ".git" in root or "node_modules" in root or ".gemini" in root:
        continue
    for file in files:
        if file.lower().endswith(".pdf"):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, workspace_dir)
            pdf_files.append((rel_path, os.path.getsize(full_path)))

print(f"Found {len(pdf_files)} PDF files.")
for rel_path, size in sorted(pdf_files):
    print(f"  - {rel_path} ({size} bytes)")
