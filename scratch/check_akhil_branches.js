const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", cwd: "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello" });
  } catch (err) {
    return null;
  }
}

console.log("Checking branches in akhil-website/hi-hello...");
const branchOut = runCmd("git branch -a");
console.log(branchOut);
const statusOut = runCmd("git status");
console.log("Status:", statusOut);
