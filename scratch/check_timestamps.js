const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  const q = await col.findOne({ course: "IBPS PO Prelims" });
  if (q) {
    console.log("\nSample Question details:");
    console.log(`  ID: ${q.unique_id}`);
    console.log(`  Course: ${q.course}`);
    console.log(`  Created At: ${q.created_at}`);
    console.log(`  Updated At: ${q.updated_at}`);
    console.log(`  Option E: "${q.options ? q.options[4] : 'none'}"`);
  } else {
    console.log("\nNo questions found under 'IBPS PO Prelims'.");
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
