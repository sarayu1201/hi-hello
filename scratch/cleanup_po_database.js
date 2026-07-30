const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Course, Question } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  // 1. Delete course entries
  console.log("Deleting old courses...");
  const deleteCoursesResult = await Course.deleteMany({
    title: { $in: ["IBPS PO", "IBPS RRB PO"] }
  });
  console.log(`Deleted ${deleteCoursesResult.deletedCount} old course entries.`);

  // 2. Delete associated questions
  console.log("Deleting old questions...");
  const deleteQuestionsResult = await Question.deleteMany({
    course: { $in: ["ibps_po_prelims", "IBPS PO Prelims", "rrb_po", "IBPS RRB PO", "ibps_rrb_po", "IBPS RRB PO Prelims"] }
  });
  console.log(`Deleted ${deleteQuestionsResult.deletedCount} old questions.`);

  // 3. Insert new IBPS PO Prelims course
  console.log("Inserting new IBPS PO Prelims course...");
  const newCourse = await Course.findOneAndUpdate(
    { title: "IBPS PO Prelims" },
    { title: "IBPS PO Prelims", category: "Bank & Insurance" },
    { upsert: true, new: true }
  );
  console.log(`Successfully created/updated course: ${newCourse.title} (ID: ${newCourse._id})`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
});
