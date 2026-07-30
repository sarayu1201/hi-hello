const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

console.log("Searching for LaTeX commands and patterns...\n");

const uniqueCommands = new Set();
const sampleMatches = [];

for (let i = 1; i <= 10; i++) {
  const filePath = path.join(jsonDir, `ibpspo_test_${i}.json`);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, "utf8");
  const questions = JSON.parse(content);
  
  for (let q of questions) {
    const fields = [
      { name: "question", text: q.question },
      ...(q.options || []).map((o, idx) => ({ name: `option ${o.id}`, text: o.text })),
      { name: "explanation", text: q.explanation },
      { name: "direction", text: q.direction }
    ].filter(f => f.text);

    for (let f of fields) {
      // Find all backslash commands
      const matches = f.text.match(/\\[a-zA-Z]+/g);
      if (matches) {
        for (let m of matches) {
          uniqueCommands.add(m);
          if (sampleMatches.length < 30) {
            sampleMatches.push({ test: i, qId: q.id, field: f.name, text: f.text });
          }
        }
      }
    }
  }
}

console.log("Unique LaTeX Commands found in the files:", Array.from(uniqueCommands));
console.log("\nSample text snippets containing LaTeX:");
sampleMatches.slice(0, 15).forEach(s => {
  console.log(`\nTest ${s.test}, Question ${s.qId} (${s.field}):`);
  console.log(`  ${s.text}`);
});
