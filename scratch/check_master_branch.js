const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  } catch (err) {
    console.error("Failed:", cmd, err.message);
    return null;
  }
}

console.log("Listing files in origin/master branch...");
// Fetch origin to ensure we have the latest remote branches tracked
runCmd("git fetch origin");

const treeOut = runCmd("git ls-tree -r --name-only origin/master");
if (treeOut) {
  const lines = treeOut.split(/\r?\n/);
  console.log(`Total files in origin/master: ${lines.length}`);
  
  // Filter for JSON paths containing 'ntpc' or 'cbt'
  const matched = lines.filter(line => line.endsWith(".json") && /ntpc|cbt/i.test(line));
  console.log(`Found ${matched.length} matched JSON files on origin/master:`);
  console.log(matched);
} else {
  console.log("Could not read origin/master tree.");
}
