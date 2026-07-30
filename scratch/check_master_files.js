const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  } catch (err) {
    return null;
  }
}

console.log("Checking last 5 commits on origin/master...");
console.log(runCmd("git log origin/master -n 5 --oneline"));

console.log("\nSearching for ibps_po or ibpspo JSON files in origin/master branch tree...");
const treeOut = runCmd("git ls-tree -r --name-only origin/master");
if (treeOut) {
  const lines = treeOut.split(/\r?\n/);
  const matched = lines.filter(line => line.endsWith(".json") && /ibps_po|ibpspo/i.test(line));
  console.log(`Found ${matched.length} matching files on origin/master:`);
  console.log(JSON.stringify(matched, null, 2));
} else {
  console.log("Failed to list origin/master branch tree.");
}
