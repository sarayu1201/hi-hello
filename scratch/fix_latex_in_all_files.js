const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

function cleanLatex(str) {
  if (typeof str !== "string") return str;

  let res = str;

  // 1. Replace \text{...} with content inside
  while (res.includes("\\text")) {
    const nextText = res.replace(/\\text\s*\{\s*([^{}]+)\s*\}/g, "$1");
    if (nextText === res) break;
    res = nextText;
  }

  // 2. Replace \frac{A}{B} with A / B
  while (res.includes("\\frac")) {
    const nextFrac = res.replace(/\\frac\s*\{\s*([^{}]+)\s*\}\s*\{\s*([^{}]+)\s*\}/g, "$1 / $2");
    if (nextFrac === res) break;
    res = nextFrac;
  }

  // 3. Replace \sqrt{A} with √A
  while (res.includes("\\sqrt")) {
    const nextSqrt = res.replace(/\\sqrt\s*\{\s*([^{}]+)\s*\}/g, "√$1");
    if (nextSqrt === res) break;
    res = nextSqrt;
  }

  // 4. Mathematical symbol conversions
  res = res.replace(/\\times/g, "×");
  res = res.replace(/\\div/g, "÷");
  res = res.replace(/\\ge/g, "≥");
  res = res.replace(/\\le/g, "≤");
  res = res.replace(/\\%/g, "%");

  // 5. Unescaped parenthesis delimiters
  res = res.replace(/\\left\(/g, "(").replace(/\\right\)/g, ")");
  res = res.replace(/\\left\[/g, "[").replace(/\\right\]/g, "]");
  res = res.replace(/\\left\{/g, "{").replace(/\\right\}/g, "}");

  // 6. Delimiter dollars removal
  res = res.replace(/\$\$/g, "");
  res = res.replace(/\$/g, "");

  // 7. Superscripts to clean exponents
  res = res.replace(/\^\{\s*2\s*\}/g, "²").replace(/\^2/g, "²");
  res = res.replace(/\^\{\s*3\s*\}/g, "³").replace(/\^3/g, "³");
  res = res.replace(/\^\{\s*([^{}]+)\s*\}/g, "^$1");

  // 8. Remaining latex whitespace cleanup
  res = res.replace(/\\\s+/g, " ");
  res = res.replace(/\\,/g, " ");
  res = res.replace(/\\;/g, " ");

  // 9. Standardize multiple spaces
  res = res.replace(/ +/g, " ");

  return res.trim();
}

async function run() {
  console.log("=== Starting LaTeX Equation Cleanup for All 10 Mocks ===");

  for (let i = 1; i <= 10; i++) {
    const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
    if (!fs.existsSync(jsonFile)) {
      console.log(`  Warning: File not found: ${jsonFile}`);
      continue;
    }

    console.log(`  Cleaning LaTeX in ${path.basename(jsonFile)}...`);
    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

    for (let q of questions) {
      q.question = cleanLatex(q.question);
      if (q.options) {
        for (let opt of q.options) {
          opt.text = cleanLatex(opt.text);
        }
      }
      if (q.explanation) {
        q.explanation = cleanLatex(q.explanation);
      }
      if (q.direction) {
        q.direction = cleanLatex(q.direction);
      }
    }

    // Save cleaned file back to disk
    fs.writeFileSync(jsonFile, JSON.stringify(questions, null, 2), "utf8");
    console.log(`    Successfully saved clean JSON to disk.`);
  }

  console.log("\nConnecting to MongoDB for database re-seeding...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  console.log("Purging old IBPS PO Prelims questions from database first...");
  const deleteResult = await Question.deleteMany({ course: "ibps_po_prelims" });
  console.log(`Deleted ${deleteResult.deletedCount} old questions.`);

  console.log("Re-seeding clean mathematical questions to MongoDB...");
  for (let i = 1; i <= 10; i++) {
    const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
    if (!fs.existsSync(jsonFile)) continue;

    console.log(`  Seeding ${path.basename(jsonFile)}...`);
    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const operations = [];

    for (let q of questions) {
      const qId = q.id;
      const subject = q.subject || "English Language";
      
      const uniqueId = `IBPSPOPRELIMS_TEST${i}_${subject.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_Q${qId}`;

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
        course: "ibps_po_prelims",
        exam_type: "IBPS PO Prelims",
        sub_type: `IBPS PO Prelims - Test ${i}`,
        test_title: `IBPS PO Prelims - Test ${i}`,
        test_id: `ibps_po_prelims_test${i}`,
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
        status: "approved"
      };

      operations.push({
        updateOne: {
          filter: { unique_id: uniqueId },
          update: { $set: qDoc },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      const result = await Question.bulkWrite(operations);
      console.log(`    Successfully seeded ${result.upsertedCount + result.modifiedCount} clean questions for Test ${i}.`);
    }
  }

  await mongoose.disconnect();
  console.log("\n=== LaTeX cleanup, disk rewrite, and DB re-seeding complete! ===");
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
});
