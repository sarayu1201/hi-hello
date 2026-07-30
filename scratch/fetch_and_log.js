const { execSync } = require("child_process");

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    console.error("Failed:", err.message);
    return null;
  }
}

console.log("Fetching from origin...");
runCmd("git fetch origin");

console.log("\nChecking last 5 commits on origin/main:");
const logOut = runCmd("git log origin/main -n 5 --oneline");
console.log(logOut);

console.log("\nChecking local branches and status:");
console.log(runCmd("git status"));
