const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

const jsonDir = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims");

// Direct corrections list
const corrections = [
  {
    test: 1,
    id: 55,
    question: "If marked price of article P and S is same, then selling price of article P is what percentage more or less than selling price of article S?",
    options: ["10%", "25%", "20%", "33 1/3%", "30%"]
  },
  {
    test: 1,
    id: 57,
    question: "Perimeter of square is 48 cm and length of a rectangle is equal to side of square and breadth of rectangle is 4 cm less than length of the rectangle. Find the area of rectangle.",
    options: ["58 cm²", "96 cm²", "105 cm²", "88 cm²", "72 cm²"]
  },
  {
    test: 1,
    id: 60,
    question: "Speed of boat in still water is 60% more than speed of current and total time takes by boat to cover certain distance going downstream and upstream is 32 hours. Find the time taken by boat to cover same distance in still water.",
    options: ["8 7/8 hours", "9 5/8 hours", "9 1/4 hours", "7 1/2 hours", "9 3/4 hours"]
  },
  {
    test: 2,
    id: 31,
    question: "Number of employee who are working from Home in company B and D together are what percentage more/less than number of employees working from Office in company C.",
    options: ["220/3%", "250/3%", "260/3%", "280/3%", "200/3%"]
  },
  {
    test: 2,
    id: 37,
    question: "Number of employees in R & D department is what percentage of number of employees in production department.",
    options: ["33 1/3%", "25%", "50%", "75%", "66 2/3%"]
  },
  {
    test: 2,
    id: 39,
    question: "Ratio of male to female in Management department is 3: 4. Find the number of females in Management department is what percentage more or less than total employee in HR.",
    options: ["12.5%", "14 2/7%", "18.5%", "20%", "10%"]
  },
  {
    test: 2,
    id: 41,
    question: "Wired mouse sold by X and Y together is what percentage more or less than wireless mouse sold by Y.",
    options: ["133 1/3%", "152 2/3%", "146 2/3%", "166 2/3%", "111 2/3%"]
  },
  {
    test: 4,
    id: 34,
    question: "Find the average number of patients recovered from the state Delhi, UP and Telangana.",
    options: ["7000/3", "7910/3", "7820/3", "7900/3", "7550/3"]
  },
  {
    test: 4,
    id: 46,
    question: "A can complete a piece of work in 8 days, A and B together can complete same work in 4.8 days and A, B and C together complete the work in 40/11 days. Find the time taken by A and C together to complete the work?",
    options: ["120/23 days", "12 days", "17.5 days", "120/29 days", "20 days"]
  },
  {
    test: 6,
    id: 60,
    question: "The perimeter of a rectangle is equal to the perimeter of a square whose area is 784 m². If the breadth of the rectangle is 40% of the length of the rectangle, then find the area of the rectangle?",
    options: ["640 m²", "540 m²", "940 m²", "840 m²", "720 m²"]
  },
  {
    test: 7,
    id: 50,
    question: "P takes 15 days more than Q to complete a piece a work while the efficiency of Q is 60% more than P. P, Q and R start working together and complete the work in 8 days. Find in how many days R alone can complete the work.",
    options: ["21.5 days", "17.5 days", "16 2/3 days", "17 1/7 days", "16.5 days"]
  }
];

async function run() {
  console.log("=== Applying Option and Question text corrections on disk ===");

  for (let corr of corrections) {
    const jsonFile = path.join(jsonDir, `ibpspo_test_${corr.test}.json`);
    if (!fs.existsSync(jsonFile)) continue;

    const questions = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    const q = questions.find(x => x.id === corr.id);
    if (q) {
      console.log(`  Updating Test ${corr.test} Q${corr.id}...`);
      q.question = corr.question;
      if (q.options) {
        q.options.forEach((opt, idx) => {
          if (corr.options[idx]) {
            opt.text = corr.options[idx];
          }
        });
      }
      fs.writeFileSync(jsonFile, JSON.stringify(questions, null, 2), "utf8");
    }
  }

  console.log("\nConnecting to MongoDB for database updates...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  console.log("\n1. Purging all existing 'IBPS PO Prelims' questions from DB...");
  const delUpper = await col.deleteMany({ course: "IBPS PO Prelims" });
  console.log(`Deleted ${delUpper.deletedCount} documents.`);

  console.log("\n2. Re-seeding corrected questions with source_file field...");
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
  console.log("\n=== Seeding and updates complete! ===");
}

run().catch(err => console.error(err));
