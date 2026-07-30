const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");

function runCmd(cmd) {
  console.log(`Running: ${cmd} (in ${rootDir})`);
  try {
    return execSync(cmd, { encoding: "utf8", cwd: rootDir });
  } catch (err) {
    console.error("Failed:", err.message);
    return null;
  }
}

// Checkout using the direct commit hash eba0f75
runCmd('git checkout eba0f75 -- "sbi po questions"');

// Verify if the folder exists now
const targetDir = path.join(rootDir, "sbi po questions");
if (fs.existsSync(targetDir)) {
  console.log("Successfully checked out 'sbi po questions' from eba0f75!");
  console.log("Contents:");
  console.log(fs.readdirSync(targetDir));
} else {
  console.error("Folder 'sbi po questions' does not exist after checkout!");
}
