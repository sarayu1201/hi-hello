const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const sample = await Question.findOne({ course: "sbi_clerk_prelims" });
  if (sample) {
    console.log("Found sample question!");
    console.log("options:", JSON.stringify(sample.options, null, 2));
    console.log("typeof options[0]:", typeof sample.options[0]);
  } else {
    console.log("No sample question found with course sbi_clerk_prelims");
    
    // Check any random question
    const any = await Question.findOne({});
    if (any) {
      console.log("Found general sample question!");
      console.log("course:", any.course);
      console.log("options:", JSON.stringify(any.options, null, 2));
      console.log("typeof options[0]:", typeof any.options[0]);
    }
  }

  await mongoose.disconnect();
}

run().catch(err => console.error("Error:", err));
