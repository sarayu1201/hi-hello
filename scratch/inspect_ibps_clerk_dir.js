const fs = require("fs");
const path = require("path");

function walk(dir, results = []) {
  try {
    const list = fs.readdirSync(dir);
    for (let file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        walk(filePath, results);
      } else {
        results.push(filePath);
      }
    }
  } catch (e) {}
  return results;
}

const targetDir = "C:\\Users\\LENOVO\\Downloads\\ibps clerk";
console.log(`Scanning target directory: ${targetDir}`);
const matches = walk(targetDir);
console.log(`Found ${matches.length} files:`);
matches.forEach(m => console.log(`  - ${m}`));
