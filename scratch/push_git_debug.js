const { execSync } = require("child_process");
const path = require("path");

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    const stdout = execSync(cmd, { encoding: "utf8", cwd: path.join(__dirname, "..") });
    console.log(stdout);
    return true;
  } catch (err) {
    console.error(`Error executing command: ${cmd}\n`, err.stdout || err.message);
    return false;
  }
}

console.log("=== Git Push Process Starting ===");

// 1. Stage modified files
runCmd('git add "backend/server.js"');

// 2. Commit the changes
const commitMsg = "Add database debugging endpoint to server.js";
const commitSuccess = runCmd(`git commit -m "${commitMsg}"`);

if (!commitSuccess) {
  console.log("Nothing to commit or commit failed.");
}

// 3. Pull latest changes with merge strategy
console.log("Pulling latest changes from remote...");
const pullSuccess = runCmd("git pull origin main --no-rebase -X ours");

if (!pullSuccess) {
  console.log("Pull failed.");
}

// 4. Push to remote main
console.log("Pushing changes to remote repository...");
const pushSuccess = runCmd("git push origin main");

if (pushSuccess) {
  console.log("\n=== Git Push Process Completed Successfully ===");
} else {
  console.error("\n=== Git Push Process Failed ===");
}
