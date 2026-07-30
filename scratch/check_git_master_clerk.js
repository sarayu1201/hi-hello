const { execSync } = require("child_process");

function run() {
  console.log("=== Checking files in origin/master branch for ibps_clerk_prelims ===");
  try {
    const files = execSync("git ls-tree -r origin/master --name-only | grep ibps_clerk", { encoding: "utf8" });
    console.log("Found in origin/master:\n", files);
  } catch (err) {
    console.log("No ibps_clerk files in origin/master branch:", err.message);
  }

  console.log("=== Checking git commits on origin/master ===");
  try {
    console.log(execSync("git log origin/master --oneline -n 10", { encoding: "utf8" }));
  } catch (err) {
    console.error(err.message);
  }
}

run();
