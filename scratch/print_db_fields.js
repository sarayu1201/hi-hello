const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const q = await Question.findOne({ source_file: "ssc_chsl_tier1_paper1.json" });
  if (q) {
    console.log("Found question in DB:");
    console.log(JSON.stringify(q.toObject(), null, 2));
  } else {
    console.log("No question found with source_file ssc_chsl_tier1_paper1.json");
  }
  await mongoose.disconnect();
}

run().catch(console.error);
