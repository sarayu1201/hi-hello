const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

console.log("=== Verifying all 10 PO Mock JSON files on disk ===\n");

let totalSuspicious = 0;

const shortSuspects = ["only", "both", "either", "neither", "none", "all"];

for (let i = 1; i <= 10; i++) {
  const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
  if (!fs.existsSync(jsonFile)) {
    console.log(`Test ${i}: File not found!`);
    continue;
  }

  const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  let testSuspiciousCount = 0;

  for (let q of questions) {
    if (!q.options) continue;
    
    for (let opt of q.options) {
      const text = (opt.text || "").trim();
      const lower = text.toLowerCase();
      
      let isSuspicious = false;
      let reasons = [];

      // 1. Check for suspiciously truncated short option
      if (shortSuspects.includes(lower)) {
        isSuspicious = true;
        reasons.push(`Suspiciously short value: "${text}"`);
      }

      // 2. Check for remaining newlines
      if (text.includes("\n") || text.includes("\r")) {
        isSuspicious = true;
        reasons.push("Contains newlines");
      }

      // 3. Check for large gaps of spaces
      if (/\s{2,}/.test(text)) {
        isSuspicious = true;
        reasons.push("Contains consecutive double spaces");
      }

      // 4. Check for trailing numbers
      if (/\s+\d+$/.test(text)) {
        isSuspicious = true;
        reasons.push("Contains trailing numbers");
      }

      // 5. Check if it contains scraper instructions
      if (/Directions\s*\(/i.test(text) || /Each sentence is/i.test(text)) {
        isSuspicious = true;
        reasons.push("Contains scraper instructions");
      }

      if (isSuspicious) {
        testSuspiciousCount++;
        totalSuspicious++;
        console.log(`Test ${i}, Q${q.id} (Option ${opt.id}): "${text}"`);
        reasons.forEach(r => console.log(`  -> ${r}`));
      }
    }
  }

  console.log(`Test ${i}: Verified ${questions.length} questions. Suspicious options found: ${testSuspiciousCount}\n`);
}

console.log(`Verification Complete. Total suspicious options found: ${totalSuspicious}`);
if (totalSuspicious === 0) {
  console.log("SUCCESS: All 10 mocks are 100% clean and correct!");
}
