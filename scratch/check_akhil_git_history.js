const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100, cwd: "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello" });
  } catch (err) {
    return null;
  }
}

console.log("Checking git history in c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello...");
const logOut = runCmd("git log --all --oneline --name-only");
if (logOut) {
  const lines = logOut.split(/\r?\n/);
  const matched = lines.filter(line => {
    const cleanLine = line.trim();
    return cleanLine.endsWith(".json") && /ntpc|cbt/i.test(cleanLine);
  });
  const uniqueMatched = Array.from(new Set(matched));
  console.log(`Found ${uniqueMatched.length} matching JSON file paths in akhil-website/hi-hello Git history:`);
  console.log(JSON.stringify(uniqueMatched, null, 2));
} else {
  console.log("Failed to run git log in akhil-website/hi-hello.");
}
