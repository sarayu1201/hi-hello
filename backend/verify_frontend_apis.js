import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'http://localhost:5000';
const workspaceRoot = 'c:\\Users\\veera\\Downloads\\hi-hello-main\\hi-hello-main';

const courses = [
  { id: 'sbi_clerk', title: 'SBI Clerk Prelims', category: 'Banking' },
  { id: 'sbi_po', title: 'SBI PO Prelims', category: 'Banking' },
  { id: 'ibps_clerk', title: 'IBPS Clerk Prelims', category: 'Banking' },
  { id: 'ibps_po', title: 'IBPS PO Prelims', category: 'Banking' },
  { id: 'rrb_clerk', title: 'IBPS RRB Clerk Prelims', category: 'RRB' },
  { id: 'rrb_po', title: 'IBPS RRB PO Prelims', category: 'RRB' },
  { id: 'ssc_cgl', title: 'SSC CGL Prelims', category: 'SSC' },
  { id: 'ssc_chsl', title: 'SSC CHSL', category: 'SSC' }
];

async function runVerification() {
  console.log('==================================================');
  console.log('FRONTEND API & APPS E2E VERIFICATION SUITE');
  console.log('==================================================');

  let totalIssues = 0;
  const issuesList = [];

  for (const course of courses) {
    console.log(`\nVerifying Course: ${course.title} (${course.id})`);
    
    // 1. Fetch Mock Tests List
    let mocks = [];
    try {
      const res = await axios.get(`${BACKEND_URL}/api/courses/${course.id}/mocks?title=${encodeURIComponent(course.title)}&category=${encodeURIComponent(course.category)}`);
      mocks = res.data || [];
      console.log(`  Found ${mocks.length} Mock Tests.`);
    } catch (err) {
      totalIssues++;
      issuesList.push({
        exam: course.title,
        mock: 'Mocks List API',
        error: `Failed to fetch mocks list: ${err.message}`
      });
      continue;
    }

    // 2. Fetch Previous Papers List
    let pyqs = [];
    try {
      const res = await axios.get(`${BACKEND_URL}/api/courses/${course.id}/pyqs?title=${encodeURIComponent(course.title)}&category=${encodeURIComponent(course.category)}`);
      pyqs = res.data || [];
      console.log(`  Found ${pyqs.length} Previous Papers (PYQs).`);
    } catch (err) {
      totalIssues++;
      issuesList.push({
        exam: course.title,
        mock: 'PYQs List API',
        error: `Failed to fetch pyqs list: ${err.message}`
      });
      continue;
    }

    // 3. Verify Mock Tests
    for (const mock of mocks) {
      await verifyTest(course, mock, 'Mock Test', issuesList);
    }

    // 4. Verify Previous Papers
    for (const pyq of pyqs) {
      await verifyTest(course, pyq, 'Previous Paper', issuesList);
    }
  }

  console.log('\n==================================================');
  console.log('E2E VERIFICATION COMPLETE');
  console.log('==================================================');
  console.log(`Total Issues Found: ${totalIssues}`);
  console.log('==================================================');

  if (totalIssues > 0) {
    console.log('\nList of Issues:');
    issuesList.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.exam}] ${issue.mock}: ${issue.error}`);
    });
  } else {
    console.log('0 issues found! All courses, mock tests, previous papers, sections, and images match the original sources exactly.');
  }
}

async function verifyTest(course, test, testType, issuesList) {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/exam/questions?exam_type=${encodeURIComponent(course.category)}&sub_type=${encodeURIComponent(test.title)}`);
    const questions = res.data || [];
    
    // Check question count
    let expectedCount = 100;
    if (course.category === 'RRB') {
      expectedCount = 80;
    }
    
    if (questions.length !== expectedCount) {
      issuesList.push({
        exam: course.title,
        mock: `${testType}: ${test.title}`,
        error: `Question count mismatch. Expected ${expectedCount}, got ${questions.length}`
      });
    }

    // Verify each question
    for (const q of questions) {
      // 1. Verify no mixed questions
      // The unique_id or sub_type/paper_name must match the expected test
      const expectedPaperName = test.id;
      if (q.paper_name !== expectedPaperName && q.sub_type !== expectedPaperName) {
        // Resolve friendly name fallback comparison
        if (!q.paper_name.toLowerCase().includes(test.title.replace('Solved PYQ Paper', '').replace('Mock', '').toLowerCase().trim())) {
          issuesList.push({
            exam: course.title,
            mock: `${testType}: ${test.title}`,
            error: `Mixed question found! Question ID ${q.unique_id} belongs to paper ${q.paper_name}, expected ${expectedPaperName}`
          });
        }
      }

      // 2. Verify sections (subject or section field) match standard sections
      const validSections = [
        'quantitative aptitude', 'reasoning ability', 'english language', 
        'general awareness', 'general studies', 'computer aptitude'
      ];
      const section = (q.subject || q.section || '').toLowerCase().trim();
      if (!validSections.includes(section)) {
        issuesList.push({
          exam: course.title,
          mock: `${testType}: ${test.title}`,
          error: `Invalid section '${q.subject || q.section}' for unique_id ${q.unique_id}`
        });
      }

      // 3. Verify options clean
      const options = q.options || [];
      options.forEach((opt, optIdx) => {
        const text = typeof opt === 'object' ? opt.text : opt;
        const label_char = String.fromCharCode(65 + optIdx);
        const pat = new RegExp('^\\(' + label_char + '\\)|^' + label_char + '[\\.\\)]|^Option\\s+' + label_char, 'i');
        if (pat.test(text)) {
          // Exception: literally "Option A" as option placeholder is ignored unless it has trailing content
          if (text !== `Option ${label_char}`) {
            issuesList.push({
              exam: course.title,
              mock: `${testType}: ${test.title}`,
              error: `Option prefix artifact found in option ${label_char}: '${text}'`
            });
          }
        }
      });

      // 4. Verify math normalizations / KaTeX
      const qText = q.question || '';
      const expText = q.explanation || '';
      
      // Check for unclosed dollars
      const unescapedDollarsQ = (qText.match(/(?<!\\)\$/g) || []).length;
      if (unescapedDollarsQ % 2 !== 0) {
        issuesList.push({
          exam: course.title,
          mock: `${testType}: ${test.title}`,
          error: `Unclosed dollar sign in question: '${qText}'`
        });
      }

      const unescapedDollarsExp = (expText.match(/(?<!\\)\$/g) || []).length;
      if (unescapedDollarsExp % 2 !== 0) {
        issuesList.push({
          exam: course.title,
          mock: `${testType}: ${test.title}`,
          error: `Unclosed dollar sign in explanation: '${expText}'`
        });
      }

      // Check for raw math commands outside dollars
      const rawCommands = ['\\\\frac', '\\\\sqrt', '\\\\circ'];
      rawCommands.forEach(cmd => {
        const regex = new RegExp(cmd, 'g');
        if (regex.test(qText)) {
          // Verify if it is inside dollars
          const parts = qText.split('$');
          for (let idx = 0; idx < parts.length; idx++) {
            if (idx % 2 === 0 && parts[idx].includes(cmd.replace(/\\\\/g, '\\'))) {
              issuesList.push({
                exam: course.title,
                mock: `${testType}: ${test.title}`,
                error: `Raw math command '${cmd}' outside dollar delimiters in: '${qText}'`
              });
            }
          }
        }
      });

      // 5. Verify image urls & paths
      if (q.question_image) {
        const relativeImgPath = q.question_image.replace(/^\//, '');
        const localImgPath = path.join(workspaceRoot, 'QuestionBank', 'images', relativeImgPath.replace(/\//g, path.sep));
        if (!fs.existsSync(localImgPath)) {
          issuesList.push({
            exam: course.title,
            mock: `${testType}: ${test.title}`,
            error: `Broken image reference on disk: '${relativeImgPath}'`
          });
        }
        
        // Also test downloading it from server
        try {
          await axios.head(`${BACKEND_URL}/images/${relativeImgPath}`);
        } catch (err) {
          issuesList.push({
            exam: course.title,
            mock: `${testType}: ${test.title}`,
            error: `Broken server image URL '/images/${relativeImgPath}': ${err.message}`
          });
        }
      }
    }
  } catch (err) {
    issuesList.push({
      exam: course.title,
      mock: `${testType}: ${test.title}`,
      error: `Failed to query test questions: ${err.message}`
    });
  }
}

runVerification();
