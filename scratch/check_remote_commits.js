const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  } catch (err) {
    console.error("Failed:", cmd, err.message);
    return null;
  }
}

console.log("Checking recent commits on origin/main...");
const logOut = runCmd("git log origin/main -n 10 --oneline --name-status");
if (logOut) {
  console.log(logOut);
} else {
  console.log("Failed to get git log.");
}
