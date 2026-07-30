const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  console.log("\nFetching a sample RRB NTPC question...");
  const ntpcQ = await Question.findOne({ course: /ntpc/i }).lean();
  if (ntpcQ) {
    console.log("Keys in NTPC DB document:", Object.keys(ntpcQ));
    console.log("Document structure:", JSON.stringify(ntpcQ, null, 2));
  } else {
    console.log("No NTPC questions found.");
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
