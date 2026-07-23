import subprocess

repo_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main"

print("=== STAGING ALL WORKING TREE CHANGES ===")
add_res = subprocess.run(["git", "add", "-A"], cwd=repo_dir, capture_output=True, text=True)
print("Add status:", add_res.returncode)

print("\n=== COMMITTING STAGED CHANGES ===")
commit_res = subprocess.run(["git", "commit", "-m", "Update all question banks (IBPS PO, SBI PO, SBI Clerk, IBPS Clerk, RRB CBT1, RRB CBT2, RRB GD, SSC GD) and uploaded images"], cwd=repo_dir, capture_output=True, text=True)
print(commit_res.stdout)
if commit_res.stderr:
    print(commit_res.stderr)

print("\n=== PULLING REMOTE WITH REBASE ===")
pull_res = subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=repo_dir, capture_output=True, text=True)
print(pull_res.stdout)
if pull_res.stderr:
    print("Pull stderr:", pull_res.stderr)

if pull_res.returncode != 0:
    print("\nRebase conflict detected! Using ours/theirs resolution strategy...")
    subprocess.run(["git", "rebase", "--abort"], cwd=repo_dir, capture_output=True, text=True)
    pull_merge = subprocess.run(["git", "pull", "origin", "main", "--no-rebase", "-X", "ours"], cwd=repo_dir, capture_output=True, text=True)
    print(pull_merge.stdout)
    if pull_merge.stderr:
        print("Merge stderr:", pull_merge.stderr)

print("\n=== PUSHING TO ORIGIN MAIN ===")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=repo_dir, capture_output=True, text=True)
print(push_res.stdout)
if push_res.stderr:
    print("Push stderr:", push_res.stderr)

if push_res.returncode == 0:
    print("\n--- GIT PUSH SUCCESSFUL! ---")
else:
    print(f"\n--- GIT PUSH FAILED with code {push_res.returncode} ---")

