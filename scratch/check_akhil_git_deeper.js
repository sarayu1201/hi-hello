const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", cwd: "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello" });
  } catch (err) {
    return null;
  }
}

console.log("Checking git stash in akhil-website/hi-hello...");
console.log(runCmd("git stash list"));

console.log("Checking git reflog in akhil-website/hi-hello...");
console.log(runCmd("git reflog -n 50"));
