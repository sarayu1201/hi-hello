const fs = require("fs");
const path = require("path");

const folders = ["rrb_ntpc_cbt_1", "rrb_ntpc_cbt_2"];
const baseDir = path.join(__dirname, "..", "QuestionBank", "json");

console.log("Scanning both CBT-1 and CBT-2 mock JSON files for questions with images...\n");

for (let folder of folders) {
  const dirPath = path.join(baseDir, folder);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
  console.log(`================ ${folder.toUpperCase()} ================`);
  
  for (let file of files) {
    const filePath = path.join(dirPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    
    const matches = [];
    for (let q of data) {
      if (q.questionImage) {
        matches.push({
          id: q.id || q.question_number,
          image: q.questionImage
        });
      }
    }
    
    if (matches.length > 0) {
      console.log(`[${file}]:`);
      matches.forEach(m => {
        console.log(`  - Question No. ${m.id} (Image: "${m.image}")`);
      });
    }
  }
}
