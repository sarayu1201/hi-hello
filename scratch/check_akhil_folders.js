const fs = require("fs");
const path = require("path");

const targetPath = "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\json";
console.log(`Checking directories inside ${targetPath}...`);

try {
  const dirs = fs.readdirSync(targetPath);
  console.log("Directories:", dirs);
  for (let dir of dirs) {
    const full = path.join(targetPath, dir);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(full);
      console.log(`- ${dir}: ${files.length} files`);
      if (/ntpc|cbt/i.test(dir)) {
        console.log(`  Files:`, files.slice(0, 10));
      }
    }
  }
} catch (err) {
  console.error("Error reading path:", err.message);
}
