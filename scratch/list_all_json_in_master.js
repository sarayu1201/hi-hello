const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  } catch (err) {
    return null;
  }
}

console.log("Listing all JSON files in origin/master...");
const treeOut = runCmd("git ls-tree -r --name-only origin/master");
if (treeOut) {
  const lines = treeOut.split(/\r?\n/);
  const jsonFiles = lines.filter(line => line.endsWith(".json"));
  console.log(`Found ${jsonFiles.length} JSON files on origin/master.`);
  console.log("JSON files:");
  console.log(JSON.stringify(jsonFiles, null, 2));
} else {
  console.log("Failed to read origin/master branch tree.");
}
