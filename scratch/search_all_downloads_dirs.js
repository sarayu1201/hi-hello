const fs = require("fs");
const path = require("path");

function run() {
  const dir = "C:\\Users\\LENOVO\\Downloads";
  console.log(`Listing direct children of ${dir}:`);
  const list = fs.readdirSync(dir);
  for (let item of list) {
    const itemPath = path.join(dir, item);
    try {
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        console.log(`  [DIR]  ${item}`);
      } else {
        if (item.toLowerCase().includes("clerk") || item.toLowerCase().includes("ibps")) {
          console.log(`  [FILE] ${item}`);
        }
      }
    } catch (e) {}
  }
}

run();
