const { execSync } = require("child_process");
const fs = require("fs");
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

const rrbPoDir = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po");

if (fs.existsSync(rrbPoDir)) {
  console.log("Removing rrb_po folder...");
  fs.rmSync(rrbPoDir, { recursive: true, force: true });
}

runCmd('git rm -rf "QuestionBank/json/rrb_po"');
runCmd('git commit -m "Permanently delete old RRB PO JSON files"');
const pushSuccess = runCmd("git push origin main");

if (pushSuccess) {
  console.log("=== Pushed Clean Repository to GitHub successfully! ===");
}
