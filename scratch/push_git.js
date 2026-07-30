const { execSync } = require("child_process");
const path = require("path");

const repoDir = path.join(__dirname, "..");

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    const stdout = execSync(cmd, { cwd: repoDir, encoding: "utf8" });
    console.log(stdout);
    return true;
  } catch (err) {
    console.error(`Error executing command: ${cmd}`);
    console.error(err.stdout || "");
    console.error(err.stderr || "");
    return false;
  }
}

function run() {
  console.log("=== Git Push Process Starting ===");

  const files = [
    "frontend/src/pages/MockTests.jsx",
    "QuestionBank/json/ibps_po_prelims/",
    "QuestionBank/json/rrb_po/",
    "QuestionBank/images/",
    "backend/uploads/images/",
    "backend/server.js"
  ];

  for (let file of files) {
    runCmd(`git add "${file}"`);
  }

  // 2. Commit the changes
  const commitMsg = "Fix IBPS Clerk mock resolver course mapping in server.js and seed questions";
  const commitSuccess = runCmd(`git commit -m "${commitMsg}"`);

  if (!commitSuccess) {
    console.log("Commit did not succeed (might have no changes to commit). Trying to pull and push anyway...");
  }

  // 3. Pull from origin main with rebase to avoid merge conflicts
  console.log("Pulling latest changes from remote...");
  const pullSuccess = runCmd("git pull --rebase origin main");

  if (!pullSuccess) {
    console.error("Rebase failed, aborting rebase...");
    runCmd("git rebase --abort");
    console.log("Attempting pull merge strategy (ours)...");
    runCmd("git pull origin main --no-rebase -X ours");
  }

  // 4. Push to remote origin main
  console.log("Pushing changes to remote repository...");
  const pushSuccess = runCmd("git push origin main");

  if (pushSuccess) {
    console.log("=== Git Push Process Completed Successfully ===");
  } else {
    console.error("=== Git Push Process Failed ===");
  }
}

run();
