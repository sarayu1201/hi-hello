const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "decoys_found.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "w" });

function log(msg) {
  console.log(msg);
  logStream.write(msg + "\n");
}

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
        log(`=========================================`);
        log(`PAPER ${paperNum} - Q${q.display_question_number}:`);
        log(`=========================================`);
        log(`Question: ${q.question}`);
        log(`Explanation: ${q.explanation}`);
        log(`Correct Option: ${q.correct_option}`);
        log(`Options:`);
        q.options.forEach(o => log(`  ${o.id}: "${o.text}"`));
      }
    }
  }
  logStream.end();
}

run();
