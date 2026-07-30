const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  console.log("\nSearching for unique course names in database:");
  const courses = await col.distinct("course");
  console.log("Courses:", courses);

  console.log("\nSearching for unique sub_type names in database:");
  const subTypes = await col.distinct("sub_type");
  console.log("Sub Types:", subTypes);

  console.log("\nSearching for any document matching course 'RRB NTPC CBT 1':");
  const doc1 = await col.findOne({ course: /NTPC/i });
  console.log("Found matching doc:", doc1);

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
