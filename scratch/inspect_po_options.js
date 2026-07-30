const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

console.log("Analyzing options across all 10 mocks...\n");

for (let i = 1; i <= 10; i++) {
  const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
  if (!fs.existsSync(jsonFile)) continue;

  const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  let badOptionsCount = 0;
  
  questions.forEach(q => {
    if (!q.options) return;
    
    q.options.forEach(opt => {
      const text = opt.text || "";
      
      const isPlaceholder = /option\s*[a-e]/i.test(text);
      const hasHugeGaps = /\s{3,}/.test(text);
      const isTooLongOrHasQuestion = text.toLowerCase().includes("question") || text.length > 200;

      if (isPlaceholder || hasHugeGaps || isTooLongOrHasQuestion) {
        if (badOptionsCount < 3) {
          console.log(`Test ${i}, Q${q.id} (${opt.id}): "${text}"`);
          if (isPlaceholder) console.log("  -> [Placeholder Option]");
          if (hasHugeGaps) console.log("  -> [Large spaces/gaps]");
          if (isTooLongOrHasQuestion) console.log("  -> [Too long or contains 'question']");
        }
        badOptionsCount++;
      }
    });
  });
  
  console.log(`Test ${i}: Found ${badOptionsCount} suspicious options.\n`);
}
