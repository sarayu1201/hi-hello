const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..", "QuestionBank", "json", "rrb_ntpc_cbt_1");
console.log("Scanning RRB NTPC CBT-1 mock JSON files for questions with images...");

const files = fs.readdirSync(rootDir).filter(f => f.endsWith(".json"));

for (let file of files) {
  const filePath = path.join(rootDir, file);
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
    console.log(`\n[${file}]: Found ${matches.length} questions with images:`);
    matches.forEach(m => {
      console.log(`  - Question No. ${m.id} (Image: "${m.image}")`);
    });
  }
}
