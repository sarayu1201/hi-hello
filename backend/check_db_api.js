const mongoose = require("mongoose");
const { Question } = require("./models"); // Import model from models.js

const mongo_uri = "mongodb+srv://allampallivinaya_db_user:sarayu%40akhil2509@cluster0.l1t116x.mongodb.net/kr_academy?appName=Cluster0";

mongoose.connect(mongo_uri).then(async () => {
  console.log("Connected to MongoDB!");

  const exam_type = "SSC";
  const sub_type = "SSC CGL Prelims - Test 1";

  let filter = {
    is_mock_eligible: true,
    status: { $ne: "needs_review" },
    source_file: { $ne: null, $exists: true }
  };
  filter.exam_type = exam_type;
  filter.$or = [
    { sub_type: sub_type },
    { paper_name: sub_type }
  ];

  let questions = await Question.find(filter).lean();
  console.log(`Fetched ${questions.length} questions.`);

  if (questions.length > 0) {
    const sections = {};
    for (const q of questions) {
      const sec = q.section || "General";
      if (!sections[sec]) {
        sections[sec] = [];
      }
      sections[sec].push(q);
    }
    console.log("Sections grouped:", Object.keys(sections));

    for (const sec in sections) {
      console.log(`Section: ${sec}, Questions count: ${sections[sec].length}`);
      const q = sections[sec][0];
      console.log(`  unique_id: ${q.unique_id}`);
      console.log(`  section: ${q.section}`);
      console.log(`  subject: ${q.subject}`);
      console.log(`  question: ${q.question.substring(0, 60)}`);
      console.log(`  question_image: ${q.question_image}`);
      console.log(`  option_images: ${JSON.stringify(q.option_images)}`);
    }
  }

  mongoose.connection.close();
}).catch(err => {
  console.error("Error:", err);
});
