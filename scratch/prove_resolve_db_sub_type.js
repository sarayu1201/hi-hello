const fs = require('fs');
const path = require('path');

function verify() {
  const serverJsPath = path.join(__dirname, '..', 'backend', 'server.js');
  const content = fs.readFileSync(serverJsPath, 'utf8');
  
  // Extract resolveDbSubType function
  const startIdx = content.indexOf('const resolveDbSubType');
  if (startIdx === -1) {
    console.log("Error: Could not find resolveDbSubType in server.js");
    return;
  }
  
  // Find closing brace of the function block
  let braces = 0;
  let endIdx = -1;
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') {
      braces++;
    } else if (content[i] === '}') {
      braces--;
      if (braces === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  
  if (endIdx === -1) {
    console.log("Error: Could not trace closing brace of resolveDbSubType");
    return;
  }
  
  const funcCode = content.substring(startIdx, endIdx);
  
  // Safely evaluate the function in node
  const sandbox = {};
  eval(funcCode + '; sandbox.resolveDbSubType = resolveDbSubType;');
  
  const resolve = sandbox.resolveDbSubType;
  
  console.log("=== PROVING RESOLVED TEST NUMBERS (1 to 10) ===");
  for (let i = 1; i <= 10; i++) {
    const testId = `sbi_clerk_prelims_test${i}`;
    const subType = `SBI Clerk Prelims - Test ${i}`;
    
    const resultFromId = resolve(testId, null, "Banking");
    const resultFromSubType = resolve(null, subType, "Banking");
    
    console.log(`Test ${i}:`);
    console.log(`  Query with test_id='${testId}'       => resolved to: "${resultFromId}"`);
    console.log(`  Query with sub_type='${subType}' => resolved to: "${resultFromSubType}"`);
  }
  console.log("================================================");
}

verify();
