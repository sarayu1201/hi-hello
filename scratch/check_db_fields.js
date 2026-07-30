const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  console.log("\nFetching a sample SBI Clerk Prelims question...");
  const sbiQ = await Question.findOne({ course: /sbi/i }).lean();
  if (sbiQ) {
    console.log("Keys in DB document:", Object.keys(sbiQ));
    console.log("Document structure:", JSON.stringify(sbiQ, null, 2));
  } else {
    console.log("No SBI Clerk questions found.");
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
