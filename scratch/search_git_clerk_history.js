const { execSync } = require("child_process");

function run() {
  console.log("=== Searching Git history for ibps_clerk_prelims modifications ===");
  try {
    const log = execSync("git log --oneline -- QuestionBank/json/ibps_clerk_prelims/", { encoding: "utf8" });
    console.log(log);
  } catch (err) {
    console.error("Error fetching git log:", err.message);
  }
}

run();
