const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCmd(cmd) {
  try {
    return execSync(cmd, { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  } catch (err) {
    return null;
  }
}

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");
console.log("Scanning original files for empty/dot options...\n");

let totalEmpty = 0;

for (let i = 1; i <= 10; i++) {
  const filename = `ibpspo_test_${i}.json`;
  const tempPath = path.join(__dirname, "..", "scratch", `temp_test_${i}.json`);
  
  runCmd(`git show 7462c78:QuestionBank/json/ibps_po_prelims/${filename} > scratch/temp_test_${i}.json`);
  
  if (fs.existsSync(tempPath)) {
    const questions = JSON.parse(fs.readFileSync(tempPath, "utf8"));
    let emptyInTest = 0;
    
    for (let q of questions) {
      if (!q.options) continue;
      const allEmpty = q.options.every(o => {
        const txt = (o.text || "").trim();
        return txt === "" || txt === "." || txt === ",";
      });
      if (allEmpty) {
        if (emptyInTest < 3) {
          console.log(`  Test ${i}, Q${q.id} (Subject: ${q.subject}) has ALL options empty/dots.`);
        }
        emptyInTest++;
        totalEmpty++;
      }
    }
    console.log(`Test ${i}: Found ${emptyInTest} questions with all empty/dot options.\n`);
    fs.unlinkSync(tempPath);
  }
}

console.log(`Scan Complete. Total questions with all empty/dot options: ${totalEmpty}`);
