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
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const root = path.join(__dirname, "..");
console.log(`Scanning all files in workspace root: ${root}...\n`);
const allFiles = walk(root);
console.log(`Total files found: ${allFiles.length}`);

// Filter files that contain "po" or "ibps" or "prelims" in their name (case-insensitive)
const poFiles = allFiles.filter(f => {
  const base = path.basename(f).toLowerCase();
  return base.includes("po") || base.includes("ibps") || base.includes("prelims");
});

console.log(`Found ${poFiles.length} files matching PO/IBPS/Prelims:`);
poFiles.forEach(f => {
  console.log(`  - ${path.relative(root, f)}`);
});
