const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const logFilePath = path.join(__dirname, "chsl_comparison.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "w" });

function log(msg) {
  console.log(msg);
  logStream.write(msg + "\n");
}

async function run() {
  log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  log("Connected to MongoDB successfully!\n");

  const papers = Array.from({ length: 10 }, (_, i) => i + 1);

  for (let paperNum of papers) {
    const filename = `ssc_chsl_tier1_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "ssc_chsl_tier1_papers", filename);
    if (!fs.existsSync(filePath)) {
      log(`Error: Disk file not found: ${filePath}`);
      continue;
    }

    log(`=========================================`);
    log(`PAPER ${paperNum}: ${filename}`);
    log(`=========================================`);

    const diskData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const dbQuestions = await Question.find({ source_file: filename }).sort({ display_question_number: 1 });

    log(`Disk count: ${diskData.length}`);
    log(`DB count  : ${dbQuestions.length}`);

    if (diskData.length !== dbQuestions.length) {
      log(`[WARNING] Count mismatch: Disk has ${diskData.length}, DB has ${dbQuestions.length}`);
    }

    let mismatches = 0;
    let latexIssues = 0;
    let imageAnomalies = 0;

    for (let diskQ of diskData) {
      const qNum = diskQ.display_question_number || diskQ.question_number || diskQ.id;
      const dbQ = dbQuestions.find(q => q.display_question_number === qNum);

      if (!dbQ) {
        log(`[MISSING IN DB] Question ${qNum} not found in database.`);
        mismatches++;
        continue;
      }

      // 1. Text Comparison
      const norm = (s) => (s || "").toString().replace(/[\s\r\n\t]+/g, " ").trim();
      const diskText = norm(diskQ.question);
      const dbText = norm(dbQ.question);

      if (diskText !== dbText) {
        log(`[TEXT MISMATCH] Q${qNum}:`);
        log(`  Disk: "${diskText.slice(0, 120)}..."`);
        log(`  DB  : "${dbText.slice(0, 120)}..."`);
        mismatches++;
      }

      // 2. Options Comparison
      if (diskQ.options && dbQ.options) {
        if (diskQ.options.length !== dbQ.options.length) {
          log(`[OPTIONS COUNT MISMATCH] Q${qNum}: Disk has ${diskQ.options.length}, DB has ${dbQ.options.length}`);
          mismatches++;
        } else {
          for (let i = 0; i < diskQ.options.length; i++) {
            const diskOptText = norm(diskQ.options[i].text);
            const dbOptText = norm(dbQ.options[i]);
            if (diskOptText !== dbOptText) {
              log(`[OPTION TEXT MISMATCH] Q${qNum} Option ${diskQ.options[i].id}:`);
              log(`  Disk: "${diskOptText}"`);
              log(`  DB  : "${dbOptText}"`);
              mismatches++;
            }
          }
        }
      }

      // 3. LaTeX check in fields (disk and DB)
      const latexRegex = /(\$[^\$]+\$)/g;
      const checkLatexInStr = (str, fieldName) => {
        if (!str) return;
        // Check for common formatting errors inside math blocks (like unresolved double slashes, raw root characters, etc.)
        if (str.includes("\\\\")) {
          log(`[LATEX ISSUE - double backslash] Q${qNum} (${fieldName}): "${str}"`);
          latexIssues++;
        }
        if (str.includes("√") && str.includes("$")) {
          log(`[LATEX ISSUE - raw root inside math] Q${qNum} (${fieldName}): "${str}"`);
          latexIssues++;
        }
        // Match math blocks and check internal syntax
        const matches = str.match(latexRegex);
        if (matches) {
          for (let m of matches) {
            if (m.includes("÷") || m.includes("×")) {
              log(`[LATEX ISSUE - non-standard operators in math] Q${qNum} (${fieldName}): "${m}"`);
              latexIssues++;
            }
          }
        }
      };

      checkLatexInStr(diskQ.question, "Disk Question");
      checkLatexInStr(diskQ.explanation, "Disk Explanation");
      checkLatexInStr(dbQ.question, "DB Question");
      checkLatexInStr(dbQ.explanation, "DB Explanation");

      // 4. Image check
      if (diskQ.question_image && !dbQ.question_image) {
        log(`[IMAGE MISMATCH - missing in DB] Q${qNum} Question Image: "${diskQ.question_image}"`);
        imageAnomalies++;
      }
      if (diskQ.option_images && dbQ.option_images) {
        for (let i = 0; i < diskQ.option_images.length; i++) {
          if (diskQ.option_images[i] && !dbQ.option_images[i]) {
            log(`[IMAGE MISMATCH - missing in DB] Q${qNum} Option ${i} Image: "${diskQ.option_images[i]}"`);
            imageAnomalies++;
          }
        }
      }
    }

    log(`Paper ${paperNum} complete. Mismatches: ${mismatches}, LaTeX Issues: ${latexIssues}, Image Issues: ${imageAnomalies}\n`);
  }

  await mongoose.disconnect();
  log("Disconnected from MongoDB.");
  logStream.end();
}

run().catch(err => {
  log(`FATAL ERROR: ${err}`);
  logStream.end();
});
