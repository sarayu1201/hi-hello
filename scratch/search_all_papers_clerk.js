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
        if (file.toLowerCase().includes("clerk") && file.endsWith(".json")) {
          results.push(filePath);
        }
      }
    }
  } catch (e) {}
  return results;
}

const folders = [
  "C:\\Users\\LENOVO\\Downloads\\all papers",
  "C:\\Users\\LENOVO\\Downloads\\kr question paper",
  "C:\\Users\\LENOVO\\Downloads\\kr pdf's",
  "C:\\Users\\LENOVO\\Downloads\\kr pdf's (1)"
];

folders.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Scanning: ${dir}`);
    const matches = walk(dir);
    console.log(`Found ${matches.length} files:`);
    matches.forEach(m => console.log(`  - ${m}`));
  } else {
    console.log(`Not exists: ${dir}`);
  }
});
