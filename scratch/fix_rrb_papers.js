const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const logFilePath = path.join(__dirname, "rrb_fix.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "w" });

function log(msg) {
  console.log(msg);
  logStream.write(msg + "\n");
}

function sanitizeLatex(str) {
  if (!str) return str;
  // Replace raw symbols inside math blocks ($...$)
  return str.replace(/\$([^\$]+)\$/g, (match, mathContent) => {
    let clean = mathContent;
    clean = clean.replace(/-÷/g, "\\div");
    clean = clean.replace(/-×/g, "\\times");
    clean = clean.replace(/-\*/g, "\\times");
    clean = clean.replace(/√/g, "\\sqrt");
    clean = clean.replace(/∛/g, "\\sqrt[3]");
    clean = clean.replace(/⁴√/g, "\\sqrt[4]");
    clean = clean.replace(/⁵√/g, "\\sqrt[5]");
    clean = clean.replace(/÷/g, "\\div");
    clean = clean.replace(/×/g, "\\times");
    clean = clean.replace(/\*/g, "\\times");
    clean = clean.replace(/∥/g, "\\parallel");
    clean = clean.replace(/\\\\\s*/g, "\\"); // clean up double backslashes
    return `$${clean}$`;
  });
}

async function run() {
  log("Starting RRB PO papers local formatting and DB sync...");

  const papers = Array.from({ length: 10 }, (_, i) => i + 1);

  // 1. Process files locally
  for (let paperNum of papers) {
    const filename = `rrb_po_prelims_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", filename);
    if (!fs.existsSync(filePath)) {
      log(`Error: Disk file not found: ${filePath}`);
      continue;
    }

    log(`Processing Paper ${paperNum}...`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    for (let q of data) {
      // Apply LaTeX sanitization
      q.question = sanitizeLatex(q.question);
      if (q.q) q.q = sanitizeLatex(q.q);
      q.explanation = sanitizeLatex(q.explanation);
      if (q.options) {
        q.options = q.options.map(opt => ({
          ...opt,
          text: sanitizeLatex(opt.text)
        }));
      }
    }

    // Write back modified JSON to disk
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    log(`  Successfully wrote corrected JSON to disk.`);
  }

  // 2. Connect to MongoDB to overwrite and sync
  log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  log("Connected to MongoDB successfully!");

  for (let paperNum of papers) {
    const filename = `rrb_po_prelims_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "rrb_po", filename);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    log(`Syncing database for ${filename} (${data.length} questions)...`);

    for (let diskQ of data) {
      const qNum = diskQ.display_question_number || diskQ.question_number || diskQ.id;

      // Extract and map options to match flat schema structure
      const mappedOptions = diskQ.options.map(opt => opt.text);

      const updateData = {
        question: diskQ.question,
        options: mappedOptions,
        correct_option: diskQ.correct_option,
        correct_answer: diskQ.correct_answer,
        explanation: diskQ.explanation,
        question_image: diskQ.question_image || "",
        option_images: diskQ.option_images || ["", "", "", "", ""],
        course: diskQ.course || "rrb_po",
        exam_type: diskQ.exam_type || "RRB",
        sub_type: diskQ.sub_type || `IBPS RRB PO Prelims - Test ${paperNum}`,
        paper_name: diskQ.paper_name || `IBPS RRB PO Prelims - Test ${paperNum}`,
        subject: diskQ.subject,
        chapter: diskQ.chapter || "",
        topic: diskQ.topic || "",
        difficulty: diskQ.difficulty || "Medium",
        category: diskQ.category || "RRB & Railways",
        section: diskQ.section || diskQ.subject,
        q: diskQ.q || diskQ.question,
        correct_letter: diskQ.correct_letter || diskQ.correct_option,
        status: diskQ.status || "ok",
        is_mock_eligible: diskQ.is_mock_eligible !== undefined ? diskQ.is_mock_eligible : true,
        source_file: filename,
        display_question_number: qNum,
        updated_at: new Date()
      };

      await Question.findOneAndUpdate(
        { unique_id: diskQ.unique_id },
        { $set: updateData },
        { new: true, upsert: true }
      );
    }
    log(`  DB Sync completed for Paper ${paperNum}.`);
  }

  await mongoose.disconnect();
  log("Database sync process complete.");
  logStream.end();
}

run().catch(err => {
  log(`FATAL ERROR: ${err}`);
  logStream.end();
});
