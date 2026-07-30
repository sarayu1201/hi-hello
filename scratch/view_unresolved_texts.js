const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

const targets = [
  { test: 1, id: 55 },
  { test: 1, id: 60 },
  { test: 2, id: 31 },
  { test: 2, id: 37 },
  { test: 2, id: 39 },
  { test: 2, id: 41 },
  { test: 4, id: 34 },
  { test: 4, id: 46 },
  { test: 6, id: 60 },
  { test: 7, id: 50 }
];

targets.forEach(t => {
  const jsonFile = path.join(jsonDir, `ibpspo_test_${t.test}.json`);
  if (fs.existsSync(jsonFile)) {
    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const q = questions.find(x => x.id === t.id);
    if (q) {
      console.log(`\n[Test ${t.test} Q${t.id}]`);
      console.log(`  Question: "${q.question}"`);
      console.log(`  Direction: "${q.direction || ""}"`);
      console.log(`  Explanation Correct Answer: "${q.correctAnswer}"`);
    }
  }
});
