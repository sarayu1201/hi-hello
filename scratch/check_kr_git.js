const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", cwd: "c:\\Users\\LENOVO\\Downloads\\akhil-website\\kr-academy" });
  } catch (err) {
    return null;
  }
}

console.log("Checking if kr-academy is a Git repository...");
const status = runCmd("git status");
if (status) {
  console.log("Git repository detected!");
  console.log("Status:", status);
  console.log("\nBranches:");
  console.log(runCmd("git branch -a"));
  console.log("\nStashes:");
  console.log(runCmd("git stash list"));
  console.log("\nRecent commits:");
  console.log(runCmd("git log -n 10 --oneline"));
} else {
  console.log("Not a git repository.");
}
