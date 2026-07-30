const { execSync } = require("child_process");

function run() {
  console.log("=== Git Status ===");
  try {
    console.log(execSync("git status", { encoding: "utf8" }));
  } catch (e) {
    console.error(e.message);
  }

  console.log("=== Local & Remote Branches ===");
  try {
    console.log(execSync("git branch -a", { encoding: "utf8" }));
  } catch (e) {
    console.error(e.message);
  }

  console.log("=== Git Log (Last 10 commits) ===");
  try {
    console.log(execSync("git log --oneline -n 10", { encoding: "utf8" }));
  } catch (e) {
    console.error(e.message);
  }
}

run();
