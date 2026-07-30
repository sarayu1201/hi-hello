const fs = require("fs");
const path = require("path");

const rootSearchDir = "c:\\Users\\LENOVO\\Downloads";

console.log(`Scanning subdirectories of ${rootSearchDir} for folders/files related to 'ntpc' or 'cbt'...`);

function scanDir(dirPath, depth = 0) {
  if (depth > 4) return; // limit depth to prevent endless loops or slow scans
  
  let files;
  try {
    files = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    return;
  }
  
  for (let file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    // Check if the directory name matches ntpc or cbt
    if (file.isDirectory()) {
      if (/ntpc|cbt|cbt-1|cbt-2|cbt1|cbt2/i.test(file.name)) {
        console.log(`[MATCHING DIRECTORY]: ${fullPath}`);
        // List contents of this directory
        try {
          const subFiles = fs.readdirSync(fullPath);
          console.log(`  Contents (${subFiles.length} files):`, subFiles.slice(0, 10));
        } catch (e) {}
      }
      // Recurse into directories (skipping node_modules, .git, hi-hello-main itself to avoid duplicate search)
      if (file.name !== "node_modules" && file.name !== ".git" && file.name !== "hi-hello-main") {
        scanDir(fullPath, depth + 1);
      }
    } else {
      // Check if file name matches and ends with .json
      if (file.name.endsWith(".json") && /ntpc|cbt/i.test(file.name)) {
        // Only print if not inside hi-hello-main (we already know those)
        if (!fullPath.includes("hi-hello-main")) {
          console.log(`[MATCHING JSON FILE]: ${fullPath}`);
        }
      }
    }
  }
}

scanDir(rootSearchDir);
console.log("Scan complete.");
