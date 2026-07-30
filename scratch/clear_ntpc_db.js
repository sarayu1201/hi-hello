const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  console.log("Deleting all RRB NTPC questions from the database...");
  const result = await Question.deleteMany({
    course: { $in: ["RRB NTPC CBT 1", "RRB NTPC CBT 2"] }
  });
  console.log(`Successfully deleted ${result.deletedCount} old NTPC questions!`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
});
