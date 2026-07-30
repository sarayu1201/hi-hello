const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    console.error("Error running command:", err.message);
    return null;
  }
}

console.log("Listing files in commit eba0f75...");
const filesList = runCmd("git diff-tree -r --no-commit-id --name-only eba0f75");
if (filesList) {
  const lines = filesList.split(/\r?\n/).filter(line => line.trim() !== "");
  console.log(`Total files: ${lines.length}`);
  
  // Folders:
  const folders = new Set();
  lines.forEach(line => {
    const parts = line.split("/");
    if (parts.length > 1) {
      folders.add(parts.slice(0, -1).join("/"));
    }
  });
  console.log("\nFolders inside this commit:");
  console.log(Array.from(folders));

  // JSON files:
  const jsonFiles = lines.filter(l => l.endsWith(".json"));
  console.log("\nJSON files inside this commit:");
  console.log(jsonFiles);

  // PNG files:
  const pngFiles = lines.filter(l => l.endsWith(".png"));
  console.log(`\nTotal PNG files: ${pngFiles.length}`);
  console.log("First 20 PNG files:");
  console.log(pngFiles.slice(0, 20));
} else {
  console.log("Failed to inspect commit.");
}
