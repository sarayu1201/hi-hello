const queryStr = "ssc_chsl_prelims_test1";
const numberMatch = queryStr.match(/(?:mock|test|paper|cbt)?\s*_?(\d+)\b/i);
console.log("numberMatch:", numberMatch);
if (numberMatch) {
  console.log("Captured number:", numberMatch[1]);
}
const normalized = queryStr.replace(/[^a-z0-9]/g, "");
console.log("normalized:", normalized);
console.log("includes sschsl:", normalized.includes("sschsl"));
console.log("includes schsl:", normalized.includes("schsl"));
