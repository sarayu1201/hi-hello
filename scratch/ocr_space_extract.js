const fs = require("fs");
const path = require("path");
const axios = require("../backend/node_modules/axios");

const imageFile = path.join(__dirname, "..", "scratch", "empty_options_render", "test_2_q_31.png");

async function run() {
  if (!fs.existsSync(imageFile)) {
    console.error("Image file not found:", imageFile);
    return;
  }

  console.log("Reading image and converting to base64...");
  const base64Image = fs.readFileSync(imageFile, { encoding: "base64" });
  const dataUrl = `data:image/png;base64,${base64Image}`;

  console.log("Sending POST request to OCR.space API...");
  try {
    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      new URLSearchParams({
        apikey: "helloworld",
        base64Image: dataUrl,
        language: "eng",
        isOverlayRequired: "false",
        OCREngine: "2" // Engine 2 is better for numbers and math
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const data = response.data;
    if (data.IsErroredOnProcessing) {
      console.error("OCR API Error:", data.ErrorMessage);
    } else {
      console.log("\n=== Extracted OCR Text ===");
      const text = data.ParsedResults && data.ParsedResults[0] ? data.ParsedResults[0].ParsedText : "";
      console.log(text);
    }
  } catch (err) {
    console.error("Request failed:", err.message);
  }
}

run();
