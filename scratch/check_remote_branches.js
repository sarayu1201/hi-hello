const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    return null;
  }
}

console.log("Listing all remote branches on GitHub...");
const out = runCmd("git ls-remote --heads origin");
if (out) {
  console.log(out);
} else {
  console.log("Failed to query remote branches.");
}
