const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Course, Question } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const coursesCol = db.collection("courses");
  const questionsCol = db.collection("questions");

  // 1. Delete the RRB PO course entries
  console.log("\nDeleting RRB PO course entries...");
  const courseDel = await coursesCol.deleteMany({
    title: { $in: ["IBPS RRB PO Prelims", "IBPS RRB PO", "rrb_po"] }
  });
  console.log(`Deleted ${courseDel.deletedCount} course entries.`);

  // 2. Delete any matching questions
  console.log("Deleting RRB PO questions...");
  const questionDel = await questionsCol.deleteMany({
    course: { $in: ["rrb_po", "IBPS RRB PO", "IBPS RRB PO Prelims"] }
  });
  console.log(`Deleted ${questionDel.deletedCount} questions.`);

  await mongoose.disconnect();
  console.log("\n=== Deletion Complete ===");
}

run().catch(err => console.error(err));
