const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  const col = db.collection("questions");

  const countCap = await col.countDocuments({ course: "IBPS PO Prelims" });
  console.log(`Count of course='IBPS PO Prelims': ${countCap}`);

  const countLower = await col.countDocuments({ course: "ibps_po_prelims" });
  console.log(`Count of course='ibps_po_prelims': ${countLower}`);

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
