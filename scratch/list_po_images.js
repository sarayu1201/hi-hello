const fs = require("fs");
const path = require("path");

const paths = [
  path.join(__dirname, "..", "QuestionBank", "images"),
  path.join(__dirname, "..", "backend", "uploads", "images")
];

console.log("Searching for PO test image directories...\n");

paths.forEach(basePath => {
  if (!fs.existsSync(basePath)) return;
  
  const files = fs.readdirSync(basePath);
  files.forEach(f => {
    const fullPath = path.join(basePath, f);
    if (fs.statSync(fullPath).isDirectory() && f.toLowerCase().includes("ibps")) {
      console.log(`Found directory: ${f} (under ${path.basename(basePath)})`);
      const subFiles = fs.readdirSync(fullPath);
      console.log(`  Contains ${subFiles.length} files. Samples:`, subFiles.slice(0, 10));
    }
  });
});
