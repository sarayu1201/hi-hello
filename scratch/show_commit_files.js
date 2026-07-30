const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    return null;
  }
}

console.log("Listing files changed/added in commit eba0f75...");
const filesList = runCmd("git show --name-status --oneline eba0f75");
if (filesList) {
  console.log(filesList.substring(0, 5000)); // Print first 5000 chars of files list
  if (filesList.length > 5000) {
    console.log("... and more files.");
  }
} else {
  console.log("Failed to inspect commit eba0f75.");
}
