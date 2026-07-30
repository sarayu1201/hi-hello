const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

console.log("Checking for empty options across all 10 PO mocks...\n");

let totalEmptyQuestions = 0;

for (let i = 1; i <= 10; i++) {
  const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
  if (!fs.existsSync(jsonFile)) continue;

  const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  let emptyInTest = 0;

  for (let q of questions) {
    if (!q.options) continue;
    
    // Check if any option text is completely empty or blank
    const hasEmpty = q.options.some(opt => (opt.text || "").trim() === "");
    if (hasEmpty) {
      if (emptyInTest < 3) {
        console.log(`Test ${i}, Q${q.id} (Subject: ${q.subject}):`);
        console.log("  Options:", q.options.map(o => `${o.id}: "${o.text}"`));
      }
      emptyInTest++;
      totalEmptyQuestions++;
    }
  }

  console.log(`Test ${i}: Found ${emptyInTest} questions with empty options.\n`);
}

console.log(`Scan Complete. Total questions with empty options: ${totalEmptyQuestions}`);
