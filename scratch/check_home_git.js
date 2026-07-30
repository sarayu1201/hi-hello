const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100, cwd: "c:\\Users\\LENOVO" });
  } catch (err) {
    return null;
  }
}

console.log("Searching home directory Git repository commits for NTPC/CBT JSON files...");
const logOut = runCmd("git log --oneline --name-only -n 150");
if (logOut) {
  const lines = logOut.split(/\r?\n/);
  const matched = lines.filter(line => {
    const cleanLine = line.trim();
    return cleanLine.endsWith(".json") && /ntpc|cbt/i.test(cleanLine);
  });
  const uniqueMatched = Array.from(new Set(matched));
  console.log(`Found ${uniqueMatched.length} matching files in local commits:`);
  console.log(JSON.stringify(uniqueMatched, null, 2));
} else {
  console.log("Failed to run git log in home directory.");
}
