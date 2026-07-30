const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const col = mongoose.connection.client.db("kr_academy").collection("questions");

  const queryAll = {
    course: { $in: ["ibps_po_prelims", "IBPS PO Prelims", "rrb_po", "IBPS RRB PO", "ibps_rrb_po", "IBPS RRB PO Prelims"] }
  };
  const countAll = await col.countDocuments(queryAll);
  console.log(`\nQuestions matching our course list: ${countAll}`);

  const distinctCourses = await col.distinct("course");
  console.log("All distinct course names currently in DB:", distinctCourses);

  for (let c of distinctCourses) {
    const cnt = await col.countDocuments({ course: c });
    console.log(`  - "${c}": ${cnt} questions`);
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
