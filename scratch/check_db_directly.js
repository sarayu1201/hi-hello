const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.client.db("kr_academy");
  
  // List all collections
  const cols = await db.listCollections().toArray();
  console.log("\nCollections in kr_academy:", cols.map(c => c.name));

  // Find inside questions
  const questionsCol = db.collection("questions");
  
  // Count by regex unique_id
  const totalRegex = await questionsCol.countDocuments({
    unique_id: /IBPSPOPRELIMS_TEST/
  });
  console.log(`\nQuestions in 'questions' matching /IBPSPOPRELIMS_TEST/: ${totalRegex}`);

  // Count by course
  const courseCounts = {};
  const allCourses = await questionsCol.distinct("course");
  for (let c of allCourses) {
    const cnt = await questionsCol.countDocuments({ course: c });
    courseCounts[c] = cnt;
  }
  console.log("\nCourse Breakdown in 'questions' collection:", courseCounts);

  // Print first question matching regex
  const firstMatch = await questionsCol.findOne({ unique_id: /IBPSPOPRELIMS_TEST1/ });
  if (firstMatch) {
    console.log("\nFound a match under /IBPSPOPRELIMS_TEST1/:");
    console.log(JSON.stringify({
      unique_id: firstMatch.unique_id,
      course: firstMatch.course,
      question: firstMatch.question,
      options: firstMatch.options
    }, null, 2));
  } else {
    console.log("\nNo match found under /IBPSPOPRELIMS_TEST1/.");
  }

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
