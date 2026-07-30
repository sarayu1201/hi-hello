const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  console.log("=== Starting clean seed for RRB NTPC CBT-1 & CBT-2 ===");

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  // Wiping out any and all NTPC entries to prevent duplicate or stale questions
  console.log("\n1. Wiping all questions matching NTPC...");
  const deleteRes1 = await col.deleteMany({
    $or: [
      { course: /NTPC/i },
      { sub_type: /NTPC/i },
      { unique_id: /NTPC/i },
      { test_id: /ntpc/i }
    ]
  });
  console.log(`Deleted ${deleteRes1.deletedCount} old NTPC documents.`);

  // Load and seed new clean json files
  const folders = ["rrb_ntpc_cbt_1", "rrb_ntpc_cbt_2"];
  const rootDir = path.join(__dirname, "..", "QuestionBank", "json");

  for (let folder of folders) {
    const dirPath = path.join(rootDir, folder);
    if (!fs.existsSync(dirPath)) {
      console.error(`Error: Directory not found: ${dirPath}`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
    console.log(`\nProcessing folder: ${folder} (${files.length} files)...`);

    for (let file of files) {
      const filePath = path.join(dirPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log(`  Processing ${file} (${data.length} questions)...`);
      const docs = [];

      for (let q of data) {
        const qId = q.id || q.question_number;
        const subjectClean = q.subject || "General Awareness";
        const courseClean = q.course || (folder === "rrb_ntpc_cbt_1" ? "RRB NTPC CBT 1" : "RRB NTPC CBT 2");
        const subTypeClean = q.sub_type || q.test_title || `${courseClean} - Test`;

        // Generate clean unique_id
        const uniqueIdClean = `${courseClean.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_${subTypeClean.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_${subjectClean.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_Q${qId}`;

        // Map options
        const mappedOptions = q.options.map(opt => typeof opt === "string" ? opt : (opt.text || ""));
        const mappedOptImages = q.options.map(opt => typeof opt === "string" ? "" : (opt.image || ""));

        const qDoc = {
          unique_id: uniqueIdClean,
          display_question_number: qId,
          course: courseClean,
          exam_type: "RRB",
          sub_type: subTypeClean,
          test_title: subTypeClean,
          test_id: q.test_id || "",
          source_file: file,
          subject: subjectClean,
          chapter: q.topic || "",
          topic: q.topic || "",
          difficulty: q.difficulty || "Medium",
          question_type: "Multiple Choice",
          question: q.question,
          options: mappedOptions,
          correct_option: q.correctAnswer || q.correct_option,
          correct_answer: q.correctAnswer || q.correct_answer,
          correct_letter: q.correctAnswer || q.correct_option,
          explanation: q.explanation || "",
          question_image: q.questionImage || q.question_image || "",
          option_images: mappedOptImages,
          direction: q.direction || "",
          raw_direction: q.direction || "",
          raw_question: q.question,
          raw_explanation: q.explanation || "",
          raw_options: mappedOptions,
          is_mock_eligible: true,
          category: "RRB & Railways",
          section: subjectClean,
          q: q.question,
          correct: q.correctAnswer ? (q.correctAnswer.toUpperCase().charCodeAt(0) - 65) : 0,
          question_number: qId,
          status: "ok",
          created_at: new Date(),
          updated_at: new Date()
        };
        docs.push(qDoc);
      }

      if (docs.length > 0) {
        const res = await col.insertMany(docs);
        console.log(`    Seeded ${res.insertedCount} questions for ${file}.`);
      }
    }
  }

  await mongoose.disconnect();
  console.log("\n=== Clean seed complete! ===");
}

run().catch(err => console.error(err));
