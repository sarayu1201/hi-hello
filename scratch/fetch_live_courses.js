const axios = require("../backend/node_modules/axios");

async function run() {
  const url = "https://hi-hello-production.up.railway.app/api/courses";
  console.log(`Calling live courses API: ${url}...`);
  try {
    const res = await axios.get(url);
    const courses = res.data.courses || res.data || [];
    console.log(`\nSuccess! Total courses returned: ${courses.length}`);
    courses.forEach(c => {
      const title = c.title || "";
      const courseId = c.courseId || c.id || "";
      if (title.toUpperCase().includes("PO") || courseId.toUpperCase().includes("PO")) {
        console.log(`  - Title: "${title}", CourseId: "${courseId}", Category: "${c.category || ''}"`);
      }
    });
  } catch (err) {
    console.error("Live API Call Failed:", err.message);
  }
}

run();
