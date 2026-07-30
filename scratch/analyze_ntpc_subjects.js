const fs = require("fs");
const path = require("path");

function analyzeFolder(folderName) {
  const dirPath = path.join(__dirname, "..", "QuestionBank", "json", folderName);
  if (!fs.existsSync(dirPath)) {
    console.log(`Folder not found: ${dirPath}`);
    return;
  }
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
  console.log(`\n================ ${folderName.toUpperCase()} ================`);
  
  for (let file of files) {
    const filePath = path.join(dirPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const subjectCounts = {};
    for (let q of data) {
      const s = q.subject || "No Subject";
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    }
    console.log(`${file} (Total: ${data.length}):`, subjectCounts);
  }
}

analyzeFolder("rrb_ntpc_cbt_1");
analyzeFolder("rrb_ntpc_cbt_2");
