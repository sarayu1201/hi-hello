const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    return null;
  }
}

console.log("Listing JSON files changed/added in commit eba0f75...");
const stdout = runCmd("git show --name-only --oneline eba0f75");
if (stdout) {
  const lines = stdout.split(/\r?\n/);
  const jsonFiles = lines.filter(line => line.endsWith(".json"));
  console.log(`Found ${jsonFiles.length} JSON files:`);
  console.log(jsonFiles);
} else {
  console.log("Failed to inspect commit eba0f75.");
}
