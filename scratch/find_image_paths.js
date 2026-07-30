const fs = require("fs");
const path = require("path");

const targets = ["rrb_ntpc_cbt1_test1_q78.png", "rrb_ntpc_cbt1_test2_q71.png"];
const roots = [
  "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main",
  "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello"
];

const results = [];

function search(dirPath) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (e) {
    return;
  }
  
  for (let entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        search(full);
      }
    } else {
      if (targets.includes(entry.name)) {
        results.push(full);
      }
    }
  }
}

console.log("Searching for the image files on disk...");
for (let root of roots) {
  search(root);
}

console.log(`Found ${results.length} files:`);
console.log(results);
