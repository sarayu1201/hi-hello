const { execSync } = require("child_process");
const path = require("path");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", cwd: path.join(__dirname, "..") });
  } catch (err) {
    return null;
  }
}

console.log("Recent Git commits:");
console.log(runCmd("git log -n 10 --oneline"));
