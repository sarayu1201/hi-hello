const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  // Replicate the exact $or query parameters used by server.js
  const exam_type = "IBPS PO Prelims";
  const sub_type = "IBPS PO Prelims - Test 1";
  const test_id = "ibps_po_prelims_test1";

  const resolvedCourseNames = ["IBPS PO Prelims", "ibps po prelims", "ibps_po_prelims"];
  const resolvedSubTypes = ["IBPS PO Prelims - Test 1", "ibps_po_prelims_test1"];

  const filter = {
    is_mock_eligible: true,
    status: { $ne: "needs_review" },
    source_file: { $ne: null, $exists: true }
  };

  const query = {
    $or: [
      { test_id: { $in: resolvedSubTypes } },
      { test_title: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, test_title: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, sub_type: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, test_id: { $in: resolvedSubTypes } },
      filter
    ]
  };

  const list = await col.find(query).sort({ display_question_number: 1, question_number: 1, id: 1 }).toArray();
  console.log(`\nQuery returned ${list.length} questions.`);

  const matchQ1 = list.find(q => q.display_question_number === 1 || q.question_number === 1 || q.id === 1);
  if (matchQ1) {
    console.log("\nMatching Question 1 Details:");
    console.log(`  unique_id: ${matchQ1.unique_id}`);
    console.log(`  course: ${matchQ1.course}`);
    console.log(`  sub_type: ${matchQ1.sub_type}`);
    console.log(`  test_id: ${matchQ1.test_id}`);
    console.log(`  options:`, matchQ1.options);
  } else {
    console.log("\nNo Question 1 found in query results.");
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
