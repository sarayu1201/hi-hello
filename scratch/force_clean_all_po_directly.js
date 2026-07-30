const mongoose = require("../backend/node_modules/mongoose");
const fs = require("fs");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  console.log("\n1. Purging all variations of PO questions directly from the 'questions' collection...");
  const delResult = await col.deleteMany({
    course: { $in: ["ibps_po_prelims", "IBPS PO Prelims", "rrb_po", "IBPS RRB PO", "ibps_rrb_po", "IBPS RRB PO Prelims"] }
  });
  console.log(`Deleted ${delResult.deletedCount} questions.`);

  console.log("\n2. Re-seeding clean mathematical questions directly...");
  for (let i = 1; i <= 10; i++) {
    const jsonFile = path.join(jsonDir, `ibpspo_test_${i}.json`);
    if (!fs.existsSync(jsonFile)) continue;

    console.log(`  Processing ${path.basename(jsonFile)}...`);
    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const docs = [];

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
        status: "approved",
        created_at: new Date(),
        updated_at: new Date()
      };

      docs.push(qDoc);
    }

    if (docs.length > 0) {
      const insertResult = await col.insertMany(docs);
      console.log(`    Successfully inserted ${insertResult.insertedCount} clean questions for Test ${i}.`);
    }
  }

  await mongoose.disconnect();
  console.log("\n=== Direct DB Purge and Re-seed Complete! ===");
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
});
