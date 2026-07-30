const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

// Exact logic from server.js
const resolveDbSubType = (testId, subType, examType) => {
  const queryStr = String(testId || subType || "").toLowerCase().trim();
  
  if (
    (queryStr.includes("prelims - test") || queryStr.includes("mains - test") || queryStr.includes("ug - ")) &&
    !queryStr.includes("pattern module") &&
    !queryStr.includes("mock_shuffled") &&
    !queryStr.includes("shuffled")
  ) {
    return testId || subType;
  }
  
  let mockNumber = 1;
  let testMatch = queryStr.match(/(?:test|mock|paper)\s*_?(\d+)/i);
  if (testMatch) {
    mockNumber = parseInt(testMatch[1]);
  } else {
    let numberMatch = queryStr.match(/(?:mock|test|paper|cbt)?\s*_?(\d+)\b/i);
    mockNumber = numberMatch ? parseInt(numberMatch[1]) : 1;
  }
  
  const normalized = queryStr.replace(/[^a-z0-9]/g, "");
  
  if (normalized.includes("sbiclerk")) {
    return `SBI Clerk Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("sbipo")) {
    return `SBI PO Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("ibpspo")) {
    return `IBPS PO Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("ibpsclerk")) {
    return `IBPS Clerk Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("rrbclerk") || normalized.includes("ibpsrrbclerk")) {
    return `IBPS RRB Clerk Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("rrbpo") || normalized.includes("ibpsrrbpo")) {
    return `IBPS RRB PO Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("ssccgl") || normalized.includes("sccgl")) {
    return `SSC CGL Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("sscgd") || normalized.includes("scgd")) {
    return `SSC GD Constable Prelims - Test ${mockNumber}`;
  }
  if ((normalized.includes("sscchsl") || normalized.includes("sschsl")) && (normalized.includes("tier2") || normalized.includes("mains"))) {
    return `SSC CHSL Mains - Test ${mockNumber}`;
  }
  if (normalized.includes("sscchsl") || normalized.includes("sschsl") || normalized.includes("schsl")) {
    return `SSC CHSL Prelims - Test ${mockNumber}`;
  }
  if (normalized.includes("rrbntpccbt1")) {
    return `RRB NTPC CBT 1 - Test ${mockNumber}`;
  }
  if (normalized.includes("rrbntpccbt2")) {
    return `RRB NTPC CBT 2 - Test ${mockNumber}`;
  }
  
  return testId || subType;
};

const resolveDbCourse = (subType) => {
  if (!subType) return null;
  const lower = subType.toLowerCase();
  
  if (lower.includes("sbi clerk") || lower.includes("sbi_clerk")) {
    return "sbi_clerk_prelims";
  }
  if (lower.includes("sbi po") || lower.includes("sbi_po")) {
    return "sbi_po_prelims";
  }
  if (lower.includes("ibps po") || lower.includes("ibpspo")) {
    return "ibps_po_prelims";
  }
  if (lower.includes("ibps clerk") || lower.includes("ibps_clerk")) {
    return "ibps_clerk_prelims";
  }
  if (lower.includes("rrb clerk") || lower.includes("rrb_clerk")) {
    return "rrb_clerk";
  }
  if (lower.includes("rrb po") || lower.includes("rrb_po")) {
    return "rrb_po";
  }
  if (lower.includes("ssc cgl") || lower.includes("ssc_cgl")) {
    return "ssc_cgl_prelims";
  }
  if (lower.includes("ssc chsl") || lower.includes("ssc_chsl")) {
    if (lower.includes("mains") || lower.includes("tier2") || lower.includes("tier-2") || lower.includes("tier 2")) {
      return "ssc_chsl_tier2_papers";
    }
    return "ssc_chsl_tier1_papers";
  }
  if (lower.includes("ssc gd") || lower.includes("ssc_gd") || lower.includes("sc_gd") || lower.includes("sc gd")) {
    return "sc_gd";
  }
  if (lower.includes("rrb ntpc cbt 1") || lower.includes("rrb_ntpc_cbt_1") || lower.includes("rrb_ntpc_cbt1")) {
    return "RRB NTPC CBT 1";
  }
  if (lower.includes("rrb ntpc cbt 2") || lower.includes("rrb_ntpc_cbt_2") || lower.includes("rrb_ntpc_cbt2")) {
    return "RRB NTPC CBT 2";
  }
  return null;
};

async function testQuery(exam_type, test_id) {
  console.log(`\nTesting query for exam_type="${exam_type}", test_id="${test_id}"...`);
  
  let category = "RRB & Railways";
  let resolvedCourseNames = [exam_type];
  if (exam_type) {
    const courseLower = exam_type.toLowerCase();
    if (!resolvedCourseNames.includes(courseLower)) resolvedCourseNames.push(courseLower);
    const courseUnderscore = courseLower.replace(/\s+/g, "_");
    if (!resolvedCourseNames.includes(courseUnderscore)) resolvedCourseNames.push(courseUnderscore);
    const courseSpace = courseLower.replace(/_/g, " ");
    if (!resolvedCourseNames.includes(courseSpace)) resolvedCourseNames.push(courseSpace);
  }

  let resolvedSubTypes = [];
  const resolvedVal = resolveDbSubType(null, test_id, exam_type);
  console.log("  Resolved DB Sub-Type:", resolvedVal);
  if (resolvedVal) resolvedSubTypes.push(resolvedVal);
  if (!resolvedSubTypes.includes(test_id)) resolvedSubTypes.push(test_id);

  let filter = {
    is_mock_eligible: true,
    status: { $ne: "needs_review" },
    source_file: { $ne: null, $exists: true }
  };
  
  let resolvedCourse = resolveDbCourse(resolvedSubTypes[0]);
  console.log("  Resolved DB Course Name:", resolvedCourse);
  if (resolvedCourse) {
    filter.course = resolvedCourse;
  }

  filter.exam_type = "RRB";

  if (resolvedSubTypes.length > 0) {
    filter.$or = [
      { sub_type: { $in: resolvedSubTypes } },
      { paper_name: { $in: resolvedSubTypes } },
      { test_title: { $in: resolvedSubTypes } },
      { test_id: { $in: resolvedSubTypes } }
    ];
  }

  const orFilter = [
    { test_id: { $in: resolvedSubTypes } },
    { test_title: { $in: resolvedSubTypes } },
    { course: { $in: resolvedCourseNames }, test_title: { $in: resolvedSubTypes } },
    { course: { $in: resolvedCourseNames }, sub_type: { $in: resolvedSubTypes } },
    { course: { $in: resolvedCourseNames }, test_id: { $in: resolvedSubTypes } },
    filter
  ];

  console.log("  Executing Question.find...");
  const questions = await Question.find({ $or: orFilter }).lean();
  console.log(`  Found: ${questions.length} questions.`);
  if (questions.length > 0) {
    console.log(`  First Question:`);
    console.log(`    ID: ${questions[0].unique_id}`);
    console.log(`    Question: "${questions[0].question.substring(0, 100)}..."`);
    console.log(`    Subject: "${questions[0].subject}"`);
    console.log(`    Course: "${questions[0].course}"`);
    console.log(`    Sub-Type: "${questions[0].sub_type}"`);
    
    // Check subject counts
    const subjectCounts = {};
    for (let q of questions) {
      const s = q.subject || "Unknown";
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    }
    console.log("  Subject Counts:", subjectCounts);
  }
}

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  await testQuery("RRB NTPC CBT 1", "rrb_ntpc_cbt1_test1");
  await testQuery("RRB NTPC CBT 2", "rrb_ntpc_cbt2_test1");

  await mongoose.disconnect();
  console.log("Test finished.");
}

run().catch(err => {
  console.error("FATAL:", err);
});
