const fs = require("fs");
const path = require("path");

function walk(dir, results = []) {
  try {
    const list = fs.readdirSync(dir);
    for (let file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        if (file !== "node_modules" && file !== "venv" && !file.startsWith(".")) {
          walk(filePath, results);
        }
      } else {
        results.push(filePath);
      }
    }
  } catch (e) {}
  return results;
}

const parserDir = path.join(__dirname, "..", "exam_parser");
if (fs.existsSync(parserDir)) {
  console.log(`Listing files in ${parserDir}:`);
  const files = walk(parserDir);
  files.forEach(f => console.log(`  - ${f}`));
} else {
  console.log("exam_parser folder does not exist.");
}
