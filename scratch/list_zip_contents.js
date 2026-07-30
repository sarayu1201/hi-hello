const { execSync } = require("child_process");

function run() {
  console.log("Listing contents of C:\\Users\\LENOVO\\Downloads\\ibps clerk.zip using PowerShell...");
  try {
    const cmd = `powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem') ; [System.IO.Compression.ZipFile]::OpenRead('C:\\Users\\LENOVO\\Downloads\\ibps clerk.zip').Entries | Select-Object -Property FullName, Length"`;
    const output = execSync(cmd, { encoding: "utf8" });
    console.log(output);
  } catch (err) {
    console.error("Error listing zip contents:", err.message);
  }
}

run();
