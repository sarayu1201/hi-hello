const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const resolvedSubTypes = ["IBPS PO Prelims - Test 5", "ibps_po_prelims_test5"];
  const resolvedCourseNames = ["IBPS PO Prelims", "ibps po prelims"];

  const query = {
    $or: [
      { test_id: { $in: resolvedSubTypes } },
      { test_title: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, test_title: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, sub_type: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, test_id: { $in: resolvedSubTypes } }
    ]
  };

  const questions = await Question.find(query).lean();
  console.log(`\nTotal questions matched: ${questions.length}`);

  const courseCounts = {};
  for (let q of questions) {
    courseCounts[q.course] = (courseCounts[q.course] || 0) + 1;
  }
  console.log("Course breakdown of matches:", courseCounts);

  if (questions.length > 100) {
    console.log("\nSample details of duplicate/non-ibps_po_prelims questions:");
    const extra = questions.filter(q => q.course !== "ibps_po_prelims");
    console.log(JSON.stringify(extra.slice(0, 5).map(q => ({
      unique_id: q.unique_id,
      course: q.course,
      exam_type: q.exam_type,
      test_id: q.test_id,
      test_title: q.test_title
    })), null, 2));
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
