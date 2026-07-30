const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    console.error("Failed:", err.message);
    return null;
  }
}

// Checkout the directory
runCmd('git checkout origin/master -- "sbi po questions/"');

// Verify if the folder exists now
const targetDir = path.join(__dirname, "..", "sbi po questions");
if (fs.existsSync(targetDir)) {
  console.log("Successfully checked out 'sbi po questions' from origin/master!");
  console.log("Contents:");
  console.log(fs.readdirSync(targetDir));
} else {
  console.error("Folder 'sbi po questions' does not exist after checkout!");
}
