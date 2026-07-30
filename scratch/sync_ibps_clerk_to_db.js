const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  console.log("=== Starting clean seed for IBPS Clerk Prelims ===");

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  console.log("\n1. Wiping all old IBPS Clerk Prelims questions...");
  const deleteRes = await col.deleteMany({
    $or: [
      { course: "IBPS Clerk Prelims" },
      { sub_type: /IBPS Clerk/i },
      { unique_id: /IBPSCLERK/i },
      { test_id: /ibps_clerk/i }
    ]
  });
  console.log(`Deleted ${deleteRes.deletedCount} old documents.`);

  console.log("\n2. Seeding questions from local JSON files...");
  const dirPath = path.join(__dirname, "..", "QuestionBank", "json", "ibps_clerk_prelims");
  if (!fs.existsSync(dirPath)) {
    console.error(`Error: Directory not found: ${dirPath}`);
    await mongoose.disconnect();
    return;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
  console.log(`Found ${files.length} JSON files in ${dirPath}.`);

  for (let file of files) {
    const filePath = path.join(dirPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`  Processing ${file} (${data.length} questions)...`);
    const docs = [];

    // Extract test number from filename (e.g., ibps_clerk_prelims_test2.json -> 2)
    const numMatch = file.match(/_test(\d+)\.json$/i);
    const mockNum = numMatch ? parseInt(numMatch[1]) : 1;

    const courseClean = "IBPS Clerk Prelims";
    const subTypeClean = `IBPS Clerk Prelims - Test ${mockNum}`;
    const testIdClean = `ibps_clerk_prelims_test${mockNum}`;

    for (let q of data) {
      const qId = q.id || q.question_number || q.display_question_number;
      const subjectClean = q.subject || "English Language";

      // Generate unique_id
      const uniqueIdClean = `IBPSCLERKPRELIMS_${testIdClean.toUpperCase()}_2020_${subjectClean.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}_Q${qId}`;

      // Map options
      const mappedOptions = q.options.map(opt => typeof opt === "string" ? opt : (opt.text || ""));
      const mappedOptImages = q.options.map(opt => typeof opt === "string" ? "" : (opt.image || ""));

      const qDoc = {
        unique_id: uniqueIdClean,
        display_question_number: qId,
        course: courseClean,
        exam_type: "Banking",
        sub_type: subTypeClean,
        test_title: subTypeClean,
        test_id: testIdClean,
        source_file: file,
        subject: subjectClean,
        chapter: q.topic || "",
        topic: q.topic || "",
        difficulty: q.difficulty || "Medium",
        question_type: "Multiple Choice",
        question: q.question || q.q || "",
        options: mappedOptions,
        correct_option: q.correctAnswer || q.correct_option || q.correct_letter || "A",
        correct_answer: q.correctAnswer || q.correct_answer || "A",
        correct_letter: q.correctAnswer || q.correct_option || q.correct_letter || "A",
        explanation: q.explanation || "",
        question_image: q.questionImage || q.question_image || "",
        option_images: mappedOptImages,
        direction: q.direction || "",
        raw_direction: q.direction || "",
        raw_question: q.question || q.q || "",
        raw_explanation: q.explanation || "",
        raw_options: mappedOptions,
        is_mock_eligible: true,
        category: "Bank & Insurance",
        section: subjectClean,
        q: q.question || q.q || "",
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
      console.log(`    Successfully seeded ${res.insertedCount} questions for ${file}.`);
    }
  }

  await mongoose.disconnect();
  console.log("\n=== Seeding complete! ===");
}

run().catch(err => console.error(err));
