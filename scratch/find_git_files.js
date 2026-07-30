const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  } catch (err) {
    console.error("execSync failed with error:", err.message);
    return null;
  }
}

console.log("Searching all historical file paths in Git...");
const logOut = runCmd("git log --all --oneline --name-only");
if (logOut) {
  const lines = logOut.split(/\r?\n/);
  const matched = lines.filter(line => {
    const cleanLine = line.trim();
    // Keep only JSON files containing 'ntpc' or 'cbt'
    return cleanLine.endsWith(".json") && /ntpc|cbt/i.test(cleanLine);
  });
  const uniqueMatched = Array.from(new Set(matched));
  console.log(`Found ${uniqueMatched.length} matching JSON file paths in Git history:`);
  console.log(JSON.stringify(uniqueMatched, null, 2));
} else {
  console.log("Failed to run git log.");
}
