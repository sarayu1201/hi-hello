const fs = require("fs");
const path = require("path");
const pdf = require("../backend/node_modules/pdf-parse");

const pdfDir = path.join(__dirname, "..", "sbi po questions");

async function checkPdfs() {
  const files = fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith(".pdf"));

  for (let file of files) {
    const filePath = path.join(pdfDir, file);
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const parsed = await pdf(dataBuffer);
      console.log(`PDF: ${file}`);
      console.log(`  Extracted characters: ${parsed.text.length}`);
      console.log(`  First 100 chars: "${parsed.text.substring(0, 100).replace(/\s+/g, ' ')}"`);
    } catch (err) {
      console.log(`PDF: ${file} -> FAILED: ${err.message}`);
    }
  }
}

checkPdfs().catch(err => console.error(err));
