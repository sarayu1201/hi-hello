const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 });
  } catch (err) {
    return null;
  }
}

console.log("Listing files in origin/master branch under 'sbi po questions'...");
const treeOut = runCmd("git ls-tree -r --name-only origin/master");
if (treeOut) {
  const lines = treeOut.split(/\r?\n/);
  const matched = lines.filter(line => line.startsWith("sbi po questions/"));
  console.log(`Total files: ${matched.length}`);
  console.log("Sample of first 50 files:");
  console.log(matched.slice(0, 50));
  
  // Find where files with '.png' or other extensions are
  const images = matched.filter(line => line.endsWith(".png") || line.endsWith(".jpg"));
  console.log(`\nTotal images: ${images.length}`);
  console.log("Sample of first 20 images:");
  console.log(images.slice(0, 20));
  
  // Find if there is any folder matching "ibps" inside sbi po questions
  const folders = new Set();
  matched.forEach(line => {
    const parts = line.split("/");
    if (parts.length > 2) {
      folders.add(parts.slice(0, 2).join("/"));
    }
  });
  console.log("\nSubfolders inside 'sbi po questions':");
  console.log(Array.from(folders));
} else {
  console.log("Failed to list origin/master branch tree.");
}
