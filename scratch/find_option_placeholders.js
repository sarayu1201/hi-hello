const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

console.log("Searching for placeholder options...\n");

for (let i = 1; i <= 10; i++) {
  const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
  if (!fs.existsSync(jsonFile)) continue;

  const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  let placeholders = 0;

  for (let q of questions) {
    if (!q.options) continue;
    
    // Check if the options are just letters/placeholders
    const isAllPlaceholders = q.options.every(opt => {
      const t = (opt.text || "").trim().toLowerCase();
      return t === "a" || t === "b" || t === "c" || t === "d" || t === "e" ||
             t === "option a" || t === "option b" || t === "option c" || t === "option d" || t === "option e" ||
             t === "(a)" || t === "(b)" || t === "(c)" || t === "(d)" || t === "(e)" ||
             t === "optiona" || t === "optionb" || t === "optionc" || t === "optiond" || t === "optione";
    });

    if (isAllPlaceholders) {
      if (placeholders < 3) {
        console.log(`Test ${i}, Question ${q.id} (Subject: ${q.subject}):`);
        console.log("  Options:", q.options.map(o => `${o.id}: "${o.text}"`));
      }
      placeholders++;
    }
  }

  console.log(`Test ${i}: Found ${placeholders} questions with ONLY placeholders.\n`);
}
