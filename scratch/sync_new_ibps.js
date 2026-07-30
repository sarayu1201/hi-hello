const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const rootDir = path.join(__dirname, "..");
const srcJsonDir = rootDir;
const destJsonDir = path.join(rootDir, "QuestionBank", "json", "ibps_po_prelims");

// Ensure destination directories exist
if (!fs.existsSync(destJsonDir)) {
  fs.mkdirSync(destJsonDir, { recursive: true });
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  for (let file of files) {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  }
}

async function run() {
  console.log("1. Copying and renaming new JSON files to QuestionBank...");
  for (let i = 1; i <= 10; i++) {
    const srcFile = path.join(srcJsonDir, `ibpspo_prelims test_${i}.json`);
    const destFile = path.join(destJsonDir, `ibpspo_test_${i}.json`);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`  Copied: ${srcFile} -> ${destFile}`);
    } else {
      console.log(`  Warning: Source file not found: ${srcFile}`);
    }
  }

  console.log("\n2. Copying question images...");
  const srcImagesDir = path.join(rootDir, "sbi images");
  if (fs.existsSync(srcImagesDir)) {
    const destUploadsImages = path.join(rootDir, "backend", "uploads", "images");
    const destQuestionBankImages = path.join(rootDir, "QuestionBank", "images");

    for (let i = 1; i <= 10; i++) {
      const folderName = `ibps test ${i}`;
      const srcFolder = path.join(srcImagesDir, folderName);
      if (fs.existsSync(srcFolder)) {
        copyFolderRecursiveSync(srcFolder, path.join(destUploadsImages, folderName));
        copyFolderRecursiveSync(srcFolder, path.join(destQuestionBankImages, folderName));
        console.log(`  Copied image folder: ${folderName}`);
      }
    }
  } else {
    console.log("  No 'sbi images' folder found to copy.");
  }

  console.log("\n3. Connecting to MongoDB for seeding...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  console.log("\n4. Seeding new IBPS PO Prelims questions...");
  for (let i = 1; i <= 10; i++) {
    const jsonFile = path.join(destJsonDir, `ibpspo_test_${i}.json`);
    if (!fs.existsSync(jsonFile)) continue;

    console.log(`  Processing ${path.basename(jsonFile)}...`);
    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const operations = [];

    for (let q of questions) {
      const qId = q.id;
      const subject = q.subject || "English Language";
      
      const uniqueId = `IBPSPOPRELIMS_TEST${i}_${subject.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_Q${qId}`;

      const optionsFormatted = q.options.map(opt => opt.text);

      const isMockEligible = true;

      // Handle correct options
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
        is_mock_eligible: isMockEligible,
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
      console.log(`    Seeded ${result.upsertedCount + result.modifiedCount} questions for Test ${i}.`);
    }
  }

  await mongoose.disconnect();
  console.log("\nSyncing and database seeding complete!");
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
});
