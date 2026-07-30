const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  console.log("Connecting to MongoDB...");
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const adminDb = conn.connection.db.admin();
  const dbsInfo = await adminDb.listDatabases();
  console.log("\nDatabases in Cluster:");
  for (let db of dbsInfo.databases) {
    console.log(`  - Name: ${db.name}, Size: ${db.sizeOnDisk} bytes`);
    
    // Connect to this database to list collections and count questions
    const dbInstance = conn.connection.client.db(db.name);
    const collections = await dbInstance.listCollections().toArray();
    console.log(`    Collections: [${collections.map(c => c.name).join(", ")}]`);
    
    if (collections.some(c => c.name === "questions")) {
      const qCount = await dbInstance.collection("questions").countDocuments({});
      const ibpsCount = await dbInstance.collection("questions").countDocuments({
        course: "ibps_po_prelims"
      });
      console.log(`    Total Questions: ${qCount}, ibps_po_prelims questions: ${ibpsCount}`);
    }
  }

  await mongoose.disconnect();
}

run().catch(err => console.error("Error:", err));
