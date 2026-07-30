const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  console.log("Connecting to MongoDB via mongoose...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  // Count all ibps_po_prelims questions
  const total = await col.countDocuments({ course: "ibps_po_prelims" });
  console.log(`Total questions with course='ibps_po_prelims': ${total}`);

  // Count new questions
  const newCount = await col.countDocuments({
    course: "ibps_po_prelims",
    unique_id: /^IBPSPOPRELIMS_TEST/
  });
  console.log(`New clean questions (starting with IBPSPOPRELIMS_TEST): ${newCount}`);

  // Find duplicates
  const duplicates = await col.find({
    course: "ibps_po_prelims",
    unique_id: { $not: /^IBPSPOPRELIMS_TEST/ }
  }).toArray();
  console.log(`Old duplicate questions found: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log("Example duplicate unique_id:", duplicates[0].unique_id);
    console.log("Deleting all duplicate questions...");
    const delResult = await col.deleteMany({
      course: "ibps_po_prelims",
      unique_id: { $not: /^IBPSPOPRELIMS_TEST/ }
    });
    console.log(`Successfully deleted ${delResult.deletedCount} old duplicate questions!`);
  }

  await mongoose.disconnect();
}

run().catch(err => console.error("Error:", err));
