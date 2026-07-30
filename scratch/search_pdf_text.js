const fs = require("fs");
const path = require("path");
const pdf = require("../backend/node_modules/pdf-parse");

const pdfDir = path.join(__dirname, "..", "sbi po questions");
const targetText = "working from Office";

async function scanPdfs() {
  console.log("Scanning PDFs for target text...\n");
  const files = fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith(".pdf"));

  for (let file of files) {
    const filePath = path.join(pdfDir, file);
    const dataBuffer = fs.readFileSync(filePath);
    
    try {
      const parsed = await pdf(dataBuffer);
      if (parsed.text.toLowerCase().includes(targetText.toLowerCase())) {
        console.log(`FOUND MATCH in: ${file}`);
        
        // Find the page/context around the match
        const lines = parsed.text.split("\n");
        const idx = lines.findIndex(l => l.toLowerCase().includes(targetText.toLowerCase()));
        if (idx !== -1) {
          console.log("\nContext lines:");
          const start = Math.max(0, idx - 5);
          const end = Math.min(lines.length - 1, idx + 10);
          for (let j = start; j <= end; j++) {
            console.log(`  Line ${j}: ${lines[j]}`);
          }
        }
        return; // Found it!
      }
    } catch (err) {
      // Skip errors
    }
  }
  console.log("No matching PDF found.");
}

scanPdfs().catch(err => console.error(err));
