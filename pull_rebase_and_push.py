import subprocess

repo_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main"

print("=== PULLING REMOTE CHANGES WITH REBASE ===")
pull_res = subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=repo_dir, capture_output=True, text=True)
print(pull_res.stdout)
if pull_res.stderr:
    print("Stderr:", pull_res.stderr)

if pull_res.returncode != 0:
    print("Rebase failed/conflict. Trying git pull --no-rebase...")
    subprocess.run(["git", "rebase", "--abort"], cwd=repo_dir, capture_output=True, text=True)
    pull_res2 = subprocess.run(["git", "pull", "--no-rebase", "origin", "main", "-X", "ours"], cwd=repo_dir, capture_output=True, text=True)
    print(pull_res2.stdout)
    if pull_res2.stderr:
        print("Stderr:", pull_res2.stderr)

print("\n=== PUSHING TO ORIGIN MAIN ===")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=repo_dir, capture_output=True, text=True)
print(push_res.stdout)
if push_res.stderr:
    print(push_res.stderr)

if push_res.returncode == 0:
    print("\n--- GIT PUSH SUCCESSFUL! ---")
else:
    print(f"\n--- GIT PUSH FAILED with code {push_res.returncode} ---")

