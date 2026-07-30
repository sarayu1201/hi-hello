const fs = require("fs");
const path = require("path");

const jsonFile = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims", "ibpspo_test_1.json");
const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

const targets = [25, 26];
targets.forEach(id => {
  const q = questions.find(x => x.id === id);
  if (q) {
    console.log(`\n=== Question ${id} ===`);
    console.log("Question:", q.question);
    console.log("Options:", q.options);
    console.log("Explanation:\n", q.explanation);
  }
});
