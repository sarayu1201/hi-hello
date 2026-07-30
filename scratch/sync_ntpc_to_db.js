const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const logFilePath = path.join(__dirname, "ntpc_sync.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "w" });

function log(msg) {
  console.log(msg);
  logStream.write(msg + "\n");
}

async function run() {
  log("Starting RRB NTPC CBT-1 & CBT-2 database seeding...");

  log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  log("Connected to MongoDB successfully!");

  const folders = ["rrb_ntpc_cbt_1", "rrb_ntpc_cbt_2"];
  const rootDir = path.join(__dirname, "..", "QuestionBank", "json");

  for (let folder of folders) {
    const dirPath = path.join(rootDir, folder);
    if (!fs.existsSync(dirPath)) {
      log(`Error: Directory not found: ${dirPath}`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
    log(`\nIngesting folder: ${folder} (${files.length} files)...`);

    for (let file of files) {
      const filePath = path.join(dirPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      log(`  Processing ${file} (${data.length} questions)...`);

      for (let q of data) {
        const qId = q.id || q.question_number;
        const subjectClean = q.subject || "General Awareness";
        const courseClean = q.course || (folder === "rrb_ntpc_cbt_1" ? "RRB NTPC CBT 1" : "RRB NTPC CBT 2");
        const subTypeClean = q.sub_type || q.test_title || `${courseClean} - Test`;

        // Generate unique_id
        const uniqueIdClean = `${courseClean.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_${subTypeClean.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_${subjectClean.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_Q${qId}`;

        // Map options
        const mappedOptions = q.options.map(opt => typeof opt === "string" ? opt : (opt.text || ""));
        const mappedOptImages = q.options.map(opt => typeof opt === "string" ? "" : (opt.image || ""));

        const updateData = {
          question: q.question,
          options: mappedOptions,
          correct_option: q.correctAnswer || q.correct_option,
          correct_answer: q.correctAnswer || q.correct_answer,
          explanation: q.explanation || "",
          question_image: q.questionImage || q.question_image || "",
          option_images: mappedOptImages,
          course: courseClean,
          exam_type: "RRB",
          sub_type: subTypeClean,
          test_id: q.test_id || "",
          test_title: q.test_title || subTypeClean,
          paper_name: q.test_title || subTypeClean,
          subject: subjectClean,
          chapter: q.topic || "",
          topic: q.topic || "",
          difficulty: q.difficulty || "Medium",
          category: "RRB & Railways",
          section: subjectClean,
          q: q.question,
          correct_letter: q.correctAnswer || q.correct_option,
          status: "ok",
          is_mock_eligible: true,
          source_file: file,
          display_question_number: qId,
          updated_at: new Date()
        };

        await Question.findOneAndUpdate(
          { unique_id: uniqueIdClean },
          { $set: updateData },
          { new: true, upsert: true }
        );
      }
      log(`    Successfully upserted questions for ${file}.`);
    }
  }

  await mongoose.disconnect();
  log("\nSeeding complete!");
  logStream.end();
}

run().catch(err => {
  log(`FATAL ERROR: ${err}`);
  logStream.end();
});
