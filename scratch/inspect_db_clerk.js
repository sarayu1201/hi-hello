const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  console.log("\nSearching for any document matching course /clerk/i:");
  const doc = await col.findOne({ course: /clerk/i });
  console.log("Found doc:", doc);

  console.log("\nDistinct courses matching /clerk/i:");
  const distinctCourses = await col.distinct("course", { course: /clerk/i });
  console.log(distinctCourses);

  console.log("\nDistinct sub_types matching /clerk/i:");
  const distinctSubTypes = await col.distinct("sub_type", { course: /clerk/i });
  console.log(distinctSubTypes);

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
