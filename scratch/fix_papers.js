const fs = require("fs");
const path = require("path");
const { Question } = require("../backend/models");

const logFilePath = path.join(__dirname, "sync_results.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "w" });

function log(msg) {
  console.log(msg);
  logStream.write(msg + "\n");
}

function fixPaperDirections(paperNum) {
  log(`=== Starting Test ${paperNum} Directions Patch ===`);
  const filePath = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", `rrb_po_prelims_paper${paperNum}.json`);
  if (!fs.existsSync(filePath)) {
    log(`Error: Test ${paperNum} file not found at ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  
  // Regex to match missing hyphens in range. e.g., Directions (68) or Direction (6365)
  // Removing trailing \b since closing parenthesis followed by non-word char (like :) has no word boundary.
  const pattern = /\b(Directions?)\s*\((\d{2}|\d{4})\)/g;
  
  let matchCount = 0;
  const replacedContent = content.replace(pattern, (match, dirText, digits) => {
    let replaced;
    if (digits.length === 2) {
      replaced = `${dirText} (${digits[0]}-${digits[1]})`;
    } else if (digits.length === 4) {
      replaced = `${dirText} (${digits.slice(0, 2)}-${digits.slice(2)})`;
    } else {
      replaced = match;
    }
    log(`  Replacing: "${match}" -> "${replaced}"`);
    matchCount++;
    return replaced;
  });

  fs.writeFileSync(filePath, replacedContent, "utf8");
  log(`Successfully updated Test ${paperNum}. Total replacements: ${matchCount}`);
  return true;
}

function fixTest6Latex() {
  log("=== Starting Test 6 LaTeX Typos Patch ===");
  const filePath = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", "rrb_po_prelims_paper6.json");
  if (!fs.existsSync(filePath)) {
    log(`Error: Test 6 file not found at ${filePath}`);
    return false;
  }

  let data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let updatedCount = 0;

  for (let q of data) {
    // Q56
    if (q.id === 56 || q.question_number === 56 || q.display_question_number === 56) {
      log(`  Updating Q56 (Quantitative Aptitude Q16)...`);
      if (q.question) q.question = q.question.replace("107.97 / -?", "107.97 \\div ?");
      if (q.q) q.q = q.q.replace("107.97  /  -?", "107.97 \\div ?");
      if (q.explanation) q.explanation = q.explanation.replace("99 + 20 × 101 = 18. 18 = 108 ÷ ? ⇒ ? = 6", "99 + 20 - 101 = 18. 18 = 108 \\div ? \\Rightarrow ? = 6");
      if (q.raw_question) q.raw_question = q.raw_question.replace("107.97 / -?", "107.97 \\div ?");
      if (q.raw_explanation) q.raw_explanation = q.raw_explanation.replace("99 + 20 × 101 = 18. 18 = 108 ÷ ? ⇒ ? = 6", "99 + 20 - 101 = 18. 18 = 108 \\div ? \\Rightarrow ? = 6");
      updatedCount++;
    }
    // Q59
    if (q.id === 59 || q.question_number === 59 || q.display_question_number === 59) {
      log(`  Updating Q59 (Quantitative Aptitude Q19)...`);
      if (q.question) q.question = q.question.replace("32.01 -÷ 1.99^2 -× 127.99 = 2^-?", "32.01 \\div 1.99^2 \\times 127.99 = 2^?");
      if (q.q) q.q = q.q.replace("32.01 -÷ 1.99^2 -× 127.99  =  2^-?", "32.01 \\div 1.99^2 \\times 127.99 = 2^?");
      updatedCount++;
    }
    // Q60
    if (q.id === 60 || q.question_number === 60 || q.display_question_number === 60) {
      log(`  Updating Q60 (Quantitative Aptitude Q20)...`);
      if (q.question) q.question = q.question.replace("63.93^-(\\frac{1}{3})", "63.93^{(\\frac{1}{3})}");
      if (q.q) q.q = q.q.replace("63.93^-(\\frac{1}{3})", "63.93^{(\\frac{1}{3})}");
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  log(`Successfully updated Test 6. Total modified questions: ${updatedCount}`);
  return true;
}

async function verifyAndSyncDatabase() {
  log("\n=== Starting Database Verification & Synchronization ===");

  const papers = [6, 7, 8, 9, 10];
  
  for (let paperNum of papers) {
    const filename = `rrb_po_prelims_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", filename);
    if (!fs.existsSync(filePath)) {
      log(`Error: File not found at ${filePath}`);
      continue;
    }

    log(`\n--- Verification for paper ${paperNum} (${filename}) ---`);
    let diskData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    
    // Find all questions in DB for this source file
    let dbQuestions = await Question.find({ source_file: filename }).sort({ display_question_number: 1 });
    log(`  Disk count: ${diskData.length}, DB count: ${dbQuestions.length}`);

    if (dbQuestions.length === 0) {
      log(`  [WARNING] No questions found in DB for ${filename}!`);
      continue;
    }

    let diffCount = 0;
    for (let diskQ of diskData) {
      // Find matching DB question by display_question_number (id / question_number) and subject
      const qNum = diskQ.display_question_number || diskQ.question_number || diskQ.id;
      const originalSubject = diskQ.subject;
      
      // Look up in our DB questions list
      const dbQ = dbQuestions.find(q => q.display_question_number === qNum);
      
      if (!dbQ) {
        log(`  [DIFF] Question ${qNum} exists on disk but not in DB!`);
        diffCount++;
        continue;
      }

      // Check fields for equality (normalizing spacing/newlines/slashes)
      const norm = (s) => (s || "").toString().replace(/[\s\r\n\t]+/g, " ").trim();

      const diskText = norm(diskQ.question);
      const dbText = norm(dbQ.question);

      if (diskText !== dbText) {
        // Test 6 questions 56, 59, 60 will naturally differ before we sync them
        if (paperNum === 6 && [56, 59, 60].includes(qNum)) {
          log(`  [EXPECTED DIFF] Question ${qNum} has modified disk text vs old DB text.`);
        } else {
          log(`  [DIFF] Text mismatch in Q${qNum}:`);
          log(`    Disk: "${diskText.slice(0, 100)}"`);
          log(`    DB  : "${dbText.slice(0, 100)}"`);
          diffCount++;
        }
      }
    }

    if (diffCount === 0) {
      log(`  [OK] Paper ${paperNum} matches database content perfectly!`);
    } else {
      log(`  [INFO] Paper ${paperNum} has ${diffCount} differences.`);
    }
  }

  // Update DB questions for paper 4 and paper 6 to reflect the fixes
  log("\n=== Syncing corrections to MongoDB ===");
  
  // Paper 4
  const paper4Path = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", "rrb_po_prelims_paper4.json");
  if (fs.existsSync(paper4Path)) {
    const diskData4 = JSON.parse(fs.readFileSync(paper4Path, "utf8"));
    let updated4 = 0;
    for (let diskQ of diskData4) {
      const qNum = diskQ.display_question_number || diskQ.question_number || diskQ.id;

      // Update in DB
      const result = await Question.updateOne(
        { source_file: "rrb_po_prelims_paper4.json", display_question_number: qNum },
        { 
          $set: { 
            question: diskQ.question, 
            q: diskQ.q,
            direction: diskQ.direction || "",
            raw_direction: diskQ.direction || "",
            raw_question: diskQ.question
          } 
        }
      );
      if (result.modifiedCount > 0) {
        updated4++;
      }
    }
    log(`  Successfully updated ${updated4} questions in DB for Test 4.`);
  }

  // Paper 6
  const paper6Path = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", "rrb_po_prelims_paper6.json");
  if (fs.existsSync(paper6Path)) {
    const diskData6 = JSON.parse(fs.readFileSync(paper6Path, "utf8"));
    let updated6 = 0;
    for (let diskQ of diskData6) {
      const qNum = diskQ.display_question_number || diskQ.question_number || diskQ.id;
      if (![56, 59, 60].includes(qNum)) continue;

      const result = await Question.updateOne(
        { source_file: "rrb_po_prelims_paper6.json", display_question_number: qNum },
        { 
          $set: { 
            question: diskQ.question, 
            q: diskQ.q,
            explanation: diskQ.explanation,
            raw_question: diskQ.raw_question || diskQ.question,
            raw_explanation: diskQ.raw_explanation || diskQ.explanation
          } 
        }
      );
      if (result.modifiedCount > 0) {
        updated6++;
      }
    }
    log(`  Successfully updated ${updated6} questions in DB for Test 6.`);
  }

  log("\n=== All Tasks Completed Successfully ===");
  logStream.end();
}

async function run() {
  try {
    for (let paperNum of [4, 6, 7, 8, 9, 10]) {
      fixPaperDirections(paperNum);
    }
    fixTest6Latex();
    await verifyAndSyncDatabase();
  } catch (err) {
    log(`FATAL ERROR: ${err}`);
    logStream.end();
  }
}

module.exports = { run };

if (require.main === module) {
  const mongoose = require("../backend/node_modules/mongoose");
  require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
  console.log("Running standalone fix_papers script, connecting to MongoDB...");
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log("Connected to MongoDB successfully!");
      await run();
      mongoose.disconnect();
    })
    .catch(err => {
      console.error("Database connection error:", err);
      process.exit(1);
    });
}
