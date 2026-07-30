const fs = require("fs");
const path = require("path");

const targetRoot = "c:\\Users\\LENOVO\\Downloads\\Inter College\\Inter College";
console.log(`Scanning all subdirectories of ${targetRoot} for JSON files...`);

const jsonFiles = [];

function scan(dirPath) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (e) {
    return;
  }
  
  for (let entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "frontend") {
        scan(full);
      }
    } else {
      if (entry.name.endsWith(".json")) {
        jsonFiles.push(full);
      }
    }
  }
}

scan(targetRoot);

console.log(`Found ${jsonFiles.length} JSON files in total in Inter College.`);
const matching = jsonFiles.filter(p => /ntpc|cbt/i.test(p));
console.log(`Found ${matching.length} matching files:`);
console.log(matching);
