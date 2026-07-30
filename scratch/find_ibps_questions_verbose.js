const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  console.log("URI:", process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  // Query a sample to see what is in there
  const sample = await col.findOne({});
  console.log("Sample doc keys:", Object.keys(sample));
  console.log("Sample doc course:", sample.course);

  // Count where course is like ibps
  const courses = await col.distinct("course");
  console.log("Distinct courses in DB:", courses);

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
