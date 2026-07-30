const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules") {
        results = results.concat(walk(fullPath));
      }
    } else if (file.toLowerCase().endsWith(".pdf")) {
      results.push(fullPath);
    }
  });
  return results;
}

console.log("Searching for PDF files in workspace...");
const pdfs = walk(path.join(__dirname, ".."));
console.log(`Found ${pdfs.length} PDFs:`);
pdfs.forEach(p => console.log(`  - ${path.relative(path.join(__dirname, ".."), p)}`));
