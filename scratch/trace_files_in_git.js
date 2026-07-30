const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    return null;
  }
}

console.log("Locating the commit that introduced/deleted the RRB NTPC files...");
const logOut = runCmd("git log --all --oneline --name-status -- \"*1782989033977*\"");
if (logOut) {
  console.log("Found history matching the file:");
  console.log(logOut);
} else {
  console.log("No specific history found for the file.");
}

// Let's list the commits that modified any file inside the exam_parser/output_json directory
const dirLog = runCmd("git log --all --oneline --name-status | grep -i '1782989033977' -B 2 -A 5");
if (dirLog) {
  console.log("\nCommit Details:");
  console.log(dirLog);
} else {
  // If grep isn't available, search with JavaScript
  const fullLog = runCmd("git log --all --oneline --name-status");
  if (fullLog) {
    const lines = fullLog.split(/\r?\n/);
    console.log("\nSearching for commit containing 1782989033977 in JS...");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("1782989033977")) {
        console.log("Line matched:", lines[i]);
        // print a few lines before and after
        for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 5); j++) {
          console.log(`[${j}] ${lines[j]}`);
        }
        break;
      }
    }
  }
}
