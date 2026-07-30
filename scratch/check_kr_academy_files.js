const fs = require("fs");
const path = require("path");

const targetRoot = "c:\\Users\\LENOVO\\Downloads\\akhil-website\\kr-academy";
console.log(`Scanning all subdirectories of ${targetRoot}...`);

const foundFiles = [];

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
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        scan(full);
      }
    } else {
      foundFiles.push(full);
    }
  }
}

scan(targetRoot);

console.log(`Found ${foundFiles.length} files in kr-academy.`);
console.log("Files:", foundFiles.slice(0, 100));
