const axios = require("../backend/node_modules/axios");

async function run() {
  const url = "https://hi-hello-production.up.railway.app/api/debug-env";
  console.log(`Calling live debug endpoint: ${url}...`);
  try {
    const res = await axios.get(url);
    console.log("\nLive Production Environment Details:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Live API Call Failed:", err.response ? err.response.data : err.message);
  }
}

run();
