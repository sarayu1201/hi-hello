const fs = require("fs");
const path = require("path");

const srcDirs = [
  "c:\\Users\\LENOVO\\QuestionBank\\json\\rrb_ntpc_cbt_1",
  "c:\\Users\\LENOVO\\QuestionBank\\json\\rrb_ntpc_cbt_2"
];

const destParent = path.join(__dirname, "..", "QuestionBank", "json");

console.log("Copying local RRB NTPC JSON folders into workspace...");

for (let src of srcDirs) {
  if (fs.existsSync(src)) {
    const folderName = path.basename(src); // e.g. "rrb_ntpc_cbt_1"
    const dest = path.join(destParent, folderName);
    
    // Create destination folder if not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    console.log(`Copying ${files.length} files from ${src} to ${dest}...`);
    
    for (let file of files) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      fs.copyFileSync(srcFile, destFile);
    }
    console.log(`  Successfully copied ${folderName}.`);
  } else {
    console.log(`Source directory not found: ${src}`);
  }
}

console.log("Copy operation complete!");
