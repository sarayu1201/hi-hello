const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    return execSync(cmd, { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  } catch (err) {
    console.error(`Cmd failed: ${err.message}`);
    return null;
  }
}

function cleanOptionText(text) {
  if (typeof text !== "string") return text;

  let cleaned = text;

  // 1. Remove double newlines or long gaps and take first block
  if (cleaned.includes("\n")) {
    const parts = cleaned.split(/\r?\n\s*\r?\n/);
    if (parts.length > 1) {
      if (parts[0].trim() === "." || parts[0].trim() === "") {
        cleaned = parts[1] || parts[0];
      } else {
        cleaned = parts[0];
      }
    }
  }

  // 2. Truncate at common scraper artifacts/directions
  const truncationPatterns = [
    /Directions\s*\(/i,
    /Read the following/i,
    /Each sentence is/i,
    /In each of the/i,
    /There are certain/i,
    /In the following/i,
    /Read each sentence/i,
    /In the question/i,
    /In the following question/i,
    /Solve both equations/i,
    /In each question/i,
    /\r?\n\s*\([a-z0-9]\)\s+/i, // Only truncate if sub-options list is on a new line
    /^\s*\.\s*$/
  ];

  for (let pattern of truncationPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      cleaned = cleaned.substring(0, match.index);
    }
  }

  // 3. Remove trailing digits that represent next question numbers (e.g. "viable \n\n 7" or "viable \n 7")
  cleaned = cleaned.replace(/\r?\n\s*\d+\s*$/, "");
  cleaned = cleaned.replace(/\s+\d+\s*$/, "");

  // 4. Replace single newlines with space to fix wrapped column layouts
  cleaned = cleaned.replace(/\r?\n/g, " ");

  // 5. Replace multiple spaces with a single space
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  cleaned = cleaned.trim();

  // If the option is left empty or is just a single dot/comma, give it a clean standard fallback
  if (cleaned === "" || cleaned === "." || cleaned === ",") {
    cleaned = "None of these";
  }

  return cleaned;
}

async function run() {
  console.log("=== Restoring original PO JSON files from Git history ===");
  // Restore files from commit 7462c78
  runCmd("git checkout 7462c78 -- QuestionBank/json/ibps_po_prelims/");

  console.log("\n=== Running Refined Option Cleansing on restored files ===");
  for (let i = 1; i <= 10; i++) {
    const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
    if (!fs.existsSync(jsonFile)) continue;

    console.log(`  Cleaning options in ${path.basename(jsonFile)}...`);
    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

    for (let q of questions) {
      if (q.options) {
        for (let opt of q.options) {
          opt.text = cleanOptionText(opt.text);
        }
      }
    }

    // Save cleaned file back to disk
    fs.writeFileSync(jsonFile, JSON.stringify(questions, null, 2), "utf8");
  }

  console.log("\nConnecting to MongoDB for direct database update...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  console.log("\n1. Direct purging of capitalized 'IBPS PO Prelims' questions from DB...");
  const delUpper = await col.deleteMany({ course: "IBPS PO Prelims" });
  console.log(`Deleted ${delUpper.deletedCount} capitalized documents.`);

  console.log("\n2. Direct purging of lowercase 'ibps_po_prelims' questions from DB...");
  const delLower = await col.deleteMany({ course: "ibps_po_prelims" });
  console.log(`Deleted ${delLower.deletedCount} lowercase documents.`);

  console.log("\n3. Re-seeding clean questions with source_file field...");
  for (let i = 1; i <= 10; i++) {
    const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
    if (!fs.existsSync(jsonFile)) continue;

    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const docs = [];

    for (let q of questions) {
      const qId = q.id;
      const subject = q.subject || "English Language";
      
      const clean_exam = "IBPSPOPRELIMS";
      const clean_subject = subject.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const clean_sub_type = `IBPSPOPRELIMSTEST${i}`;
      const uniqueId = `IBPSPOPRELIMS_${clean_sub_type}_2022_${clean_subject}_Q${qId}`;

      const optionsFormatted = q.options.map(opt => opt.text);

      let correctLetter = q.correctAnswer || "A";
      let correctText = "";
      const matchedOpt = q.options.find(opt => opt.id === correctLetter);
      if (matchedOpt) {
        correctText = matchedOpt.text;
      }

      const qDoc = {
        unique_id: uniqueId,
        display_question_number: qId,
        course: "IBPS PO Prelims",
        exam_type: "Banking",
        sub_type: `IBPS PO Prelims - Test ${i}`,
        test_title: `IBPS PO Prelims - Test ${i}`,
        test_id: `ibps_po_prelims_test${i}`,
        source_file: `ibpspo_test_${i}.json`,
        subject: subject,
        chapter: q.topic || "",
        topic: q.topic || "",
        difficulty: q.difficulty || "Medium",
        question_type: "Multiple Choice",
        question: q.question,
        options: optionsFormatted,
        correct_option: correctLetter,
        correct_answer: correctText,
        correct_letter: correctLetter,
        explanation: q.explanation || "",
        question_image: q.questionImage || null,
        option_images: [null, null, null, null, null],
        direction: q.direction || null,
        raw_direction: q.direction || null,
        raw_question: q.question,
        raw_explanation: q.explanation || "",
        raw_options: q.options.map(o => o.text),
        is_mock_eligible: true,
        status: "approved",
        created_at: new Date(),
        updated_at: new Date()
      };
      docs.push(qDoc);
    }

    if (docs.length > 0) {
      const res = await col.insertMany(docs);
      console.log(`    Seeded ${res.insertedCount} clean questions for Test ${i}.`);
    }
  }

  await mongoose.disconnect();
  console.log("\n=== Beautiful Option formatting complete! ===");
}

run().catch(err => console.error(err));
