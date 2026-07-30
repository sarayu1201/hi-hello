const fs = require("fs");
const path = require("path");

function run() {
  const papers = Array.from({ length: 10 }, (_, i) => i + 1);

  for (let paperNum of papers) {
    const filename = `ssc_chsl_tier1_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "ssc_chsl_tier1_papers", filename);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    for (let q of data) {
      const hasDecoy = q.options && q.options.some(o => o.text && o.text.includes("Decoy A"));
      if (hasDecoy) {
        console.log(`PAPER ${paperNum} - Q${q.display_question_number}:`);
        console.log(`  Question: "${q.question}"`);
        console.log(`  Explanation: "${q.explanation}"`);
        console.log(`  Correct Option: ${q.correct_option}`);
        console.log(`  Options:`);
        q.options.forEach(o => console.log(`    ${o.id}: "${o.text}"`));
        console.log(`-----------------------------------------`);
      }
    }
  }
}

run();
