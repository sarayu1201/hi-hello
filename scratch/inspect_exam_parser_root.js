const fs = require("fs");
const path = require("path");

const parserDir = path.join(__dirname, "..", "exam_parser");
if (fs.existsSync(parserDir)) {
  console.log("Files in exam_parser:");
  const files = fs.readdirSync(parserDir);
  files.forEach(f => {
    const p = path.join(parserDir, f);
    const stat = fs.statSync(p);
    console.log(`  - ${f} (${stat.isDirectory() ? "DIR" : "FILE"})`);
  });
} else {
  console.log("exam_parser folder does not exist.");
}
