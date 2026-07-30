const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const foldersToDelete = [
  path.join(rootDir, "QuestionBank", "json", "ibps_po_prelims"),
  path.join(rootDir, "QuestionBank", "json", "rrb_po")
];

function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
    console.log(`Deleted folder: ${directoryPath}`);
  }
}

console.log("Deleting old folders on disk...");
for (let folder of foldersToDelete) {
  deleteFolderRecursive(folder);
}

// Untrack deleted files in git
console.log("\nUntracking deleted folders in git...");
try {
  execSync('git rm -r --cached "QuestionBank/json/ibps_po_prelims" "QuestionBank/json/rrb_po"', { cwd: rootDir, stdio: "inherit" });
  console.log("Git untracked successfully!");
} catch (e) {
  console.log("Git untrack skipped or failed (might already be untracked or empty).");
}
