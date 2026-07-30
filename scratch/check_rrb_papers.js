const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const logFilePath = path.join(__dirname, "rrb_comparison.log");
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
    const filename = `rrb_po_prelims_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", filename);
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

    // Section counts
    const sections = {};
    diskData.forEach(q => {
      const sec = q.section || q.subject || "Unknown";
      sections[sec] = (sections[sec] || 0) + 1;
    });
    log("Sections in JSON file:");
    for (let sec in sections) {
      log(`  - ${sec}: ${sections[sec]} questions`);
    }

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
        log(`[MISSING IN DB] Q${qNum} not found in database.`);
        mismatches++;
        continue;
      }

      // 1. Text Comparison
      const norm = (s) => (s || "").toString().replace(/[\s\r\n\t]+/g, " ").trim();
      const diskText = norm(diskQ.question);
      const dbText = norm(dbQ.question);

      if (diskText !== dbText) {
        log(`[TEXT MISMATCH] Q${qNum}:`);
        log(`  Disk: "${diskText.slice(0, 100)}..."`);
        log(`  DB  : "${dbText.slice(0, 100)}..."`);
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
      const checkLatexInStr = (str, fieldName) => {
        if (!str) return;
        if (str.includes("\\\\")) {
          log(`[LATEX ISSUE - double backslash] Q${qNum} (${fieldName}): "${str}"`);
          latexIssues++;
        }
        if (str.includes("√") && str.includes("$")) {
          log(`[LATEX ISSUE - raw root inside math] Q${qNum} (${fieldName}): "${str}"`);
          latexIssues++;
        }
        if (str.includes("÷") && str.includes("$")) {
          log(`[LATEX ISSUE - raw divide inside math] Q${qNum} (${fieldName}): "${str}"`);
          latexIssues++;
        }
        if (str.includes("×") && str.includes("$")) {
          log(`[LATEX ISSUE - raw multiply inside math] Q${qNum} (${fieldName}): "${str}"`);
          latexIssues++;
        }
        if (str.includes("ATHBLOCK")) {
          log(`[LATEX ISSUE - ATHBLOCK typo] Q${qNum} (${fieldName}): "${str}"`);
          latexIssues++;
        }
        // Chemistry subscripts (e.g., H2O, CO2 without subscript) check - optional check
        if (fieldName === "question" || fieldName === "explanation") {
          // Look for chemistry pattern e.g. H2SO4, CO2, O2, H2O, C6H12O6
          const chemMatch = str.match(/\b(H2O|CO2|O2|H2SO4|C6H12O6|NaCl|HCl|HNO3)\b/i);
          if (chemMatch) {
            log(`[CHEMISTRY FORMULA CHECK] Q${qNum} (${fieldName}): "${str}" contains formula "${chemMatch[0]}"`);
          }
        }
      };

      checkLatexInStr(diskQ.question, "question");
      checkLatexInStr(diskQ.explanation, "explanation");
      if (diskQ.options) {
        diskQ.options.forEach(opt => checkLatexInStr(opt.text, `option ${opt.id}`));
      }

      // 4. Image check
      if (diskQ.question_image && !diskQ.question_image.startsWith("http") && !diskQ.question_image.startsWith("/")) {
        log(`[IMAGE ANOMALY - local path or placeholder] Q${qNum}: "${diskQ.question_image}"`);
        imageAnomalies++;
      }
    }

    log(`Paper ${paperNum} complete. Mismatches: ${mismatches}, LaTeX Issues: ${latexIssues}, Image Issues: ${imageAnomalies}\n`);
  }

  log("Disconnected from MongoDB.");
  await mongoose.disconnect();
  logStream.end();
}

run().catch(console.error);
