const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  } catch (err) {
    return null;
  }
}

console.log("Checking if QuestionBank/json/ ever contained NTPC/CBT files...");
const logOut = runCmd("git log --all --oneline --name-only");
if (logOut) {
  const lines = logOut.split(/\r?\n/);
  const matched = lines.filter(line => {
    const cleanLine = line.trim();
    return cleanLine.includes("QuestionBank/json") && /ntpc|cbt/i.test(cleanLine);
  });
  const uniqueMatched = Array.from(new Set(matched));
  console.log(`Found ${uniqueMatched.length} matching file paths in history under QuestionBank/json:`);
  console.log(JSON.stringify(uniqueMatched, null, 2));
} else {
  console.log("Failed to run git log.");
}
