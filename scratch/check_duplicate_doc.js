const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const sample = await Question.findOne({
    course: "ibps_po_prelims",
    unique_id: { $not: /^IBPSPOPRELIMS_TEST/ }
  });
  if (sample) {
    console.log("Found duplicate document:");
    console.log(JSON.stringify(sample, null, 2));
  } else {
    console.log("No duplicate document found matching regex!");
  }

  await mongoose.disconnect();
}

run().catch(err => console.error("Error:", err));
