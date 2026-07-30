const { execSync } = require("child_process");
console.log("Restoring backend/server.js...");
try {
  execSync("git checkout backend/server.js", { cwd: __dirname + "/.." });
  console.log("Revert complete!");
} catch (e) {
  console.error("Revert failed:", e.message);
}
