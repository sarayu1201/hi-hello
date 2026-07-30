const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("kr_academy");
    const col = db.collection("questions");
    
    console.log("Checking question counts in DB by test_id:");
    for (let i = 1; i <= 10; i++) {
      const testId = `ibps_clerk_prelims_test${i}`;
      const count = await col.countDocuments({ test_id: testId });
      console.log(`  - ${testId}: ${count} questions in DB.`);
    }
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
