const { execSync } = require("child_process");
const path = require("path");

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    return execSync(cmd, { encoding: "utf8", cwd: path.join(__dirname, "..") });
  } catch (err) {
    console.error("Failed:", err.message);
    return null;
  }
}

console.log("=== Git Merge Conflict Resolver Starting ===");

// 1. Find all conflicting files
const statusOut = runCmd("git status --porcelain");
if (!statusOut) {
  console.log("Git status returned empty.");
  process.exit(0);
}

const lines = statusOut.split("\n");
let conflictsCount = 0;

for (let line of lines) {
  if (line.startsWith("UD") || line.startsWith("DU") || line.startsWith("UU") || line.startsWith("AA")) {
    const filePath = line.substring(3).trim();
    console.log(`Conflict found in: ${filePath}`);
    
    // Resolve conflict by deleting the file (since we are removing rrb_po entirely)
    if (filePath.includes("rrb_po/")) {
      runCmd(`git rm -f "${filePath}"`);
      conflictsCount++;
    } else {
      // For any other file, check if it needs ours or theirs
      // Default to "ours" to keep our changes
      runCmd(`git checkout --ours -- "${filePath}"`);
      runCmd(`git add "${filePath}"`);
      conflictsCount++;
    }
  }
}

console.log(`\nResolved ${conflictsCount} conflicts.`);

// 2. Commit the merge resolution
if (conflictsCount > 0) {
  const commitSuccess = runCmd('git commit -m "Resolve merge conflicts by deleting IBPS RRB PO files"');
  if (commitSuccess) {
    console.log("Commit successful!");
    // 3. Push changes
    const pushSuccess = runCmd("git push origin main");
    if (pushSuccess) {
      console.log("=== Git Merge Resolution Pushed to GitHub Successfully ===");
    } else {
      console.log("Git push failed.");
    }
  } else {
    console.log("Git commit failed.");
  }
} else {
  console.log("No conflicts found to resolve.");
}
