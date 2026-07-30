const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  // Find all questions with the exact same text
  const list = await col.find({
    question: /to growth\. thus depressing the value of dollar/i
  }).toArray();

  console.log(`\nFound ${list.length} matches in the database:`);
  list.forEach((q, idx) => {
    console.log(`\n[Match ${idx + 1}]`);
    console.log(`  unique_id: ${q.unique_id}`);
    console.log(`  course: ${q.course}`);
    console.log(`  exam_type: ${q.exam_type}`);
    console.log(`  sub_type: ${q.sub_type}`);
    console.log(`  test_id: ${q.test_id}`);
    console.log(`  display_question_number: ${q.display_question_number}`);
    console.log(`  Option E: "${q.options ? q.options[4] : 'none'}"`);
    console.log(`  Created At: ${q.created_at}`);
  });

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
