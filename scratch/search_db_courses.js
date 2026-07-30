const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Course } = require("../backend/models");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const courses = await Course.find({});
  console.log(`Found ${courses.length} courses in database:`);
  courses.forEach(c => {
    console.log(`  - ID: ${c._id || c.id}, Title: "${c.title}", Category: "${c.category}"`);
  });

  await mongoose.disconnect();
}

run().catch(err => console.error("Error:", err));
