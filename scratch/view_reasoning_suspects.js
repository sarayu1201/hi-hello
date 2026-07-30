const fs = require("fs");
const path = require("path");

const targets = [
  { test: 1, id: 74 },
  { test: 3, id: 83 },
  { test: 10, id: 95 }
];

targets.forEach(t => {
  const jsonFile = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims", `ibpspo_test_${t.test}.json`);
  if (fs.existsSync(jsonFile)) {
    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const q = questions.find(x => x.id === t.id);
    if (q) {
      console.log(`\n=== Test ${t.test}, Question ${t.id} ===`);
      console.log("Question:", q.question);
      console.log("Options:", q.options.map(o => `${o.id}: "${o.text}"`));
      console.log("Explanation:\n", q.explanation);
    }
  }
});
