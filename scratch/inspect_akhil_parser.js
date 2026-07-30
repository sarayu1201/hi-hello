const fs = require("fs");
const path = require("path");

const parserDir = "C:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\exam_parser";
if (fs.existsSync(parserDir)) {
  console.log(`Listing files in ${parserDir}:`);
  const files = fs.readdirSync(parserDir);
  files.forEach(f => {
    const p = path.join(parserDir, f);
    const stat = fs.statSync(p);
    console.log(`  - ${f} (${stat.isDirectory() ? "DIR" : "FILE"})`);
  });
} else {
  console.log("akhil-website exam_parser folder does not exist.");
}
