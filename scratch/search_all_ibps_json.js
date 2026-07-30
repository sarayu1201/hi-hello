const fs = require("fs");
const path = require("path");

function walk(dir, results = []) {
  try {
    const list = fs.readdirSync(dir);
    for (let file of list) {
      const filePath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch (e) {
        continue;
      }
      if (stat && stat.isDirectory()) {
        if (file !== "node_modules" && file !== ".git" && !file.startsWith(".")) {
          walk(filePath, results);
        }
      } else {
        if (file.toLowerCase().includes("ibps") && file.endsWith(".json")) {
          results.push(filePath);
        }
      }
    }
  } catch (e) {}
  return results;
}

const downloadsDir = "C:\\Users\\LENOVO\\Downloads";
console.log(`Scanning for JSON files matching 'ibps' in ${downloadsDir}...`);
const matches = walk(downloadsDir);
console.log(`Found ${matches.length} matching files:`);
matches.forEach(m => console.log(`  - ${m}`));
