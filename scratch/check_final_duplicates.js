const fs = require("fs");
const path = require("path");

const jsonDir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims";

console.log("Checking all 10 mock exams for duplicate questions...\n");

const allQuestionsMap = {}; // text -> Array of {test, id}

for (let i = 1; i <= 10; i++) {
  const filePath = path.join(jsonDir, `ibps_clerk_prelims_test${i}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`Test ${i}: File not found!`);
    continue;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(`Test ${i}: contains ${data.length} questions.`);
  
  // 1. Check subject counts and layout sequence
  let englishCount = 0;
  let quantCount = 0;
  let reasoningCount = 0;
  let sequenceCorrect = true;
  
  data.forEach((q, idx) => {
    const qNum = idx + 1;
    if (qNum <= 30) {
      if (q.subject !== "English Language") sequenceCorrect = false;
      englishCount++;
    } else if (qNum <= 65) {
      if (q.subject !== "Quantitative Aptitude") sequenceCorrect = false;
      quantCount++;
    } else {
      if (q.subject !== "Reasoning Ability") sequenceCorrect = false;
      reasoningCount++;
    }
  });
  
  console.log(`  - Subject Counts: English=${englishCount}, Quant=${quantCount}, Reasoning=${reasoningCount}`);
  console.log(`  - Sequence (Q1-30 Eng, Q31-65 Quant, Q66-100 Reasoning): ${sequenceCorrect ? "MATCHED (OK)" : "ERROR: INVALID SEQUENCE"}`);
  
  // 2. Check for duplicates within the same test
  const seenInCurrent = new Set();
  const duplicatesInCurrent = [];
  
  data.forEach(q => {
    // Stringify options to check if they are identical
    const optionsText = JSON.stringify(q.options.map(o => o.text).sort());
    const qKey = q.question.trim().replace(/\s+/g, " ") + " | OPTIONS: " + optionsText;
    
    if (seenInCurrent.has(qKey)) {
      duplicatesInCurrent.push({ id: q.id, text: q.question.substring(0, 80) + "..." });
    }
    seenInCurrent.add(qKey);
    
    // Track globally to find cross-test duplicates
    if (!allQuestionsMap[qKey]) {
      allQuestionsMap[qKey] = [];
    }
    allQuestionsMap[qKey].push({ test: i, id: q.id });
  });
  
  if (duplicatesInCurrent.length > 0) {
    console.log(`  - [WARNING] Found ${duplicatesInCurrent.length} duplicates inside Test ${i}:`);
    duplicatesInCurrent.forEach(d => {
      console.log(`      - Q${d.id}: "${d.text}"`);
    });
  } else {
    console.log(`  - [OK] 0 duplicate questions inside Test ${i}.`);
  }
}

// 2. Check for duplicate questions across different tests
console.log("\nChecking for duplicate questions across different tests...");
let crossTestDuplicatesCount = 0;

Object.entries(allQuestionsMap).forEach(([text, occurrences]) => {
  if (occurrences.length > 1) {
    // If it's a generic placeholder or short question, it might not be a real duplicate, but let's check
    if (text.length > 30) {
      crossTestDuplicatesCount++;
      console.log(`  [OVERLAP] Question text appears in multiple tests:`);
      console.log(`    Text: "${text.substring(0, 100)}..."`);
      occurrences.forEach(occ => {
        console.log(`    - Test ${occ.test}, Q${occ.id}`);
      });
    }
  }
});

if (crossTestDuplicatesCount === 0) {
  console.log("  [OK] 0 duplicate questions across different tests.");
} else {
  console.log(`  [WARNING] Found ${crossTestDuplicatesCount} overlapping questions across tests.`);
}
