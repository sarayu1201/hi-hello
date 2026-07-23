import subprocess
import os

repo_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main"

paths_to_stage = [
    "QuestionBank/json/ibps_po_prelims",
    "QuestionBank/json/sbi_po_prelims",
    "QuestionBank/json/sbi_clerk_prelims",
    "QuestionBank/json/ibps_clerk_prelims",
    "QuestionBank/json/rrb_cbt_1",
    "QuestionBank/json/rrb_cbt_2",
    "QuestionBank/json/rrb_gd",
    "QuestionBank/json/sc_gd",
    "backend/uploads/images",
    "QuestionBank/images"
]

print("=== STAGING SPECIFIED DIRECTORIES ===")
for p in paths_to_stage:
    full_p = os.path.join(repo_dir, p)
    if os.path.exists(full_p):
        print(f"Staging: {p}")
        cmd = ["git", "add", "-A", p]
        res = subprocess.run(cmd, cwd=repo_dir, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"  SUCCESS: {p}")
        else:
            print(f"  ERROR: {res.stderr}")

print("\n=== CHECKING STAGED CHANGES ===")
status_res = subprocess.run(["git", "status", "--short"], cwd=repo_dir, capture_output=True, text=True)
lines = [l for l in status_res.stdout.split('\n') if l.strip()]
staged = [l for l in lines if l[0] in ['A', 'M', 'D', 'R']]
print(f"Total staged changes: {len(staged)}")
for s in staged[:20]:
    print(" ", s)

print("\n=== COMMITTING STAGED CHANGES ===")
commit_msg = "Add IBPS PO, SBI PO, SBI Clerk, IBPS Clerk, RRB CBT1, RRB CBT2, RRB GD, and SSC GD JSON papers and images"
commit_res = subprocess.run(["git", "commit", "-m", commit_msg], cwd=repo_dir, capture_output=True, text=True)
print(commit_res.stdout)
if commit_res.stderr:
    print(commit_res.stderr)

print("\n=== PUSHING TO REMORE (origin main) ===")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=repo_dir, capture_output=True, text=True)
print(push_res.stdout)
if push_res.stderr:
    print(push_res.stderr)
if push_res.returncode == 0:
    print("\n--- GIT PUSH SUCCESSFUL ---")
else:
    print(f"\n--- GIT PUSH FAILED (returncode {push_res.returncode}) ---")

