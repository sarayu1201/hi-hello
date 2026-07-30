const fs = require("fs");
const path = require("path");

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "empty_options_render") {
        walk(filePath, results);
      }
    } else {
      if (file.toLowerCase().includes("clerk") && file.endsWith(".json")) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const outerDir = path.join(__dirname, "..", "..");
console.log(`Scanning outer directory: ${outerDir}`);
const matches = walk(outerDir);
console.log(`Found ${matches.length} matching files:`);
matches.forEach(m => console.log(`  - ${m}`));
