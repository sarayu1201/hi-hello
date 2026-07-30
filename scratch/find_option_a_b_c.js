const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

console.log("Searching for options containing 'Option A' or 'OPTION A'...\n");

for (let i = 1; i <= 10; i++) {
  const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
  if (!fs.existsSync(jsonFile)) continue;

  const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  let count = 0;

  for (let q of questions) {
    if (!q.options) continue;
    for (let opt of q.options) {
      const text = (opt.text || "").trim();
      if (/option\s*[a-e]/i.test(text)) {
        if (count < 5) {
          console.log(`Test ${i}, Q${q.id} (${opt.id}): "${text}"`);
        }
        count++;
      }
    }
  }
  console.log(`Test ${i}: Found ${count} matches.\n`);
}
