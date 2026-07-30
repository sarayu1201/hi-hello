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
        if (file !== "node_modules" && file !== "venv" && !file.startsWith(".")) {
          walk(filePath, results);
        }
      } else {
        if (file.endsWith(".py")) {
          results.push(filePath);
        }
      }
    }
  } catch (e) {}
  return results;
}

const rootDir = path.join(__dirname, "..");
console.log(`Scanning for all .py files in ${rootDir}...`);
const matches = walk(rootDir);
console.log(`Found ${matches.length} matching files:`);
matches.forEach(m => console.log(`  - ${m}`));
