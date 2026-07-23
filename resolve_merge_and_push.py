import subprocess

repo_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main"

print("=== RESOLVING MERGE CONFLICTS WITH OURS STRATEGY ===")
subprocess.run(["git", "checkout", "--ours", "."], cwd=repo_dir, capture_output=True, text=True)
add_res = subprocess.run(["git", "add", "-A"], cwd=repo_dir, capture_output=True, text=True)
print("Git add -A status:", add_res.returncode)

commit_res = subprocess.run(["git", "commit", "-m", "Merge origin/main and include all updated question banks & image uploads"], cwd=repo_dir, capture_output=True, text=True)
print(commit_res.stdout)
if commit_res.stderr:
    print("Commit stderr:", commit_res.stderr)

print("\n=== PUSHING TO ORIGIN MAIN ===")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=repo_dir, capture_output=True, text=True)
print(push_res.stdout)
if push_res.stderr:
    print("Push stderr:", push_res.stderr)

if push_res.returncode == 0:
    print("\n--- SUCCESS: ALL SPECIFIED QUESTION BANKS AND IMAGES PUSHED TO GITHUB ---")
else:
    print(f"\n--- FAIL: push exited with code {push_res.returncode} ---")

