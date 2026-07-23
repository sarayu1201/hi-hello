import { useState, useEffect, useRef, useMemo } from "react";
import { Clock, Users, Star, ArrowRight, BookOpen, ChevronLeft, ChevronDown, CheckCircle, HelpCircle, Award, Volume2, VolumeX, Send, AlertTriangle } from "lucide-react";
import "./Courses.css";

const BACKEND_URL = import.meta.env.VITE_API_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.'))
  ? (window.location.protocol + "//" + window.location.hostname + ":5000")
  : "");

import { ExamLogo, ALL_EXAMS, STANDARD_SYLLABUS, STANDARD_PRACTICE, TOPIC_DATABASE, KR_ACHIEVERS_MOCKS_QUESTIONS, generateQuestionsPool, getSyllabusForCategory, generatePracticeModulesForCourse, generateMockQuestionsForCategory } from "../data/exams";
import { generateMainsMocksForCourseOffline } from "../data/mainsQuestions";
import MockTestScreen from "./MockTestScreen";

function AIAvatar({ state }) {
  return (
    <div className={`ai-avatar-container state-${state}`}>
      <div className="avatar-status-badge">
        <span className={`status-dot ${state}`} />
        <span className="status-text">
          {state === "speaking" ? "AI Speaking" :
           state === "listening" ? "Listening..." :
           state === "thinking" ? "Thinking..." :
           state === "feedback" ? "Excellent!" : "AI Tutor (Idle)"}
        </span>
      </div>
      <svg width="180" height="180" viewBox="0 0 200 200" className="ai-avatar-svg">
        <defs>
          <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2E4380" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1E2460" stopOpacity="0.0" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E4380" />
            <stop offset="100%" stopColor="#1E2460" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#E5C158" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="90" fill="url(#faceGlow)" className="ambient-glow" />

        <path d="M 40,105 A 60,60 0 0,1 160,105" fill="none" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" className="headband" />
        <rect x="30" y="85" width="16" height="36" rx="8" fill="url(#goldGrad)" className="headphone-left" />
        <rect x="154" y="85" width="16" height="36" rx="8" fill="url(#goldGrad)" className="headphone-right" />

        <line x1="100" y1="50" x2="100" y2="25" stroke="url(#bodyGrad)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="20" r="8" fill="url(#goldGrad)" className="antenna-light" />

        <rect x="50" y="50" width="100" height="90" rx="24" fill="url(#bodyGrad)" stroke="#E5C158" strokeWidth="3" className="head-hull" />

        <circle cx="48" cy="95" r="6" fill="#E5C158" />
        <circle cx="152" cy="95" r="6" fill="#E5C158" />

        <rect x="62" y="65" width="76" height="52" rx="12" fill="#0D1117" stroke="#2E4380" strokeWidth="2" />

        {state === "thinking" ? (
          <>
            <g className="eye-gear eye-left">
              <circle cx="80" cy="85" r="10" fill="none" stroke="#E5C158" strokeWidth="3" strokeDasharray="6,4" className="spinning-gear" />
              <circle cx="80" cy="85" r="4" fill="#E5C158" />
            </g>
            <g className="eye-gear eye-right">
              <circle cx="120" cy="85" r="10" fill="none" stroke="#E5C158" strokeWidth="3" strokeDasharray="6,4" className="spinning-gear" />
              <circle cx="120" cy="85" r="4" fill="#E5C158" />
            </g>
          </>
        ) : state === "listening" ? (
          <>
            <circle cx="80" cy="85" r="10" fill="#E5C158" className="eye-pulse" />
            <circle cx="80" cy="85" r="3" fill="#000" />
            <circle cx="120" cy="85" r="10" fill="#E5C158" className="eye-pulse" />
            <circle cx="120" cy="85" r="3" fill="#000" />
          </>
        ) : state === "feedback" ? (
          <>
            <path d="M 72,90 Q 80,80 88,90" fill="none" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 112,90 Q 120,80 128,90" fill="none" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="80" cy="85" rx="8" ry="8" fill="#E5C158" className="eye-standard" />
            <ellipse cx="120" cy="85" rx="8" ry="8" fill="#E5C158" className="eye-standard" />
          </>
        )}

        {state === "speaking" ? (
          <path d="M 75,105 Q 85,95 95,105 T 115,105 T 125,105" fill="none" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" className="speaking-mouth-wave" />
        ) : state === "feedback" ? (
          <path d="M 80,103 Q 100,118 120,103" fill="none" stroke="#E5C158" strokeWidth="4" strokeLinecap="round" />
        ) : state === "listening" ? (
          <path d="M 85,105 Q 100,100 115,105" fill="none" stroke="#E5C158" strokeWidth="3" strokeLinecap="round" className="listening-mouth" />
        ) : (
          <line x1="85" y1="105" x2="115" y2="105" stroke="#E5C158" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

const generateDynamicAIResponse = (query, courseTitle, topicName = "") => {
  const lowerQ = query.toLowerCase();
  
  // Math & Quant Topics
  if (lowerQ.includes("percentage") || lowerQ.includes("percent")) {
    return `### 📊 Percentage Concept & Formulas
In **${courseTitle}**, Percentages are the foundation for Data Interpretation and Profit & Loss.
* **Basic Formula:** 
  $$\\text{Percentage (\\%)} = \\left( \\frac{\\text{Value}}{\\text{Total}} \\right) \\times 100$$
* **Percentage Increase/Decrease:**
  $$\\text{Change \\% } = \\left( \\frac{\\text{New Value} - \\text{Old Value}}{\\text{Old Value}} \\right) \\times 100$$
* **Key Fractions to Percents:**
  * $1/2 = 50\\%$
  * $1/3 = 33.33\\%$
  * $1/4 = 25\\%$
  * $1/6 = 16.67\\%$
  * $1/8 = 12.5\\%$
  
*Example:* If a student scores 45 out of 60, the percentage is $(45/60) \\times 100 = 75\\%$.`;
  }
  
  if (lowerQ.includes("simple interest") || lowerQ.includes("compound interest") || lowerQ.includes("interest") || lowerQ.includes(" si ") || lowerQ.includes(" ci ")) {
    return `### 💰 Interest Formulas (SI & CI)
For **${courseTitle}**, you will face direct or word problems on Simple and Compound Interest.
1. **Simple Interest (SI):**
   $$SI = \\frac{P \\times R \\times T}{100}$$
   Where $P$ = Principal, $R$ = Rate of interest per annum, $T$ = Time in years.
2. **Compound Interest (CI):**
   $$A = P \\left(1 + \\frac{R}{100}\\right)^T$$
   $$CI = A - P = P \\left[ \\left(1 + \\frac{R}{100}\\right)^T - 1 \\right]$$
* **Shortcut for 2 Years Difference (CI - SI):**
  $$\\text{Difference (D)} = P \\left( \\frac{R}{100} \\right)^2$$`;
  }
  
  if (lowerQ.includes("speed") || lowerQ.includes("distance") || lowerQ.includes("train") || lowerQ.includes("boat") || lowerQ.includes("stream")) {
    return `### 🚄 Speed, Distance & Time Core Rules
This topic is highly tested in **${courseTitle}** exams.
* **Basic Equation:**
  $$\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}$$
* **Unit Conversions:**
  * $\\text{km/h} \\to \\text{m/s}$: Multiply by $\\frac{5}{18}$
  * $\\text{m/s} \\to \\text{km/h}$: Multiply by $\\frac{18}{5}$
* **Relative Speed:**
  * Same direction: $S_1 - S_2$
  * Opposite direction: $S_1 + S_2$
* **Boats and Streams:**
  * Downstream Speed ($d$) = $u + v$ (boat speed + stream speed)
  * Upstream Speed ($u_p$) = $u - v$`;
  }
  
  if (lowerQ.includes("average")) {
    return `### 📈 Average & Weighted Average
Averages are crucial for data analysis in **${courseTitle}**.
* **Basic Formula:**
  $$\\text{Average} = \\frac{\\text{Sum of all Observations}}{\\text{Total Number of Observations}}$$
* **Weighted Average:**
  $$A_w = \\frac{n_1 a_1 + n_2 a_2}{n_1 + n_2}$$
* **Shortcut for Consecutive Numbers:** The average of consecutive numbers or arithmetic progression (AP) is exactly the middle term (or the average of the first and last terms).`;
  }
  
  if (lowerQ.includes("ratio") || lowerQ.includes("proportion") || lowerQ.includes("partnership")) {
    return `### ⚖️ Ratio, Proportion & Partnership
Partnership investments are directly proportional to profit shares.
* **Ratio Definition:** A comparison of two quantities $a : b = \\frac{a}{b}$.
* **Compound Ratio:** Compound ratio of $a:b$ and $c:d$ is $ac:bd$.
* **Partnership Rule:** 
  $$\\frac{\\text{Profit of A}}{\\text{Profit of B}} = \\frac{\\text{Investment of A} \\times \\text{Time of A}}{\\text{Investment of B} \\times \\text{Time of B}}$$`;
  }
  
  if (lowerQ.includes("work") || lowerQ.includes("time and work") || lowerQ.includes("efficiency") || lowerQ.includes("pipe") || lowerQ.includes("cistern")) {
    return `### 🛠️ Time, Work & Efficiency Formulas
Solve work problems in **${courseTitle}** using the LCM method.
* **Basic Concept:** If A can do a work in $X$ days, A's 1-day work is $\\frac{1}{X}$.
* **Combined Work Formula:** If A takes $X$ days and B takes $Y$ days:
  $$\\text{Time taken together} = \\frac{X \\times Y}{X + Y} \\text{ days}$$
* **Efficiency Rule:** Efficiency is inversely proportional to time taken. 
  $$\\text{Work Done} = \\text{Efficiency} \\times \\text{Time}$$`;
  }
  
  if (lowerQ.includes("quadratic") || lowerQ.includes("equation") || lowerQ.includes("roots")) {
    return `### 🧮 Quadratic Equations & Roots Comparison
In bank exams like **${courseTitle}**, you will have 5 questions comparing roots of two quadratic equations.
* **Standard Form:** $ax^2 + bx + c = 0$
* **Quadratic Formula (Roots):**
  $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
* **Sign Shortcut Rules:**
  * If equation is $x^2 - bx + c = 0$, both roots are **Positive (+, +)**.
  * If equation is $x^2 + bx + c = 0$, both roots are **Negative (-, -)**.
  * If equation is $x^2 \\pm bx - c = 0$, roots have **Opposite signs (+, -)**.`;
  }
  
  if (lowerQ.includes("syllogism") || lowerQ.includes("logic") || lowerQ.includes("statement")) {
    return `### 🧩 Syllogism Deductive Logic Rules
For reasoning sections in **${courseTitle}**, master the Venn diagram representations:
1. **"All A are B":** Circle A is entirely inside circle B.
2. **"Some A are B":** Circle A and circle B overlap.
3. **"No A is B":** Circle A and circle B do not touch at all.
4. **"Only a few A are B":** Means "Some A are B" AND "Some A are not B". Pay close attention to this restrictive condition!`;
  }

  if (lowerQ.includes("coding") || lowerQ.includes("decode")) {
    return `### 🔠 Coding-Decoding Rules & Shifts
In **${courseTitle}**, Coding-Decoding tests alphabetical positioning.
* **Core Concept:** Letters are shifted by an offset ($+1, -1, +2$) or reversed.
* **Opposite Pairs Formula:** Position of opposite letter is:
  $$\\text{Opposite Position} = 27 - \\text{Current Position}$$
  *Example:* A (1) $\\leftrightarrow$ Z (26) since $1 + 26 = 27$. B (2) $\\leftrightarrow$ Y (25).
* **Positional Values (EJOTY):** Remember positions $E=5, J=10, O=15, T=20, Y=25$ to locate other letters quickly.`;
  }

  if (lowerQ.includes("blood") || lowerQ.includes("relation") || lowerQ.includes("family")) {
    return `### 👥 Blood Relations Family Trees
To solve blood relation puzzles in **${courseTitle}**:
1. **Standard Diagram Symbols:**
   * **Square / (+)** : Male member
   * **Circle / (-)** : Female member
   * **Double Line (=)** : Married couple
   * **Single Horizontal Line (-)** : Siblings
   * **Vertical Line ($\\downarrow$)** : Next Generation (parent to child)
2. **Generation Gaps:** Keep grandparents on the top tier, parents on the middle, and children on the bottom.`;
  }

  if (lowerQ.includes("series") || lowerQ.includes("sequence") || lowerQ.includes("missing")) {
    return `### 🔢 Number Series & Pattern Types
For **${courseTitle}** quantitative series questions:
* **Difference-Based:** Check the differences between consecutive terms:
  $$d_n = a_{n+1} - a_n$$
* **Double Difference:** If the first difference has no clear pattern, calculate differences of differences:
  $$\\Delta d_n = d_{n+1} - d_n$$
* **Geometric/Product:** If numbers grow exponentially, it's a product series:
  $$a_{n+1} = a_n \\times k \\pm m$$
* **Square/Cube Series:** Check if differences are squares ($1, 4, 9, 16$) or cubes ($1, 8, 27, 64$).`;
  }

  if (lowerQ.includes("data") || lowerQ.includes("interpretation") || lowerQ.includes(" di ")) {
    return `### 📊 Data Interpretation (DI) Guidelines
DI represents $30-40\\%$ of the math section in **${courseTitle}**.
* **Key Speed Tip:** Do not perform full divisions. Use fractional equivalences and estimation:
  $$\\text{Growth Rate} = \\left( \\frac{\\text{Current Year} - \\text{Base Year}}{\\text{Base Year}} \\right) \\times 100$$
* **Tabular & Bar Graphs:** Sum columns quickly by grouping terms to the nearest tens (e.g., $43 + 57 = 100$).
* **Pie Charts:** Convert degrees to percentages:
  $$x\\% = \\left( \\frac{\\text{Degrees}}{360} \\right) \\times 100 \\implies 180^\\circ = 50\\%, \\quad 72^\\circ = 20\\%$$`;
  }

  if (lowerQ.includes("probability") || lowerQ.includes("permutation") || lowerQ.includes("combination") || lowerQ.includes(" dice ") || lowerQ.includes(" cards ")) {
    return `### 🎲 Probability & Combinatorics
For advanced math chapters in **${courseTitle}**:
* **Combinations Formula (Choosing $r$ from $n$):**
  $$\${}^nC_r = \\frac{n!}{r!(n-r)!}$$
* **Probability of an Event $E$:**
  $$P(E) = \\frac{\\text{Number of Favorable Outcomes } n(E)}{\\text{Total Number of Sample Outcomes } n(S)}$$
* **Non-occurrence:** $P(\\text{Not } E) = 1 - P(E)$`;
  }

  if (lowerQ.includes(" age") || lowerQ.includes("ages")) {
    return `### 👤 Problems on Ages
Linear equations solve age problems efficiently in **${courseTitle}**:
* **Ratio Setup:** If ages of A and B are in the ratio $a:b$, assume their current ages are $ax$ and $bx$.
* **Time Shift:** 
  * Age $N$ years ago: $ax - N$ and $bx - N$
  * Age after $M$ years: $ax + M$ and $bx + M$
* *Example:* If ratio is $3:4$ and sum is 28, then $3x + 4x = 28 \\implies 7x = 28 \\implies x=4$. Ages are $12$ and $16$.`;
  }
  
  if (lowerQ.includes("syllabus") || lowerQ.includes("pattern") || lowerQ.includes("structure")) {
    return `### 📋 Official Exam Pattern & Syllabus
The **${courseTitle}** exam structure comprises:
1. **Prelims (Objective):** 100 Marks (Quantitative Aptitude, Reasoning Ability, English Language). Sectional timing is 20 minutes each.
2. **Mains (Objective & Descriptive):** Detailed tests on Data Analysis, General Banking Awareness, Computer Aptitude, and Essay/Letter writing.
3. **Group Interview:** Final evaluation of personality and current affairs grasp.
*Strategy:* Focus heavily on calculation speed (squares, tables) to clear the high sectional cutoffs.`;
  }
  
  if (lowerQ.includes("book") || lowerQ.includes("material") || lowerQ.includes("source") || lowerQ.includes("read")) {
    return `### 📚 Recommended Reference Handbooks
For **${courseTitle}**, KR Institute of Learning recommends:
* **Quantitative Aptitude:** Solve topic questions in our Study Handbooks. Practice mock tables daily.
* **Reasoning:** KR Institute of Learning Puzzles Handbook (Floor arrangements, Box grids, Linear rows).
* **English:** Read newspapers (The Hindu editorial) for vocabulary and descriptive writing tips.
* **Previous Year Papers:** Download solved PYQs directly from our Solved PYQs tab for active practice.`;
  }
  
  // Dynamic Keyword-based response fallback
  const keywords = lowerQ.match(/\b(simplification|approximation|number series|di|data interpretation|puzzle|coding|decoding|descriptive|essay|english|grammar|comprehension|banking|current affairs|gk|static)\b/g) || [];
  
  if (keywords.length > 0) {
    const topic = keywords[0].toUpperCase();
    return `### 💡 Dynamic Explanation on ${topic}
Regarding your query on **${topic}** for the **${courseTitle}** course:
This topic is highly scoring. In exams, you should:
1. **Identify the Core Patterns:** For example, in ${topic}, look for standard operators or gap rules first.
2. **Use Approximation:** Avoid calculating exact decimals unless options are extremely close.
3. **Daily Drill:** Solve at least 15-20 questions of ${topic} daily to build muscle memory.
Let me know if you would like me to explain a specific formula or if you want to start a practice quiz on this!`;
  }

  // Smart Context-Aware NLP Parser fallback: Extracts the specific topic from the query!
  let topic = "";
  const cleaned = query.trim().replace(/[?.]/g, "");
  const whatIsMatch = cleaned.match(/(?:what is|explain|tell me about|how to solve|what are|define)\s+(?:\b(?:a|an|the)\b)?\s*([^?]+)/i);
  if (whatIsMatch && whatIsMatch[1]) {
    topic = whatIsMatch[1].trim();
  } else {
    const words = cleaned.split(/\s+/);
    const stopwords = ["what", "is", "a", "an", "the", "explain", "how", "to", "solve", "about", "query", "question", "on", "in", "of", "for", "please", "can", "you", "tell", "me", "find", "give", "show"];
    const filtered = words.filter(w => !stopwords.includes(w.toLowerCase()));
    if (filtered.length > 0) {
      topic = filtered.slice(-3).join(" ");
    } else {
      topic = words.slice(-3).join(" ");
    }
  }

  // Capitalize title
  const topicTitle = topic.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  return `### 💡 Doubt Resolved: ${topicTitle}
Here is a comprehensive concept breakdown of **${topicTitle}** tailored specifically for your **${courseTitle}** preparation:

1. **Theoretical Significance:**
   * **${topicTitle}** is a critical component for achieving high marks in **${courseTitle}**.
   * Mastery of the core definitions, structures, and properties ensures you can handle both simple concepts and complex application problems in the actual exam.

2. **Step-by-Step Problem Solving Method:**
   * **Identify Givens:** Map all numbers, percentages, names, or condition sets from the question.
   * **Formulate Model:** Set up a family tree, Venn diagram, linear table, or algebraic equation depending on the section.
   * **Approximate & Eliminate:** Avoid full calculations when options are far apart; use units digit matching or sign rules to eliminate options.

3. **Core Formula Representation:**
   * For quantitative chapters under **${topicTitle}**, we model the key values using:
     $$\\text{Target Output} = \\frac{\\text{Product of Inputs}}{\\text{Frictional Coefficients}}$$
   * For reasoning puzzles under **${topicTitle}**, represent the logical bounds as:
     $$\\text{Feasible Positions} = \\text{Total Configurations} - \\text{Contradictions}$$

4. **Recommended Action Plan:**
   * Go to the **Study Handbooks** tab in this console to download detailed notes about **${topicTitle}**.
   * Take a timed topic test in the **Practice Modules** tab to verify your concepts.

Let me know if you would like me to show a sample solved question, or explain specific formulas!`;
};

// Helper to clean raw LaTeX mathematical notations into readable standard text equations
const cleanLatexToPlain = (formula) => {
  if (!formula) return "";
  let cleaned = formula;
  
  // Replace \frac{A}{B} with (A / B)
  let prev;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "($1 / $2)");
  } while (cleaned !== prev);
  
  // Replace \text{...} with just ...
  cleaned = cleaned.replace(/\\text\s*\{([^{}]+)\}/g, "$1");
  
  // Replace \left( and \right) with ( and )
  cleaned = cleaned.replace(/\\left\(/g, "(");
  cleaned = cleaned.replace(/\\right\)/g, ")");
  cleaned = cleaned.replace(/\\left\[/g, "[");
  cleaned = cleaned.replace(/\\right\]/g, "]");
  
  // Replace brackets
  cleaned = cleaned.replace(/\\{/g, "{");
  cleaned = cleaned.replace(/\\}/g, "}");
  
  // Replace math operators
  cleaned = cleaned.replace(/\\times/g, " × ");
  cleaned = cleaned.replace(/\\div/g, " ÷ ");
  cleaned = cleaned.replace(/\\pm/g, " ± ");
  cleaned = cleaned.replace(/\\le/g, " ≤ ");
  cleaned = cleaned.replace(/\\ge/g, " ≥ ");
  cleaned = cleaned.replace(/\\cdot/g, " · ");
  cleaned = cleaned.replace(/\\approx/g, " ≈ ");
  cleaned = cleaned.replace(/\\Delta/g, " Δ ");
  
  // Replace % and _ escapes
  cleaned = cleaned.replace(/\\%/g, "%");
  cleaned = cleaned.replace(/\\_/g, "_");
  
  // Strip remaining backslashes
  cleaned = cleaned.replace(/\\/g, "");
  
  return cleaned.trim();
};

const cleanNotePreviewText = (text) => {
  if (!text) return "";
  // Strip Markdown headings (###, ##, #)
  let cleaned = text.replace(/#+\s*/g, "");
  // Strip ASCII horizontal lines (===, ---, ___)
  cleaned = cleaned.replace(/[=\-_]{3,}/g, "");
  // Strip LaTeX double dollar blocks ($$formula$$)
  cleaned = cleaned.replace(/\$\$.*?\$\$/g, "");
  // Strip LaTeX inline formulas ($formula$)
  cleaned = cleaned.replace(/\$.*?\$/g, "");
  // Strip Markdown bullet points and numbering (* , - , 1. )
  cleaned = cleaned.replace(/^\s*[\*\-•]\s*/gm, "");
  cleaned = cleaned.replace(/^\s*\d+\.\s*/gm, "");
  // Replace multiple newlines or tabs with a single space
  cleaned = cleaned.replace(/\s+/g, " ");
  // Trim the result
  cleaned = cleaned.trim();
  
  // Return the first 120 characters to keep preview informative
  return cleaned.length > 120 ? cleaned.substring(0, 120) + "..." : cleaned;
};

// Helper to parse bold, inline code, and inline LaTeX
const parseInlineMarkdown = (text, isUser = false) => {
  if (!text) return "";
  
  // Split the text by tokens of bold ** or inline math $
  const regex = /(\*\*.*?\*\*|\$.*?\$)/g;
  const parts = text.split(regex);
  
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} style={{ 
          fontWeight: "700", 
          color: isUser ? "var(--white)" : "var(--navy)",
          background: isUser ? "rgba(255, 255, 255, 0.15)" : "linear-gradient(120deg, rgba(229,193,88,0.15) 0%, rgba(229,193,88,0.05) 100%)",
          padding: "1px 4px",
          borderRadius: "3px"
        }}>
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      const cleanedFormula = cleanLatexToPlain(part.substring(1, part.length - 1));
      return (
        <code key={idx} className="latex-inline-formula" style={{
          fontFamily: "inherit",
          fontSize: "0.95rem",
          background: isUser ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.04)",
          padding: "2px 6px",
          borderRadius: "4px",
          color: isUser ? "var(--white)" : "var(--blue)",
          fontWeight: "600",
          display: "inline-block",
          margin: "0 2px"
        }}>
          {cleanedFormula}
        </code>
      );
    }
    return part;
  });
};

const renderFormattedMessage = (text, sender = "ai") => {
  if (!text) return null;
  const isUser = sender === "user";
  
  // If the message is just the loading indicator "..."
  if (text === "...") {
    return (
      <div className="typing-indicator" style={{ display: "flex", gap: "5px", padding: "8px 12px", alignItems: "center" }}>
        <span className="dot" style={{ width: "8px", height: "8px", background: "var(--muted)", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both" }} />
        <span className="dot" style={{ width: "8px", height: "8px", background: "var(--muted)", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both 0.2s" }} />
        <span className="dot" style={{ width: "8px", height: "8px", background: "var(--muted)", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both 0.4s" }} />
      </div>
    );
  }

  // Split the text into lines
  const lines = text.split("\n");
  const textColor = isUser ? "var(--white)" : "var(--text)";
  const headingColor = isUser ? "var(--white)" : "var(--navy)";
  
  return (
    <div className="formatted-message-container" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {lines.map((line, lineIdx) => {
        let trimmed = line.trim();
        
        // Check for LaTeX block formulas (e.g., $$formula$$)
        if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
          const formula = trimmed.substring(2, trimmed.length - 2);
          const cleanedFormula = cleanLatexToPlain(formula);
          return (
            <div key={lineIdx} className="latex-block-formula" style={{
              textAlign: "center",
              margin: "10px 0",
              fontFamily: "inherit",
              fontSize: "1.1rem",
              background: isUser ? "rgba(255, 255, 255, 0.1)" : "var(--bg)",
              padding: "10px 14px",
              borderRadius: "8px",
              borderLeft: isUser ? "4px solid var(--white)" : "4px solid var(--blue)",
              borderRight: isUser ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid var(--border)",
              borderTop: isUser ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid var(--border)",
              borderBottom: isUser ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid var(--border)",
              overflowX: "auto",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
              color: textColor,
              fontWeight: "600"
            }}>
              {cleanedFormula}
            </div>
          );
        }
        
        // Check for Headings
        if (trimmed.startsWith("###")) {
          const headerText = trimmed.replace(/^###\s*/, "");
          return <h4 key={lineIdx} className="chat-header-3" style={{ fontSize: "1.1rem", fontWeight: "800", color: headingColor, margin: "10px 0 4px 0", borderBottom: isUser ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--border)", paddingBottom: "4px" }}>{parseInlineMarkdown(headerText, isUser)}</h4>;
        }
        if (trimmed.startsWith("##")) {
          const headerText = trimmed.replace(/^##\s*/, "");
          return <h3 key={lineIdx} className="chat-header-2" style={{ fontSize: "1.2rem", fontWeight: "800", color: headingColor, margin: "12px 0 6px 0", borderBottom: isUser ? "1px dashed rgba(255,255,255,0.2)" : "1px dashed var(--border)", paddingBottom: "6px" }}>{parseInlineMarkdown(headerText, isUser)}</h3>;
        }
        if (trimmed.startsWith("#")) {
          const headerText = trimmed.replace(/^#\s*/, "");
          return <h2 key={lineIdx} className="chat-header-1" style={{ fontSize: "1.3rem", fontWeight: "800", color: headingColor, margin: "14px 0 8px 0" }}>{parseInlineMarkdown(headerText, isUser)}</h2>;
        }
        
        // Check for Bullet Points (e.g. * or - or •)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={lineIdx} className="chat-bullet-item" style={{ marginLeft: "12px", marginBottom: "4px", display: "flex", gap: "8px", alignItems: "flex-start", color: textColor }}>
              <span style={{ color: isUser ? "var(--white)" : "var(--blue)", fontWeight: "bold", fontSize: "1rem", lineHeight: "1.4" }}>•</span>
              <div style={{ flex: 1 }}>{parseInlineMarkdown(bulletText, isUser)}</div>
            </div>
          );
        }

        // Check for Numbered Lists
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberMatch) {
          const num = numberMatch[1];
          const listText = numberMatch[2];
          return (
            <div key={lineIdx} className="chat-number-item" style={{ marginLeft: "12px", marginBottom: "6px", display: "flex", gap: "8px", alignItems: "flex-start", color: textColor }}>
              <span style={{ fontWeight: "800", color: isUser ? "var(--white)" : "var(--blue)", minWidth: "16px" }}>{num}.</span>
              <div style={{ flex: 1 }}>{parseInlineMarkdown(listText, isUser)}</div>
            </div>
          );
        }
        
        // Regular line
        if (!trimmed) {
          return <div key={lineIdx} style={{ height: "4px" }} />;
        }
        
        return (
          <p key={lineIdx} style={{ margin: "2px 0", lineHeight: "1.6", color: textColor }}>
            {parseInlineMarkdown(line, isUser)}
          </p>
        );
      })}
    </div>
  );
};

export default function Courses({ user, setUser, requestAuth, selectedCategory, setSelectedCategory, searchQuery, activeCourse, setActiveCourse, navigate, practiceMode, onPracticeModeConsumed }) {

  const [courses, setCourses] = useState(ALL_EXAMS);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/courses`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setCourses(data);
        }
      }
    } catch (e) {
      console.error("Error loading courses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    const refreshTimer = setInterval(fetchCourses, 300000); // 5 minutes refresh
    return () => clearInterval(refreshTimer);
  }, []);

  const [selectedPill, setSelectedPill] = useState("Banking Exams");
  
  const COURSE_PILLS = [
    "Banking Exams",
    "SSC Exams",
    "RRB & Railway Exams",
    "Civil Services",
    "Government Exams",
    "AP Police",
    "Telangana Police"
  ];

  useEffect(() => {
    if (selectedCategory === "Bank & Insurance") {
      setSelectedPill("Banking Exams");
    } else if (selectedCategory === "SSC Exams") {
      setSelectedPill("SSC Exams");
    } else if (selectedCategory === "RRB & Railways") {
      setSelectedPill("RRB & Railway Exams");
    } else if (selectedCategory === "UPSC / Civil") {
      setSelectedPill("Civil Services");
    } else if (selectedCategory === "State Exams") {
      setSelectedPill("Government Exams");
    } else {
      setSelectedPill("");
    }
  }, [selectedCategory]);

  const handlePillClick = (pill) => {
    setSelectedPill(pill);
    if (pill === "RRB & Railway Exams") {
      setSelectedCategory("RRB & Railways");
    } else if (pill === "SSC Exams") {
      setSelectedCategory("SSC Exams");
    } else if (pill === "Banking Exams") {
      setSelectedCategory("Bank & Insurance");
    } else if (pill === "Civil Services") {
      setSelectedCategory("UPSC / Civil");
    } else if (pill === "Government Exams" || pill === "AP Police" || pill === "Telangana Police") {
      setSelectedCategory("State Exams");
    }
  };

  const [detailTab, setDetailTab] = useState("syllabus"); // 'syllabus' | 'practice'

  // Auto-switch to practice tab when practiceMode is triggered from nav
  useEffect(() => {
    if (practiceMode) {
      setDetailTab("practice");
      if (onPracticeModeConsumed) onPracticeModeConsumed();
    }
  }, [practiceMode]);
  const [accordionOpen, setAccordionOpen] = useState({
    stage1: true,
    stage2: false,
    mains: false
  });
  const [practiceAccordionOpen, setPracticeAccordionOpen] = useState({
    stage1: true,
    stage2: false
  });
  const [checkoutTab, setCheckoutTab] = useState("Railway");
  const [checkoutValidity, setCheckoutValidity] = useState("6"); // Months

  const isUnlocked = useMemo(() => {
    if (user && Array.isArray(user.unlockedCourses)) {
      return user.unlockedCourses.includes(activeCourse?.id);
    }
    return false;
  }, [user, activeCourse]);

  // Helper to map a course object to a sector ID
  const getCourseSectorId = (course) => {
    if (!course) return "Banking";
    const cat = course.category || "";
    const title = course.title || "";
    if (cat.includes("Bank")) return "Banking";
    if (cat.includes("SSC")) return "SSC";
    if (cat.includes("Rail")) return "Railways";
    if (cat.includes("UPSC")) return "UPSC";
    if (title.toUpperCase().includes("TSPSC") || title.toUpperCase().includes("TS ")) return "TSPSC";
    if (title.toUpperCase().includes("APPSC") || title.toUpperCase().includes("AP ")) return "APPSC";
    if (cat.includes("State")) return "APPSC";
    return "Banking";
  };

  const isPrelimsUnlocked = useMemo(() => {
    if (isUnlocked) return true;
    if (!user || !activeCourse) return false;
    
    // Single course Prelims purchase
    if (Array.isArray(user.unlockedPrelims) && user.unlockedPrelims.includes(activeCourse.id)) {
      return true;
    }
    
    // Complete Sector Prelims purchase
    const sectorId = getCourseSectorId(activeCourse);
    if (Array.isArray(user.unlockedSectorsPrelims) && user.unlockedSectorsPrelims.includes(sectorId)) {
      return true;
    }
    
    return false;
  }, [isUnlocked, user, activeCourse]);

  const isMainsUnlocked = useMemo(() => {
    if (isUnlocked) return true;
    if (!user || !activeCourse) return false;
    
    // Single course Mains purchase
    if (Array.isArray(user.unlockedMains) && user.unlockedMains.includes(activeCourse.id)) {
      return true;
    }
    
    // Complete Sector Mains purchase
    const sectorId = getCourseSectorId(activeCourse);
    if (Array.isArray(user.unlockedSectorsMains) && user.unlockedSectorsMains.includes(sectorId)) {
      return true;
    }
    
    return false;
  }, [isUnlocked, user, activeCourse]);

  const getQuizLockStatus = (idx) => {
    if (isUnlocked) return false; // Full course unlocked
    if (idx < 4) return false; // First 4 sectional quizzes are always free
    if (!user || !activeCourse) return true;

    const sectorId = getCourseSectorId(activeCourse);

    // Complete Sector purchase -> unlock all quizzes in this sector
    const hasSectorPrelims = Array.isArray(user.unlockedSectorsPrelims) && user.unlockedSectorsPrelims.includes(sectorId);
    const hasSectorMains = Array.isArray(user.unlockedSectorsMains) && user.unlockedSectorsMains.includes(sectorId);
    if (hasSectorPrelims || hasSectorMains) {
      return false;
    }

    // Single course purchase -> unlock first 3 premium quizzes (index 4, 5, 6)
    const hasSinglePrelims = Array.isArray(user.unlockedPrelims) && user.unlockedPrelims.includes(activeCourse.id);
    const hasSingleMains = Array.isArray(user.unlockedMains) && user.unlockedMains.includes(activeCourse.id);
    if (hasSinglePrelims || hasSingleMains) {
      if (idx < 7) {
        return false;
      }
    }

    return true;
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert("Please log in to purchase and unlock this course.");
      requestAuth();
      return;
    }

    try {
      // 1. Create Razorpay order on the backend
      let price = checkoutValidity === "3" ? 149 : checkoutValidity === "6" ? 299 : 499;
      if (activeCourse.id === "sbi_po") {
        price = 10;
      }
      const orderRes = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user.token ? `Bearer ${user.token}` : ""
        },
        body: JSON.stringify({
          amount: price,
          courseId: activeCourse.id
        })
      });

      if (!orderRes.ok) {
        throw new Error("Failed to initialize payment transaction.");
      }

      const orderData = await orderRes.json();

      // Helper function to complete the verification on backend
      const verifyAndUnlock = async (verificationPayload) => {
        const verifyRes = await fetch(`${BACKEND_URL}/api/payments/verify-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": user.token ? `Bearer ${user.token}` : ""
          },
          body: JSON.stringify({
            ...verificationPayload,
            email: user.email,
            courseId: activeCourse.id
          })
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          // Extract updated user object (Mongoose document format)
          const updatedUserObj = verifyData.user;
          // Synchronize token from existing user session
          const completedUser = { ...updatedUserObj, token: user.token };
          
          localStorage.setItem("kr_user", JSON.stringify(completedUser));
          if (setUser) {
            setUser(completedUser);
          }
          alert(`🎉 Purchase Successful!\n\nYou have unlocked the "${activeCourse.title}" successfully!`);
        } else {
          alert("Payment verification failed. Please contact support.");
        }
      };

      // 2. Handle payment checkout (Real or Simulated)
      if (orderData.simulated) {
        console.log("[PAYMENT] Operating in simulation mode.");
        const confirmSim = window.confirm(
          `[TEST MODE SIMULATOR]\n\nDo you want to simulate a successful payment of ₹${price} for "${activeCourse.title}"?`
        );
        if (confirmSim) {
          await verifyAndUnlock({ simulated: true });
        }
      } else {
        const options = {
          key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID, // Use backend's key or fallback
          amount: orderData.amount,
          currency: "INR",
          name: "KR Institute of Learning",
          description: `Purchase: ${activeCourse.title}`,
          order_id: orderData.id,
          prefill: {
            name: user.name || "",
            email: user.email || "",
            contact: user.phone || ""
          },
          theme: {
            color: "#1B365D"
          },
          handler: async function (response) {
            await verifyAndUnlock({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function () {
              alert("Payment cancelled.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert(`Network error during purchase initiation: ${err.message}`);
    }
  };

  const utteranceRef = useRef(null);
  const [selectedPracticeSet, setSelectedPracticeSet] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [quizState, setQuizState] = useState({
    currentQuestionIndex: 0,
    selectedOption: null,
    answered: false,
    score: 0,
    completed: false
  });

  const handleDownloadSyllabusPdf = (course) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the PDF syllabus.");
      return;
    }

    let syllabusHtml = "";
    course.syllabus.forEach((subjectGroup, idx) => {
      let conceptsHtml = "";
      subjectGroup.concepts.forEach(c => {
        conceptsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-weight: bold;">📖 ${c.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #4B5563;">${c.weightage}</td>
            <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;"><span style="background: #F3F4F6; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">${c.difficulty}</span></td>
          </tr>
        `;
      });

      syllabusHtml += `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="background: #1A365D; color: white; padding: 8px 12px; margin: 0 0 10px 0; border-radius: 6px; font-size: 15px;">${subjectGroup.subject}</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #F9FAFB;">
                <th style="padding: 10px; border-bottom: 2px solid #E5E7EB; font-size: 12px; color: #4B5563; text-transform: uppercase;">Concept / Topic</th>
                <th style="padding: 10px; border-bottom: 2px solid #E5E7EB; font-size: 12px; color: #4B5563; text-transform: uppercase;">Weightage</th>
                <th style="padding: 10px; border-bottom: 2px solid #E5E7EB; font-size: 12px; color: #4B5563; text-transform: uppercase;">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              ${conceptsHtml}
            </tbody>
          </table>
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>KR Institute of Learning Syllabus - ${course.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1F2937; margin: 0; padding: 40px; background: white; }
          .header { text-align: center; border-bottom: 3px solid #1A365D; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 26px; font-weight: 800; color: #1A365D; letter-spacing: -0.5px; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #4B5563; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 20px; font-weight: 700; color: #111827; margin: 15px 0 5px 0; }
          
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; }
          
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <button onclick="window.print()" style="background: #1A365D; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
        
        <div class="header">
          <div class="logo">KR INSTITUTE OF LEARNING</div>
          <div class="subtitle">Rajahmundry Competitive Exam Hub</div>
          <div class="title">OFFICIAL SYLLABUS & PREPARATION GUIDE</div>
          <div style="font-weight: bold; margin-top: 5px; font-size: 15px; color: #1A365D;">Course: ${course.title} Preparation</div>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 15px; margin-bottom: 30px; text-align: center;">
          <p style="margin: 0; color: #1E3A8A; font-size: 13.5px; line-height: 1.5;">This syllabus outline corresponds to the latest <strong>2026 TCS recruitment pattern</strong> guidelines. Practice topic tests in the KR Institute of Learning Console to align with these chapters.</p>
        </div>

        <div>${syllabusHtml}</div>

        <div class="footer">
          <p>This syllabus report is compiled officially by KR Institute of Learning Faculty, Rajahmundry.</p>
          <p>© 2026 KR Institute of Learning Hub. All rights reserved.</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPracticePdf = (practiceSet, answers, score) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the PDF scorecard.");
      return;
    }

    let questionsHtml = "";
    practiceSet.questions.forEach((q, idx) => {
      const selectedOpt = answers[idx];
      const isCorrect = selectedOpt === q.correct;
      let statusText = isCorrect ? "CORRECT" : "INCORRECT";
      let statusColor = isCorrect ? "#059669" : "#DC2626";
      let cardBg = isCorrect ? "#F0FDF4" : "#FEF2F2";
      let cardBorder = isCorrect ? "#10B981" : "#EF4444";

      let optionsHtml = "";
      q.options.forEach((opt, oIdx) => {
        const isCorrectOpt = oIdx === q.correct;
        const isSelectedOpt = oIdx === selectedOpt;
        let optBg = "white";
        let optBorder = "#E5E7EB";
        let optColor = "#1F2937";
        let optBold = "normal";

        if (isCorrectOpt) {
          optBg = "#D1FAE5";
          optBorder = "#10B981";
          optColor = "#065F46";
          optBold = "bold";
        } else if (isSelectedOpt) {
          optBg = "#FEE2E2";
          optBorder = "#EF4444";
          optColor = "#991B1B";
          optBold = "bold";
        }

        optionsHtml += `
          <div style="background: ${optBg}; border: 1.5px solid ${optBorder}; color: ${optColor}; font-weight: ${optBold}; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px;">
            <strong>${String.fromCharCode(65 + oIdx)}.</strong> ${opt}
            ${isCorrectOpt ? ' (Correct Answer)' : ''}
            ${isSelectedOpt && !isCorrectOpt ? ' (Your Incorrect Answer)' : ''}
          </div>
        `;
      });

      questionsHtml += `
        <div style="background: ${cardBg}; border: 1.5px solid ${cardBorder}; padding: 20px; border-radius: 8px; margin-bottom: 20px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${cardBorder}; padding-bottom: 8px; margin-bottom: 12px;">
            <span style="font-size: 12px; font-weight: 800; color: #4B5563; text-transform: uppercase;">
              Question ${idx + 1}
            </span>
            <span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 800;">
              ${statusText}
            </span>
          </div>
          <p style="font-size: 15px; font-weight: 700; margin: 0 0 12px 0; color: #111827;">${q.q}</p>
          <div>${optionsHtml}</div>
          ${q.explanation ? `
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #D1D5DB; font-size: 12.5px; color: #4B5563; line-height: 1.4;">
              <strong>💡 Explanation:</strong> ${q.explanation}
            </div>
          ` : ""}
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>KR Institute of Learning Practice Report - ${practiceSet.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1F2937; margin: 0; padding: 40px; background: white; }
          .header { text-align: center; border-bottom: 3px solid #1A365D; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 26px; font-weight: 800; color: #1A365D; letter-spacing: -0.5px; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #4B5563; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 20px; font-weight: 700; color: #111827; margin: 15px 0 5px 0; }
          .date { font-size: 12px; color: #6B7280; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto; }
          .stat-card { background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px; text-align: center; }
          .stat-num { display: block; font-size: 20px; font-weight: 800; color: #1A365D; margin-bottom: 2px; }
          .stat-lbl { font-size: 11px; font-weight: 600; color: #4B5563; text-transform: uppercase; }
          
          .section-title { font-size: 16px; font-weight: 800; color: #1A365D; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px; margin: 30px 0 20px 0; text-transform: uppercase; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; }
          
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <button onclick="window.print()" style="background: #1A365D; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
        
        <div class="header">
          <div class="logo">KR INSTITUTE OF LEARNING</div>
          <div class="subtitle">Rajahmundry Competitive Exam Hub</div>
          <div class="title">TOPIC PRACTICE QUIZ PERFORMANCE REPORT</div>
          <div class="date">Completed on: ${new Date().toLocaleDateString()}</div>
        </div>

        <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 15px; margin-bottom: 30px; text-align: center;">
          <h3 style="margin: 0 0 6px 0; color: #92400E; font-size: 15px;">Practice Set: ${practiceSet.title}</h3>
          <p style="margin: 0; color: #B45309; font-size: 13px;">Topic-wise self-evaluation module details.</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-num">${score} / ${practiceSet.questions.length}</span>
            <span class="stat-lbl">Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${Math.round((score / practiceSet.questions.length) * 100)}%</span>
            <span class="stat-lbl">Accuracy</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${practiceSet.questions.length}</span>
            <span class="stat-lbl">Total Questions</span>
          </div>
        </div>

        <div class="section-title">EVALUATION DETAIL & REVIEW</div>
        <div>${questionsHtml}</div>

        <div class="footer">
          <p>This is a system-generated scorecard from KR Institute of Learning Platform, Rajahmundry.</p>
          <p>© 2026 KR Institute of Learning Hub. All rights reserved.</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadMainsQuestionPaper = (mock) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the question paper.");
      return;
    }

    let questionsHtml = "";
    mock.questions.forEach((q, idx) => {
      questionsHtml += `
        <div style="margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px dashed #E5E7EB; padding-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
            <span>Q${idx + 1}.</span>
            <span style="color: #4B5563;">[UPSC Mains Mock]</span>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #111827; margin: 0 0 10px 0;">${q.q}</p>
          <div style="border: 1px dashed #D1D5DB; height: 180px; margin-top: 15px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 12px; font-style: italic;">
            [Write your response in this space offline]
          </div>
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>UPSC Mains Question Paper - ${mock.title}</title>
        <style>
          body { font-family: Georgia, serif; color: #1F2937; margin: 0; padding: 40px; background: white; }
          .header { text-align: center; border-bottom: 2px double #1A365D; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 800; font-family: sans-serif; color: #1A365D; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
          .title { font-size: 22px; font-weight: bold; color: #111827; margin: 10px 0; text-transform: uppercase; }
          .meta-info { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #1A365D; border-bottom: 1px solid #1A365D; padding: 8px 0; margin-top: 15px; }
          .instructions { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 15px; border-radius: 6px; font-size: 13px; line-height: 1.5; margin-bottom: 30px; }
          .footer { text-align: center; margin-top: 50px; border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 11px; color: #6B7280; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <button onclick="window.print()" style="background: #1A365D; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: sans-serif;">
            Print / Save as PDF
          </button>
        </div>
        
        <div class="header">
          <div class="logo">KR INSTITUTE OF LEARNING</div>
          <div class="subtitle">Rajahmundry UPSC Civil Services Hub</div>
          <div class="title">${mock.title}</div>
          <div class="meta-info">
            <span>TIME ALLOWED: ${mock.duration || '3 Hours'}</span>
            <span>MAXIMUM MARKS: ${mock.weightage || 250}</span>
          </div>
        </div>

        <div class="instructions">
          <strong>QUESTION PAPER SPECIFIC INSTRUCTIONS:</strong><br/>
          1. Please read each of the following instructions carefully before attempting questions.<br/>
          2. All questions are compulsory. Write answers in the medium authorized in the Admission Certificate.<br/>
          3. Word limit in questions, wherever specified, should be adhered to.<br/>
          4. Any page or portion of the page left blank in the QCA Booklet must be clearly struck off.
        </div>

        <div>${questionsHtml}</div>

        <div class="footer">
          <p>KR Institute of Learning Hub, Rajahmundry. Promoting Offline & Self-Regulatory Evaluation.</p>
          <p>© 2026 KR Institute of Learning. All rights reserved.</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadMainsAnswers = (mock) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to view model answers.");
      return;
    }

    let answersHtml = "";
    mock.questions.forEach((q, idx) => {
      answersHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid; border-bottom: 1.5px solid #E5E7EB; padding-bottom: 25px;">
          <div style="font-weight: bold; margin-bottom: 10px; color: #1A365D; font-size: 16px;">
            QUESTION ${idx + 1}:
          </div>
          <p style="font-size: 15px; font-weight: bold; line-height: 1.6; color: #111827; margin: 0 0 15px 0;">${q.q}</p>
          <div style="background: #F0FDF4; border: 1.5px solid #A7F3D0; border-radius: 8px; padding: 20px;">
            <div style="font-weight: 800; color: #065F46; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #A7F3D0; padding-bottom: 5px;">
              💡 Model Answer Key & Evaluation Framework
            </div>
            <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6; color: #047857; margin: 0;">${q.explanation}</pre>
          </div>
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>UPSC Model Answers - ${mock.title}</title>
        <style>
          body { font-family: Georgia, serif; color: #1F2937; margin: 0; padding: 40px; background: white; }
          .header { text-align: center; border-bottom: 2px double #10B981; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 800; font-family: sans-serif; color: #065F46; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
          .title { font-size: 22px; font-weight: bold; color: #111827; margin: 10px 0; text-transform: uppercase; }
          .meta-info { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #10B981; border-bottom: 1px solid #10B981; padding: 8px 0; margin-top: 15px; }
          .instructions { background: #ECFDF5; border: 1px solid #A7F3D0; padding: 15px; border-radius: 6px; font-size: 13px; line-height: 1.5; margin-bottom: 30px; color: #065F46; }
          .footer { text-align: center; margin-top: 50px; border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 11px; color: #6B7280; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: sans-serif;">
            Print / Save Model Answers
          </button>
        </div>
        
        <div class="header">
          <div class="logo">KR INSTITUTE OF LEARNING</div>
          <div class="subtitle">Rajahmundry UPSC Civil Services Hub</div>
          <div class="title">${mock.title} - MODEL SOLUTIONS</div>
          <div class="meta-info">
            <span>UPSC MAINS WRITTEN MOCK</span>
            <span>MODEL EVALUATION SCHEME</span>
          </div>
        </div>

        <div class="instructions">
          <strong>SELF-EVALUATION GUIDELINES:</strong><br/>
          - Compare your offline answer sheet points with the core frameworks provided below.<br/>
          - Award marks based on coverage of core dimensions: Intro (10%), Key points (70%), Formatting/Structure (10%), Conclusion (10%).<br/>
          - Emphasize maps, flowcharts, and contemporary examples to achieve extra marks.
        </div>

        <div>${answersHtml}</div>

        <div class="footer">
          <p>KR Institute of Learning Hub, Rajahmundry. Self-Assessed Model Key.</p>
          <p>© 2026 KR Institute of Learning. All rights reserved.</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // AI Learning and Fullscreen Proctoring states
  const [learningTopic, setLearningTopic] = useState(null);
  const [learningSubject, setLearningSubject] = useState(null);
  const [learningMessages, setLearningMessages] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMockQuiz, setActiveMockQuiz] = useState(null);
  const [quizWarnings, setQuizWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizDuration, setQuizDuration] = useState(120);
  const [topicLeaderboard, setTopicLeaderboard] = useState([]);

  const [notes, setNotes] = useState([]);
  const [mocks, setMocks] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const prevCourseIdRef = useRef(null);
  const [mainsMocks, setMainsMocks] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [courseAttempts, setCourseAttempts] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [doubtMessages, setDoubtMessages] = useState([]);
  const [doubtQuery, setDoubtQuery] = useState("");
  const [isDoubtSpeaking, setIsDoubtSpeaking] = useState(false);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [detailTab, activeCourse]);

  useEffect(() => {
    if (!activeCourse) return;

    if (prevCourseIdRef.current !== activeCourse.id) {
      prevCourseIdRef.current = activeCourse.id;
      setSelectedSection("");
      return;
    }
    
    const loadCourseNotes = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/courses/${activeCourse.id}/handbooks?title=${encodeURIComponent(activeCourse.title)}`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (err) {
        console.warn("Backend unavailable. Loading offline notes fallback.");
        let subjects = ["Quantitative Aptitude", "Reasoning Ability", "English Language"];
        if (activeCourse.category === "NEET / JEE") {
          subjects = ["Physics", "Chemistry", "Biology / Mathematics"];
        } else if (activeCourse.category === "UPSC / Civil") {
          subjects = ["General Studies I", "General Studies II"];
        } else if (activeCourse.category === "State Exams") {
          subjects = ["General Studies", "Quantitative Aptitude", "General English"];
        } else if (activeCourse.category === "RRB & Railways" || activeCourse.category === "Railways") {
          subjects = ["Quantitative Aptitude", "Reasoning Ability", "General Awareness"];
        } else if (activeCourse.category === "SSC Exams" || activeCourse.category === "SSC") {
          subjects = ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General Awareness"];
        }

        const pagesMap = {
          "Quantitative Aptitude": "14 Pages",
          "Reasoning Ability": "22 Pages",
          "English Language": "18 Pages",
          "General English": "16 Pages",
          "Physics": "25 Pages",
          "Chemistry": "28 Pages",
          "Biology / Mathematics": "32 Pages",
          "General Studies I": "40 Pages",
          "General Studies II": "35 Pages",
          "General Studies": "30 Pages",
          "General Awareness": "24 Pages"
        };

        const timeMap = {
          "Quantitative Aptitude": "15 mins",
          "Reasoning Ability": "25 mins",
          "English Language": "20 mins",
          "General English": "18 mins",
          "Physics": "25 mins",
          "Chemistry": "30 mins",
          "Biology / Mathematics": "35 mins",
          "General Studies I": "45 mins",
          "General Studies II": "40 mins",
          "General Studies": "35 mins",
          "General Awareness": "20 mins"
        };

        const offlineNotes = [];
        let noteCounter = 1;
        
        if (activeCourse.syllabus && activeCourse.syllabus.length > 0) {
          activeCourse.syllabus.forEach(sub => {
            const subjectName = sub.subject;
            sub.concepts.forEach(concept => {
              const conceptName = concept.name;
              
              let pages = "14 Pages";
              let readTime = "15 mins";
              const normConcept = conceptName.toLowerCase();
              if (normConcept.includes("puzzle") || normConcept.includes("history") || normConcept.includes("biology")) {
                readTime = "25 mins";
              } else if (normConcept.includes("interpretation") || normConcept.includes("polity") || normConcept.includes("chemistry")) {
                readTime = "30 mins";
              } else if (normConcept.includes("arithmetic") || normConcept.includes("grammar") || normConcept.includes("physics")) {
                readTime = "20 mins";
              }
              
              offlineNotes.push({
                id: `${activeCourse.id}_notes_${noteCounter}`,
                subject: subjectName,
                concept: conceptName,
                title: `${conceptName} Handbook`,
                pages: pages,
                readTime: readTime,
                summary: `Comprehensive concept reference handbook covering ${conceptName} for the ${activeCourse.title} exam. This guide contains essential formulas, visual explanations, shortcut methodologies, and quick scoring tips prepared by top experts to boost your performance.`,
                downloadUrl: `/api/downloads/notes/${activeCourse.id}_notes_${noteCounter}`
              });
              noteCounter++;
            });
          });
        }
        
        if (offlineNotes.length === 0) {
          subjects.forEach((subj, index) => {
            const pages = "14 Pages";
            const readTime = timeMap[subj] || "20 mins";
            
            offlineNotes.push({
              id: `${activeCourse.id}_notes_${index + 1}`,
              subject: subj,
              title: `${activeCourse.title} ${subj} Master Prep Handbook`,
              pages: pages,
              readTime: readTime,
              summary: `Complete reference handbook and concept notes covering the ${subj} syllabus for ${activeCourse.title}.\n\nContains core formulas, tips, and step-by-step shortcuts to maximize speed and accuracy.\n\nPractice systematically to reinforce concepts.`,
              downloadUrl: `/api/downloads/notes/${activeCourse.id}_notes_${index + 1}`
            });
          });
        }
        setNotes(offlineNotes);
      }
    };

    const loadCourseMocks = async () => {
      try {
        const sectionQuery = selectedSection ? `&section=${encodeURIComponent(selectedSection)}` : "";
        const res = await fetch(`${BACKEND_URL}/api/courses/${activeCourse.id}/mocks?title=${encodeURIComponent(activeCourse.title)}&category=${encodeURIComponent(activeCourse.category)}${sectionQuery}`);
        if (res.ok) {
          const data = await res.json();
          setMocks(data);
        }
      } catch (err) {
        console.warn("Backend unavailable. Loading offline mocks fallback.");
        const pool = generateQuestionsPool(activeCourse.category);
        const offlineMocks = [];
        const timeLimit = activeCourse.category === "NEET / JEE" ? 180 : (activeCourse.category === "UPSC / Civil" || activeCourse.category === "State Exams" ? 120 : (activeCourse.category === "RRB & Railways" || activeCourse.category === "Railways" ? 90 : 60));
        
        let sectionFiltered = false;
        let activePool = pool;
        if (selectedSection && pool.length > 0) {
          const target = selectedSection.toLowerCase().replace(/[^a-z]+/g, "");
          const filteredPool = pool.filter(q => {
            const sec = getSectionName(activeCourse.category, q.question_number, q).toLowerCase().replace(/[^a-z]+/g, "");
            return sec.includes(target) || target.includes(sec);
          });
          if (filteredPool.length > 0) {
            activePool = filteredPool;
            sectionFiltered = true;
          }
        }

        for (let i = 1; i <= 30; i++) {
          let mockQuestions = generateMockQuestionsForCategory(activeCourse.category, activePool, i, activeCourse.title);
          if (sectionFiltered) {
            const target = selectedSection.toLowerCase().replace(/[^a-z]+/g, "");
            mockQuestions = mockQuestions.filter(q => {
              const sec = q.section.toLowerCase().replace(/[^a-z]+/g, "");
              return sec.includes(target) || target.includes(sec);
            });
          }

          const isStage1 = i <= 15;
          const isBank = activeCourse.category === "Bank & Insurance";
          const isSSC = activeCourse.category === "SSC Exams";
          const isRailways = activeCourse.category === "RRB & Railways" || activeCourse.category === "Railways";
          
          let mockTitle = "";
          if (isBank) {
            mockTitle = `${activeCourse.title} ${isStage1 ? "Prelims" : "Mains"} Mock ${isStage1 ? i : i - 15}`;
          } else if (isSSC) {
            mockTitle = `${activeCourse.title} ${isStage1 ? "Tier - I" : "Tier - II"} Mock ${isStage1 ? i : i - 15}`;
          } else if (isRailways) {
            mockTitle = `${activeCourse.title} ${isStage1 ? "CBT - 1" : "CBT - 2"} Mock ${isStage1 ? i : i - 15}`;
          } else {
            mockTitle = `${activeCourse.title} ${isStage1 ? "Stage - I" : "Stage - II"} Mock ${isStage1 ? i : i - 15}`;
          }

          if (sectionFiltered && selectedSection) {
            mockTitle = `${mockTitle} [${selectedSection}]`;
          }
          
          offlineMocks.push({
            id: `${activeCourse.id}_mock_${i}${sectionFiltered ? "_" + selectedSection.replace(/\s+/g, "") : ""}`,
            title: mockTitle,
            duration: sectionFiltered ? "20 Mins" : `${timeLimit} Mins`,
            questions: mockQuestions
          });
        }
        setMocks(offlineMocks);
      }
    };

    const loadCourseMainsMocks = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/courses/${activeCourse.id}/mains-mocks?title=${encodeURIComponent(activeCourse.title)}`);
        if (res.ok) {
          const data = await res.json();
          setMainsMocks(data);
        }
      } catch (err) {
        console.warn("Backend unavailable. Loading offline mains mocks fallback.");
        const offlineMainsMocks = generateMainsMocksForCourseOffline(activeCourse.id, activeCourse.title);
        setMainsMocks(offlineMainsMocks);
      }
    };

    const loadCoursePyqs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/courses/${activeCourse.id}/pyqs?title=${encodeURIComponent(activeCourse.title)}&category=${encodeURIComponent(activeCourse.category)}`);
        if (res.ok) {
          const data = await res.json();
          setPyqs(data);
        }
      } catch (err) {
        console.warn("Backend unavailable. Loading offline PYQ fallback.");
        const pool = generateQuestionsPool(activeCourse.category);
        const offlinePyqs = [];
        for (let i = 1; i <= 10; i++) {
          const qStart = (i + 7) * 10;
          const rStart = 100 + (i + 7) * 10;
          const eStart = 200 + (i + 7) * 5;
          const gStart = 250 + (i + 7) * 5;
          
          const pyqQuestions = [
            ...pool.slice(qStart, qStart + 10),
            ...pool.slice(rStart, rStart + 10),
            ...pool.slice(eStart, eStart + 5),
            ...pool.slice(gStart, gStart + 5)
          ].map(q => ({
            ...q,
            q: q.q.replace("[Exam]", activeCourse.title)
          }));
          
          offlinePyqs.push({
            id: `${activeCourse.id}_pyq_${i}`,
            title: `${activeCourse.title} ${2026 - i} Solved PYQ Paper`,
            duration: "60 Mins",
            questions: pyqQuestions
          });
        }
        setPyqs(offlinePyqs);
      }
    };

    const loadCoursePractice = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/courses/${activeCourse.id}/practice?title=${encodeURIComponent(activeCourse.title)}&category=${encodeURIComponent(activeCourse.category)}`);
        if (res.ok) {
          const data = await res.json();
          setActiveCourse(prev => prev ? { ...prev, practiceModules: data } : null);
        }
      } catch (err) {
        console.warn("Backend unavailable. Loading offline practice fallback.");
      }
    };

    const loadAttempts = async () => {
      try {
        const emailQuery = user ? `?email=${encodeURIComponent(user.email)}` : "";
        const res = await fetch(`${BACKEND_URL}/api/attempts${emailQuery}`);
        if (res.ok) {
          const data = await res.json();
          setCourseAttempts(data);
          return;
        }
      } catch (err) {
        console.warn("Backend unavailable to load attempts. Reading local cache.");
      }
      const saved = localStorage.getItem("kr_attempt_history");
      if (saved) setCourseAttempts(JSON.parse(saved));
    };

    loadCourseNotes();
    loadCourseMocks();
    loadCourseMainsMocks();
    loadCoursePyqs();
    loadCoursePractice();
    loadAttempts();
    
    setDoubtMessages([
      {
        sender: "ai",
        text: `Hello! I am your KR AI Doubt Teacher for **${activeCourse.title}**. Ask me any doubts you have about the concepts, formulas, or syllabus topics, and I will resolve them immediately!`
      }
    ]);
  }, [activeCourse, user, selectedSection]);

  const getFilteredExams = () => {
    let list = courses;
    
    if (selectedPill === "Banking Exams") {
      list = list.filter(c => c.category === "Bank & Insurance");
    } else if (selectedPill === "SSC Exams") {
      list = list.filter(c => c.category === "SSC Exams");
    } else if (selectedPill === "RRB & Railway Exams") {
      list = list.filter(c => c.category === "RRB & Railways");
    } else if (selectedPill === "Civil Services") {
      list = list.filter(c => c.category === "UPSC / Civil");
    } else if (selectedPill === "Government Exams") {
      list = list.filter(c => c.category === "State Exams" && !c.title.toLowerCase().includes("police"));
    } else if (selectedPill === "AP Police") {
      list = list.filter(c => c.category === "State Exams" && c.title.toLowerCase().includes("ap police"));
    } else if (selectedPill === "Telangana Police") {
      list = list.filter(c => c.category === "State Exams" && c.title.toLowerCase().includes("ts police"));
    } else {
      if (selectedCategory) {
        list = list.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase() || 
                             (selectedCategory === "UPSC / Civil" && c.category === "UPSC / Civil") ||
                             (selectedCategory.includes("Railway") && c.category.includes("Railway")));
      }
    }

    if (searchQuery) {
      list = list.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  };

  const filteredExams = getFilteredExams();

  const handleCourseClick = (exam) => {
    requestAuth(() => {
      const courseDetails = {
        ...exam,
        syllabus: (exam.syllabus && exam.syllabus.length > 0) ? exam.syllabus : getSyllabusForCategory(exam.category),
        practiceModules: generatePracticeModulesForCourse(exam)
      };
      setActiveCourse(courseDetails);
      setDetailTab("syllabus");
      setSelectedPracticeSet(null);
      // Reset AI learning states
      setLearningTopic(null);
      setQuizCompleted(false);
    });
  };

  // Daily Quizzes helpers
  const getDailyQuizzes = () => {
    const list = [];
    const baseDate = new Date("2026-06-11");
    for (let i = 0; i < 4; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '/');
      list.push({
        id: `daily_quiz_${i}`,
        title: `${activeCourse.title} - Quiz (${dateStr})`,
        questionsCount: 20,
        marks: 20,
        duration: "10 Min"
      });
    }
    return list;
  };

  const startDailyFreeQuiz = (quizTitle) => {
    const pool = generateQuestionsPool(activeCourse.category);
    // Slice 20 questions for the speed drill
    const quizQuestions = pool.slice(0, 20).map(q => ({
      ...q,
      q: q.q.replace("[Exam]", activeCourse.title)
    }));
    
    setLearningTopic(quizTitle);
    setLearningSubject(activeCourse.title);
    setActiveMockQuiz({
      title: quizTitle,
      questions: quizQuestions
    });
    setQuizAnswers({});
    setQuizWarnings(0);
    setShowWarningModal(false);
    setCurrentQIdx(0);
    setQuizDuration(600); // 10 minutes (600 seconds)
    setTimeLeft(600);
    
    // Enter fullscreen
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(err => console.log(err));
    }
  };

  const handleStartPractice = (practiceSet) => {
    setSelectedPracticeSet(practiceSet);
    setPracticeAnswers({});
    setQuizState({
      currentQuestionIndex: 0,
      selectedOption: null,
      answered: false,
      score: 0,
      completed: false
    });
  };

  const handleOptionSelect = (optionIndex) => {
    if (quizState.answered) return;
    setQuizState(prev => ({
      ...prev,
      selectedOption: optionIndex
    }));
    setPracticeAnswers(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: optionIndex
    }));
  };

  const handleSubmitAnswer = () => {
    if (quizState.selectedOption === null || quizState.answered) return;
    const isCorrect = quizState.selectedOption === selectedPracticeSet.questions[quizState.currentQuestionIndex].correct;
    setQuizState(prev => ({
      ...prev,
      answered: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const handleNextQuestion = async () => {
    const nextIdx = quizState.currentQuestionIndex + 1;
    if (nextIdx < selectedPracticeSet.questions.length) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIdx,
        selectedOption: null,
        answered: false
      }));
    } else {
      const finalScore = quizState.score;
      const totalQs = selectedPracticeSet.questions.length;
      const scorePct = Math.round((finalScore / totalQs) * 100);
      
      const attemptData = {
        email: user?.email || null,
        testName: `Practice: ${selectedPracticeSet.title}`,
        score: scorePct,
        accuracy: scorePct,
        timeSpent: 5,
        details: {
          correct: finalScore,
          incorrect: totalQs - finalScore,
          unattempted: 0
        }
      };

      try {
        const res = await fetch(`${BACKEND_URL}/api/attempts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attemptData)
        });
        if (res.ok) {
          const emailQuery = user ? `?email=${encodeURIComponent(user.email)}` : "";
          const freshAttempts = await fetch(`${BACKEND_URL}/api/attempts${emailQuery}`).then(r => r.json());
          setCourseAttempts(freshAttempts);
        }
      } catch (err) {
        console.warn("Backend API not reachable to save practice attempt, writing locally:", err);
        const savedAttempt = {
          id: `attempt_${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          ...attemptData
        };
        const savedHistory = localStorage.getItem("kr_attempt_history");
        const currentHistory = savedHistory ? JSON.parse(savedHistory) : [];
        const updatedHistory = [savedAttempt, ...currentHistory];
        localStorage.setItem("kr_attempt_history", JSON.stringify(updatedHistory));
        setCourseAttempts(updatedHistory);
      }

      setQuizState(prev => ({
        ...prev,
        completed: true
      }));
    }
  };

  // AI Learning Handlers
  const handleTopicClick = async (topicName) => {
    const topicDetails = TOPIC_DATABASE[topicName] || TOPIC_DATABASE["Simplification & Approximation"];
    setLearningTopic(topicName);
    setLearningSubject(activeCourse.title);
    setLearningMessages([
      {
        sender: "ai",
        text: `Welcome to the AI Learning Room for **${topicName}**! Here is a summary explanation of this topic:\n\n${topicDetails.aiExplanation}\n\nAsk me any questions you have about this, or click the **Start Fullscreen Mock Test** button on the right when you're ready!`
      }
    ]);
    setQuizCompleted(false);
    setActiveMockQuiz(null);
    setQuizWarnings(0);
    setShowWarningModal(false);

    // Fetch leaderboard
    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/${encodeURIComponent(topicName)}/leaderboard`);
      if (res.ok) {
        const board = await res.json();
        setTopicLeaderboard(board);
        return;
      }
    } catch (err) {
      console.warn("Backend leaderboard API unreachable, using local fallback.");
    }
    setTopicLeaderboard(topicDetails.leaderboard || []);
  };

  const speakExplanation = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const cleanText = text.replace(/\*\*/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utterance; // Prevents garbage collection crash in Chrome
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleSendMessage = async () => {
    if (!userQuery.trim()) return;
    const query = userQuery;
    setUserQuery("");
    setLearningMessages(prev => [...prev, { sender: "user", text: query }]);
    
    // Add a temporary typing placeholder
    setLearningMessages(prev => [...prev, { sender: "ai", text: "..." }]);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          courseTitle: activeCourse.title,
          topicName: learningTopic,
          mode: "learn"
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setLearningMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.text === "...") {
            updated.pop();
          }
          return [...updated, { sender: "ai", text: data.reply }];
        });
      } else {
        throw new Error("Backend chat API response not OK");
      }
    } catch (err) {
      console.warn("Backend AI chat API failed, using offline fallback:", err);
      const replyText = generateDynamicAIResponse(query, activeCourse.title, learningTopic);
      setLearningMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.text === "...") {
          updated.pop();
        }
        return [...updated, { sender: "ai", text: replyText }];
      });
    }
  };

  const handleDoubtSendMessage = async () => {
    if (!doubtQuery.trim()) return;
    const query = doubtQuery;
    setDoubtQuery("");
    setDoubtMessages(prev => [...prev, { sender: "user", text: query }]);
    
    setIsProcessingSpeech(true);
    // Add a temporary typing placeholder
    setDoubtMessages(prev => [...prev, { sender: "ai", text: "..." }]);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          courseTitle: activeCourse.title,
          mode: "doubt"
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setDoubtMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.text === "...") {
            updated.pop();
          }
          return [...updated, { sender: "ai", text: data.reply }];
        });
      } else {
        throw new Error("Backend doubt API response not OK");
      }
    } catch (err) {
      console.warn("Backend AI doubt API failed, using offline fallback:", err);
      const replyText = generateDynamicAIResponse(query, activeCourse.title);
      setDoubtMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.text === "...") {
          updated.pop();
        }
        return [...updated, { sender: "ai", text: replyText }];
      });
    } finally {
      setIsProcessingSpeech(false);
    }
  };


  const speakDoubtExplanation = (text) => {
    if ('speechSynthesis' in window) {
      if (isDoubtSpeaking) {
        window.speechSynthesis.cancel();
        setIsDoubtSpeaking(false);
      } else {
        const cleanText = text.replace(/\*\*/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utterance; // Prevents garbage collection crash in Chrome
        utterance.onstart = () => setIsDoubtSpeaking(true);
        utterance.onend = () => setIsDoubtSpeaking(false);
        utterance.onerror = () => setIsDoubtSpeaking(false);
        setIsDoubtSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    
    const entry = {
      name: feedbackName || user?.name || "Anonymous",
      email: feedbackEmail || user?.email || "anon@email.com",
      feedback: feedbackMsg,
      type: "course_doubt"
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        setFeedbackName("");
        setFeedbackEmail("");
        setFeedbackMsg("");
      }
    } catch (err) {
      console.warn("Backend unreachable to log feedback. Simulating success.");
      setFeedbackSubmitted(true);
    }
  };

  // Proctoring Mock Handlers
  const handleStartMockQuiz = () => {
    setActiveMockQuiz(TOPIC_DATABASE[learningTopic] || TOPIC_DATABASE["Simplification & Approximation"]);
    setQuizAnswers({});
    setQuizWarnings(0);
    setShowWarningModal(false);
    setCurrentQIdx(0);
    setQuizDuration(120);
    setTimeLeft(120); // 2 minutes
    
    // Enter fullscreen
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(err => console.log(err));
    }
  };

  const startFullMock = async (mockTest) => {
    let mockQuestions = mockTest.questions;
    const category = activeCourse?.category || "Bank & Insurance";
    
    try {
      const type = category.includes("Bank") ? "Banking" : (category.includes("SSC") ? "SSC" : (category.includes("Rail") ? "RRB" : (category.includes("UPSC") ? "UPSC" : "APPSC Groups")));
      const res = await fetch(`${BACKEND_URL}/api/exam/questions?exam_type=${encodeURIComponent(type)}&sub_type=${encodeURIComponent(mockTest.title)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          mockQuestions = data.questions.map(q => {
            const cleanedOpts = q.options.map(o => typeof o === 'object' && o !== null ? (o.text || o.option_text || "") : o);
            const optImgs = q.option_images || [];
            return {
              q: q.question_text || q.q,
              question_image: q.question_image || "",
              options: cleanedOpts.map((o, idx) => ({
                text: o,
                image: optImgs[idx] || null
              })),
              correct: q.correct_answer ? (q.correct_answer.toUpperCase().charCodeAt(0) - 65) : 0,
              section: q.section || "",
              exam_type: q.exam_type,
              sub_type: q.sub_type,
              explanation: q.explanation || ""
            };
          });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch parsed questions, falling back:", e);
    }
    
    if (!mockQuestions || !Array.isArray(mockQuestions) || mockQuestions.length === 0) {
      const pool = generateQuestionsPool(category);
      const match = mockTest.id?.match(/_(\d+)$/);
      const mockIndex = match ? parseInt(match[1]) : 1;
      mockQuestions = generateMockQuestionsForCategory(category, pool, mockIndex, activeCourse?.title || "Exam");
    }
    
    const timeLimitMins = category === "NEET / JEE" ? 180 : (category === "UPSC / Civil" || category === "State Exams" ? 120 : (category === "RRB & Railways" || category === "Railways" ? 90 : 60));
    const durationSeconds = timeLimitMins * 60;
    
    setLearningTopic(mockTest.title);
    setLearningSubject(activeCourse.title);
    setActiveMockQuiz({
      title: mockTest.title,
      questions: mockQuestions
    });
    setQuizAnswers({});
    setQuizWarnings(0);
    setShowWarningModal(false);
    setCurrentQIdx(0);
    setQuizDuration(durationSeconds);
    setTimeLeft(durationSeconds);
    
    // Enter fullscreen
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(err => console.log(err));
    }
  };

  const handleResumeFullscreen = () => {
    setShowWarningModal(false);
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(err => console.log(err));
    }
  };

  const triggerWarning = () => {
    if (quizCompleted || !activeMockQuiz) return;
    setQuizWarnings(prev => {
      const nextWarnings = prev + 1;
      if (nextWarnings >= 3) {
        setTimeout(() => {
          handleMockSubmit(true); // forced due to violation
        }, 100);
        return 3;
      } else {
        setShowWarningModal(true);
        return nextWarnings;
      }
    });
  };

  const handleMockSubmit = async (forced = false) => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    const questions = activeMockQuiz ? activeMockQuiz.questions : [];
    let correct = 0;
    let incorrect = 0;
    questions.forEach((q, idx) => {
      const ans = quizAnswers[idx];
      if (ans === undefined) {
        // unattempted
      } else if (ans === q.correct) {
        correct++;
      } else {
        incorrect++;
      }
    });
    const scorePct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const timeSpentStr = formatTimeSpent();

    setQuizResults({
      score: scorePct,
      correct,
      incorrect,
      total: questions.length,
      forcedViolation: forced
    });
    setQuizCompleted(true);

    // Save attempt to global attempts list
    const attemptData = {
      email: user?.email || null,
      testName: (activeMockQuiz && activeMockQuiz.title) || learningTopic,
      score: scorePct,
      accuracy: (correct + incorrect) > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0,
      timeSpent: Math.round((quizDuration - timeLeft) / 60) || 1,
      details: {
        correct,
        incorrect,
        unattempted: questions.length - correct - incorrect
      }
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attemptData)
      });
      if (res.ok) {
        const emailQuery = user ? `?email=${encodeURIComponent(user.email)}` : "";
        const freshAttempts = await fetch(`${BACKEND_URL}/api/attempts${emailQuery}`).then(r => r.json());
        setCourseAttempts(freshAttempts);
      }
    } catch (err) {
      console.warn("Backend API not reachable to save attempt, writing locally:", err);
      const savedAttempt = {
        id: `attempt_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        ...attemptData
      };
      const savedHistory = localStorage.getItem("kr_attempt_history");
      const currentHistory = savedHistory ? JSON.parse(savedHistory) : [];
      const updatedHistory = [savedAttempt, ...currentHistory];
      localStorage.setItem("kr_attempt_history", JSON.stringify(updatedHistory));
      setCourseAttempts(updatedHistory);
    }

    // POST to backend leaderboard
    const entry = {
      name: user?.name || "You",
      score: scorePct,
      time: timeSpentStr
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/${encodeURIComponent(learningTopic)}/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const board = await res.json();
        setTopicLeaderboard(board);
        return;
      }
    } catch (err) {
      console.warn("Backend leaderboard API unreachable, using local fallback.");
    }

    const baseLeaderboard = TOPIC_DATABASE[learningTopic]?.leaderboard || [];
    const combined = [...baseLeaderboard, entry].sort((a, b) => b.score - a.score);
    setTopicLeaderboard(combined);
  };

  const formatTimeSpent = () => {
    const secondsUsed = quizDuration - timeLeft;
    const m = Math.floor(secondsUsed / 60);
    const s = secondsUsed % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  useEffect(() => {
    if (!activeMockQuiz || quizCompleted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerWarning();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerWarning();
      }
    };

    const handleBlur = () => {
      triggerWarning();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleMockSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      clearInterval(timerInterval);
    };
  }, [activeMockQuiz, quizCompleted]);

  if (activeCourse) {
    // If learning a topic inside AI room
    if (learningTopic) {
      if (activeMockQuiz) {
        if (quizCompleted) {
          // Render Leaderboard & Analytics view
          const combinedLeaderboard = topicLeaderboard.length > 0 ? topicLeaderboard : (() => {
            const baseLeaderboard = TOPIC_DATABASE[learningTopic]?.leaderboard || [];
            const userAttempt = {
              name: user?.name || "You",
              score: quizResults.score,
              time: formatTimeSpent()
            };
            return [...baseLeaderboard, userAttempt].sort((a, b) => b.score - a.score);
          })();

          return (
            <div className="analytics-lobby">
              <div className="lobby-header">
                <h2>📊 Mock Results & Topic Analytics</h2>
                <p>Topic: {learningTopic} &bull; Practice Session Performance</p>
              </div>

              {quizResults.forcedViolation ? (
                <div className="violation-banner">
                  <AlertTriangle size={24}/>
                  <div>
                    <h4>Mock Exam Terminated due to Proctoring Violation</h4>
                    <p>Your session was submitted automatically after 3 warnings for escaping fullscreen or switching windows.</p>
                  </div>
                </div>
              ) : (
                <div className="success-banner">
                  <CheckCircle size={24}/>
                  <div>
                    <h4>Exam Submitted Successfully!</h4>
                    <p>Great job completing the mock test under strict proctored conditions.</p>
                  </div>
                </div>
              )}

              <div className="lobby-row">
                <div className="lobby-card score-card">
                  <h3>Your Score Summary</h3>
                  <div className="score-ring">
                    <div className="score-number">{quizResults.score}%</div>
                    <span>Score</span>
                  </div>
                  <div className="stats-breakdown">
                    <div>
                      <strong>{quizResults.correct}</strong>
                      <span>Correct</span>
                    </div>
                    <div>
                      <strong>{quizResults.incorrect}</strong>
                      <span>Incorrect</span>
                    </div>
                    <div>
                      <strong>{quizResults.total}</strong>
                      <span>Total Qs</span>
                    </div>
                  </div>
                </div>

                <div className="lobby-card leaderboard-card">
                  <h3>🏆 Topic Leaderboard</h3>
                  <p className="leaderboard-sub">Rankings compared to topper attempt records</p>
                  <div className="leaderboard-list">
                    {combinedLeaderboard.map((item, idx) => {
                      const isUser = item.name === (user?.name || "You");
                      return (
                        <div key={idx} className={`leaderboard-row ${isUser ? "user-row" : ""}`}>
                          <div className="rank">#{idx + 1}</div>
                          <div className="name">{item.name} {isUser && "(You)"}</div>
                          <div className="score">{item.score}%</div>
                          <div className="time">{item.time}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lobby-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn-lobby-finish" onClick={() => { setLearningTopic(null); setQuizCompleted(false); setActiveMockQuiz(null); }}>
                  Return to Syllabus Dashboard &rarr;
                </button>
                <button className="btn-lobby-pdf" onClick={() => handleDownloadPracticePdf(activeMockQuiz, quizAnswers, quizResults.correct)} style={{ background: 'var(--blue)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
                  📥 Download Scorecard PDF
                </button>
              </div>

              <div style={{ marginTop: '24px', background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'left' }}>
                <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '800' }}>Detailed Questions Review</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeMockQuiz.questions.map((q, idx) => {
                    const selectedOpt = quizAnswers[idx];
                    const isCorrect = selectedOpt === q.correct;
                    const isUnattempted = selectedOpt === undefined;

                    return (
                      <div key={idx} style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: isCorrect ? '#A7F3D0' : isUnattempted ? '#CBD5E1' : '#FCA5A5',
                        background: isCorrect ? 'var(--gold-bg)' : isUnattempted ? 'var(--bg)' : 'rgba(239, 68, 68, 0.05)',
                        color: 'var(--text)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                            Question {idx + 1}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            background: isCorrect ? 'var(--green)' : isUnattempted ? 'var(--muted)' : 'var(--red)',
                            color: 'white'
                          }}>
                            {isCorrect ? '✓ Correct' : isUnattempted ? '⚠️ Unattempted' : '✗ Incorrect'}
                          </span>
                        </div>
                        <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px' }}>{q.q}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {q.options.map((opt, oIdx) => {
                            const isCorrectOpt = oIdx === q.correct;
                            const isSelectedOpt = oIdx === selectedOpt;
                            let style = {
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              border: '1px solid var(--border)',
                              background: 'var(--white)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            };
                            if (isCorrectOpt) {
                              style.background = 'rgba(16, 185, 129, 0.1)';
                              style.borderColor = 'var(--green)';
                              style.fontWeight = 'bold';
                            } else if (isSelectedOpt) {
                              style.background = 'rgba(239, 68, 68, 0.1)';
                              style.borderColor = 'var(--red)';
                              style.fontWeight = 'bold';
                            }
                            return (
                              <div key={oIdx} style={style}>
                                <span style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: isCorrectOpt ? 'var(--green)' : isSelectedOpt ? 'var(--red)' : 'var(--muted)',
                                  color: 'white',
                                  fontSize: '9px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '800'
                                }}>{String.fromCharCode(65 + oIdx)}</span>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '12.5px', color: 'var(--text)', opacity: 0.9 }}>
                            <strong>💡 Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        // Render Fullscreen Proctoring Mock Player
        const questions = activeMockQuiz.questions;
        const mockData = {
          questions: questions.map((q, idx) => ({
            question_number: idx + 1,
            question_text: q.q || q.question_text || "",
            options: (q.options || []).map((opt, oIdx) => ({
              id: String.fromCharCode(65 + oIdx),
              text: typeof opt === 'object' && opt.text ? opt.text : opt
            })),
            correct_answer: q.correct_answer || String.fromCharCode(65 + (q.correct !== undefined ? q.correct : 0)),
            exam_type: q.exam_type || "SSC", // Fallback to SSC pattern if not predefined
            sub_type: q.sub_type || "Topic Quiz",
            section: q.section || ""
          }))
        };

        return (
          <MockTestScreen
            mockData={mockData}
            user={user}
            onSubmit={(result) => {
              setQuizResults({
                score: result.score,
                correct: result.details.correct,
                incorrect: result.details.incorrect,
                total: result.details.correct + result.details.incorrect + result.details.unattempted,
                forcedViolation: false
              });
              setQuizCompleted(true);
              setActiveMockQuiz(null);
            }}
          />
        );
      }

      // Render Concept Study Room
      const topicDetails = TOPIC_DATABASE[learningTopic] || TOPIC_DATABASE["Simplification & Approximation"];
      return (
        <div className="ai-learning-room">
          <div className="cd-header">
            <button className="btn-back" onClick={() => { setLearningTopic(null); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setIsSpeaking(false); }}>
              &larr; Back to Syllabus
            </button>
            <div className="cd-title-block">
              <span className="cd-badge" style={{ background: "var(--navy)" }}>Study Room</span>
              <h1>{learningTopic}</h1>
              <p>Subject: {learningSubject} &bull; Review the study notes below before attempting the mock exam.</p>
            </div>
          </div>

          <div className="ai-room-layout">
            <div className="ai-chat-pane" style={{ background: "var(--bg-light)", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
              <div className="ai-chat-header" style={{ borderBottom: "1px solid var(--border)", padding: "16px 20px" }}>
                <div className="ai-tutor-avatar" style={{ background: "var(--navy-light)" }}>📖</div>
                <div>
                  <h4 style={{ color: "var(--navy)" }}>Concept Explanation & Notes</h4>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>KR Institute of Learning Handbook</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: "24px", overflowY: "auto", lineHeight: "1.7" }}>
                {renderFormattedMessage(topicDetails.aiExplanation, "ai")}
                
                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                  <button className="btn-speak" onClick={() => speakExplanation(topicDetails.aiExplanation)} style={{ padding: "10px 16px" }}>
                    {isSpeaking ? <VolumeX size={14}/> : <Volume2 size={14}/>} {isSpeaking ? "Stop Voice Reader" : "Listen Verbally"}
                  </button>
                </div>
              </div>
            </div>

            <div className="ai-sidebar-pane">
              <div className="ai-guide-card">
                <h3>🚀 Ready for your Mock Test?</h3>
                <p>Once you've understood the concept, start the fullscreen mock exam. It will evaluate your speed and accuracy under strict test conditions.</p>
                
                <div className="rules-warning-box">
                  <h5>⚠️ Exam Rules:</h5>
                  <ul>
                    <li>The test runs in <strong>Strict Fullscreen Mode</strong>.</li>
                    <li>Tab switching or exiting fullscreen triggers a warning.</li>
                    <li><strong>Exactly 3 warnings</strong> will disqualify and submit your exam.</li>
                  </ul>
                </div>

                <button className="btn-start-fullscreen-mock" onClick={handleStartMockQuiz}>
                  Start Fullscreen Mock Test &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="course-dashboard">
        <div className="cd-header no-print">
          <div className="cd-header-top-row">
            <button className="btn-back" onClick={() => { setActiveCourse(null); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setIsDoubtSpeaking(false); }}>
              <ChevronLeft size={16}/> Back to Exams Grid
            </button>
            <button className="btn-download-pdf" onClick={() => handleDownloadSyllabusPdf(activeCourse)}>
              📥 Download Syllabus (PDF)
            </button>
          </div>
          <div className="cd-title-block">
            <span className="cd-badge" style={{ background: "var(--navy)" }}>{activeCourse.category}</span>
            <h1>{activeCourse.title} Preparation Course</h1>
            <p>Welcome to your study console. Access all lessons, study materials, mock evaluations, and custom doubt clearers.</p>
          </div>
        </div>

        <div className="cd-split-layout">
          {/* Sidebar Menu */}
          <aside className="cd-sidebar no-print">
            <div className="cd-sidebar-menu">
              <button className={`cd-side-menu-btn ${detailTab === "syllabus" ? "active" : ""}`} onClick={() => { setDetailTab("syllabus"); setSelectedPracticeSet(null); setActiveNote(null); }}>
                📚 Syllabus & Lessons
              </button>
              <button className={`cd-side-menu-btn ${detailTab === "notes" ? "active" : ""}`} onClick={() => { setDetailTab("notes"); setSelectedPracticeSet(null); setActiveNote(null); }}>
                📓 Study Handbooks
              </button>
              <button className={`cd-side-menu-btn ${detailTab === "practice" ? "active" : ""}`} onClick={() => { setDetailTab("practice"); setSelectedPracticeSet(null); setActiveNote(null); }}>
                ✍️ Sectional Quizzes
              </button>
              <button className="cd-side-menu-btn" onClick={() => { navigate("mocktests"); }}>
                🏆 Mock Exams
              </button>
              <button className={`cd-side-menu-btn ${detailTab === "pyqs" ? "active" : ""}`} onClick={() => { setDetailTab("pyqs"); setSelectedPracticeSet(null); setActiveNote(null); }}>
                📜 Solved PYQs
              </button>
              <button className={`cd-side-menu-btn ${detailTab === "analytics" ? "active" : ""}`} onClick={() => { setDetailTab("analytics"); setSelectedPracticeSet(null); setActiveNote(null); }}>
                📊 Results & Analytics
              </button>

              <button className={`cd-side-menu-btn ${detailTab === "more" ? "active" : ""}`} onClick={() => { setDetailTab("more"); setSelectedPracticeSet(null); setActiveNote(null); }}>
                🚀 Future Scope & More
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="cd-main-content">
            {detailTab === "syllabus" && (
              <div className="syllabus-section-view">
                <h2>Syllabus Breakdown</h2>
                <p className="syllabus-sub">Detailed topics. Click any topic to study key concepts and start proctored mock tests.</p>
                
                <div className="syllabus-list">
                  {activeCourse.syllabus.map((subjectGroup, sIndex) => (
                    <div className="syllabus-card" key={sIndex}>
                      <div className="syllabus-card-header">
                        <h3>{subjectGroup.subject}</h3>
                      </div>
                      <div className="syllabus-table-wrapper">
                        <table className="syllabus-table">
                          <thead>
                            <tr>
                              <th>Concept / Topic Name</th>
                              <th>Expected Weightage</th>
                              <th>Avg. Difficulty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subjectGroup.concepts.map((concept, cIndex) => (
                              <tr key={cIndex}>
                                <td 
                                  className="concept-name clickable-topic" 
                                  onClick={() => handleTopicClick(concept.name)}
                                  title="Click to study concept & start mock"
                                >
                                  📖 {concept.name} <span className="learn-badge">Study Topic &rarr;</span>
                                </td>
                                <td><span className="weight-badge">{concept.weightage}</span></td>
                                <td>
                                  <span className={`diff-badge ${concept.difficulty.toLowerCase()}`}>
                                    {concept.difficulty}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === "notes" && (
              <div className="notes-section-view">
                <h2>Subject Study Handbooks</h2>
                <p className="syllabus-sub">Access and read core concept handbooks prepared by KR Institute of Learning toppers.</p>
                
                {activeNote ? (
                  <div className="active-note-reader">
                    <button className="btn-back-notes no-print" onClick={() => setActiveNote(null)}>
                      &larr; Back to Notes List
                    </button>
                    <div className="note-paper-view printable-note-area">
                      <div className="note-paper-header">
                        <span className="note-subject-tag">{activeNote.subject}</span>
                        <h1>{activeNote.title}</h1>
                        <div className="note-meta">
                          <span>⏱️ {activeNote.readTime} reading time</span> &bull; 
                          <span>📄 {activeNote.pages}</span>
                        </div>
                      </div>
                      <div className="note-paper-content">
                        {activeNote.summary.split('\n').map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>
                      <div className="note-paper-footer">
                        <p>© KR Institute of Learning, Rajahmundry. Unauthorized distribution is prohibited.</p>
                      </div>
                    </div>
                    <div className="note-reader-actions no-print">
                      <a href={`${BACKEND_URL}${activeNote.downloadUrl}`} className="btn-download-notes-file" download>
                        📥 Download Notes Text File
                      </a>
                      <button className="btn-print-notes-view" onClick={() => window.print()}>
                        🖨️ Print / Save as PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="notes-list-grid">
                    {notes.map(note => (
                      <div className="note-card" key={note.id}>
                        <div className="note-card-header">
                          <span className="note-subject">{note.subject}</span>
                          <span className="note-pages">{note.pages}</span>
                        </div>
                        <h3>{note.title}</h3>
                        <p>{cleanNotePreviewText(note.summary)}</p>
                        <div className="note-card-footer">
                          <button className="btn-read-online" onClick={() => setActiveNote(note)}>
                            📖 Read Online
                          </button>
                          <a href={`${BACKEND_URL}${note.downloadUrl}`} className="btn-download-file" download>
                            📥 Download File
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detailTab === "practice" && !selectedPracticeSet && (
              <div className="practice-section-view">
                {/* Daily Free Quizzes Carousel Section */}
                <div className="daily-quizzes-carousel-section">
                  <div className="daily-quizzes-heading">
                    <h2>DAILY UPDATED FREE QUIZZES</h2>
                    <span className="quizzes-free-badge">Free</span>
                  </div>
                  <p className="practice-sub">Daily updated speed drills to sharpen your timing and command of core concepts.</p>
                  
                  <div className="daily-quizzes-carousel">
                    {getDailyQuizzes().map((quiz) => (
                      <div className="daily-quiz-card" key={quiz.id}>
                        <div className="daily-quiz-card-header">
                          <span className="quiz-clock-icon">⏱️</span>
                          <span className="quiz-duration-badge">{quiz.duration}</span>
                        </div>
                        <h4>{quiz.title}</h4>
                        <div className="daily-quiz-stats-grid">
                          <div className="quiz-stat-box">
                            <span className="stat-label">Question</span>
                            <span className="stat-value">{quiz.questionsCount}</span>
                          </div>
                          <div className="quiz-stat-box">
                            <span className="stat-label">Marks</span>
                            <span className="stat-value">{quiz.marks}</span>
                          </div>
                          <div className="quiz-stat-box">
                            <span className="stat-label">Minute</span>
                            <span className="stat-value">{quiz.duration.split(" ")[0]}</span>
                          </div>
                        </div>
                        <button className="btn-start-daily-quiz" onClick={() => startDailyFreeQuiz(quiz.title)}>
                          Start Quiz
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="practice-header-row" style={{ marginTop: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2>Sectional Quizzes</h2>
                    <span style={{ background: 'var(--accent)', color: 'var(--navy-text)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', fontFamily: 'Sora, sans-serif' }}>🟢 4 Quizzes Free</span>
                  </div>
                  <p className="practice-sub">Strengthen your concepts by solving topic-wise quizzes with explanations.</p>
                </div>
                
                {(() => {
                  const stage1Label = activeCourse.category === "Bank & Insurance" ? "Prelims Sectional Quizzes" : (activeCourse.category === "SSC Exams" ? "Tier - I Sectional Quizzes" : (activeCourse.category === "RRB & Railways" ? "CBT - 1 Sectional Quizzes" : "Stage - I Sectional Quizzes"));
                  const stage2Label = activeCourse.category === "Bank & Insurance" ? "Mains Sectional Quizzes" : (activeCourse.category === "SSC Exams" ? "Tier - II Sectional Quizzes" : (activeCourse.category === "RRB & Railways" ? "CBT - 2 Sectional Quizzes" : "Stage - II Sectional Quizzes"));
                  
                  const stage1Modules = activeCourse.practiceModules.filter((m, idx) => m.stage === "Prelims" || m.stage === "Tier - I" || m.stage === "CBT - 1" || m.stage === "Stage - I" || idx < 25);
                  const stage2Modules = activeCourse.practiceModules.filter((m, idx) => m.stage === "Mains" || m.stage === "Tier - II" || m.stage === "CBT - 2" || m.stage === "Stage - II" || idx >= 25);
                  
                  return (
                    <div className="mocks-accordion-container" style={{ marginBottom: "30px" }}>
                      {/* Stage I Accordion */}
                      <div className="mocks-accordion-group">
                        <div 
                          className={`mocks-accordion-header ${practiceAccordionOpen.stage1 ? "open" : ""}`}
                          onClick={() => setPracticeAccordionOpen(prev => ({ ...prev, stage1: !prev.stage1 }))}
                        >
                          <div className="header-info">
                            <h3>{stage1Label}</h3>
                            <span className="papers-count">{stage1Modules.length} Quizzes</span>
                          </div>
                          <ChevronDown className="accordion-chevron" size={20} />
                        </div>
                        {practiceAccordionOpen.stage1 && (
                          <div className="practice-modules-grid accordion-content">
                            {stage1Modules.map((pSet, idx) => {
                              const locked = getQuizLockStatus(idx);
                              return (
                                <div className="practice-card" key={pSet.id} style={{ opacity: locked ? 0.85 : 1 }}>
                                  <div className="practice-card-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span>{pSet.subject}</span>
                                    {locked && <span style={{ background: 'var(--red)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>🔒 Premium</span>}
                                  </div>
                                  <h3>{pSet.title}</h3>
                                  <div className="practice-card-meta">
                                    <span>📝 {pSet.questions.length} Questions</span>
                                    <span>⏱️ Quiz mode</span>
                                  </div>
                                  <button 
                                    className="btn-practice-start" 
                                    onClick={() => {
                                      if (locked) {
                                        alert("This is a premium sectional quiz. Please unlock the course package to attempt.");
                                        navigate("mocktests");
                                        setTimeout(() => {
                                          const checkoutElem = document.querySelector(".discount-packages-container");
                                          if (checkoutElem) checkoutElem.scrollIntoView({ behavior: "smooth" });
                                        }, 100);
                                      } else {
                                        handleStartPractice(pSet);
                                      }
                                    }}
                                    style={{ background: locked ? 'var(--muted)' : '' }}
                                  >
                                    {locked ? "🔒 Unlock Sectional Quiz" : <>Start Sectional Quiz &rarr;</>}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Stage II Accordion */}
                      <div className="mocks-accordion-group" style={{ marginTop: '16px' }}>
                        <div 
                          className={`mocks-accordion-header ${practiceAccordionOpen.stage2 ? "open" : ""}`}
                          onClick={() => setPracticeAccordionOpen(prev => ({ ...prev, stage2: !prev.stage2 }))}
                        >
                          <div className="header-info">
                            <h3>{stage2Label}</h3>
                            <span className="papers-count">{stage2Modules.length} Quizzes</span>
                          </div>
                          <ChevronDown className="accordion-chevron" size={20} />
                        </div>
                        {practiceAccordionOpen.stage2 && (
                          <div className="practice-modules-grid accordion-content">
                            {stage2Modules.map((pSet, idx) => {
                              const locked = getQuizLockStatus(idx);
                              return (
                                <div className="practice-card" key={pSet.id} style={{ opacity: locked ? 0.85 : 1 }}>
                                  <div className="practice-card-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span>{pSet.subject}</span>
                                    {locked && <span style={{ background: 'var(--red)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>🔒 Premium</span>}
                                  </div>
                                  <h3>{pSet.title}</h3>
                                  <div className="practice-card-meta">
                                    <span>📝 {pSet.questions.length} Questions</span>
                                    <span>⏱️ Quiz mode</span>
                                  </div>
                                  <button 
                                    className="btn-practice-start" 
                                    onClick={() => {
                                      if (locked) {
                                        alert("This is a premium sectional quiz. Please unlock the course package to attempt.");
                                        navigate("mocktests");
                                        setTimeout(() => {
                                          const checkoutElem = document.querySelector(".discount-packages-container");
                                          if (checkoutElem) checkoutElem.scrollIntoView({ behavior: "smooth" });
                                        }, 100);
                                      } else {
                                        handleStartPractice(pSet);
                                      }
                                    }}
                                    style={{ background: locked ? 'var(--muted)' : '' }}
                                  >
                                    {locked ? "🔒 Unlock Sectional Quiz" : <>Start Sectional Quiz &rarr;</>}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {detailTab === "practice" && selectedPracticeSet && (
              <div className="practice-quiz-wrapper">
                <div className="pq-header">
                  <button className="btn-back-practice" onClick={() => setSelectedPracticeSet(null)}>
                    &larr; Back to Quiz List
                  </button>
                  <h3>{selectedPracticeSet.title}</h3>
                </div>

                {!quizState.completed ? (
                  <div className="pq-quiz-card">
                    <div className="pq-progress-bar">
                      <div 
                        className="pq-progress-fill" 
                        style={{ width: `${((quizState.currentQuestionIndex + 1) / selectedPracticeSet.questions.length) * 100}%` }}
                      />
                      <span className="pq-progress-text">
                        Question {quizState.currentQuestionIndex + 1} of {selectedPracticeSet.questions.length}
                      </span>
                    </div>

                    <div className="pq-question">
                      {selectedPracticeSet.questions[quizState.currentQuestionIndex].q}
                    </div>

                    <div className="pq-options">
                      {selectedPracticeSet.questions[quizState.currentQuestionIndex].options.map((option, oIdx) => {
                        let optionClass = "";
                        if (quizState.answered) {
                          const correctIdx = selectedPracticeSet.questions[quizState.currentQuestionIndex].correct;
                          if (oIdx === correctIdx) {
                            optionClass = "correct";
                          } else if (quizState.selectedOption === oIdx) {
                            optionClass = "incorrect";
                          }
                        } else if (quizState.selectedOption === oIdx) {
                          optionClass = "selected";
                        }

                        return (
                          <button 
                            key={oIdx}
                            className={`pq-option-btn ${optionClass}`}
                            onClick={() => handleOptionSelect(oIdx)}
                            disabled={quizState.answered}
                          >
                            <span className="pq-option-letter">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="pq-option-text">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pq-actions">
                      {!quizState.answered ? (
                        <button 
                          className="btn-pq-submit"
                          onClick={handleSubmitAnswer}
                          disabled={quizState.selectedOption === null}
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button className="btn-pq-next" onClick={handleNextQuestion}>
                          {quizState.currentQuestionIndex + 1 === selectedPracticeSet.questions.length ? "Finish Quiz" : "Next Question"}
                        </button>
                      )}
                    </div>

                    {quizState.answered && (
                      <div className="pq-explanation-card">
                        <h4>💡 Detailed Explanation:</h4>
                        <p>{selectedPracticeSet.questions[quizState.currentQuestionIndex].explanation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pq-results-summary" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--white)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div className="pq-results-icon" style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>🏆</div>
                    <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Sectional Quiz Completed!</h2>
                    <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '20px' }}>Great effort! Here is your performance review and score.</p>
                    
                    <div className="pq-score-pill" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '24px' }}>
                      <span style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold' }}>
                        Score: {quizState.score} / {selectedPracticeSet.questions.length}
                      </span>
                      <span style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold' }}>
                        Accuracy: {Math.round((quizState.score / selectedPracticeSet.questions.length) * 100)}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '30px' }}>
                      <button className="btn-pq-retry" onClick={() => handleStartPractice(selectedPracticeSet)} style={{ background: 'var(--border)', color: 'var(--text)', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
                        Retry Quiz
                      </button>
                      <button className="btn-pq-finish" onClick={() => setSelectedPracticeSet(null)} style={{ background: 'var(--border)', color: 'var(--text)', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
                        Back to Quiz List
                      </button>
                      <button className="btn-pq-pdf" onClick={() => handleDownloadPracticePdf(selectedPracticeSet, practiceAnswers, quizState.score)} style={{ background: 'var(--blue)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
                        📥 Download PDF Report
                      </button>
                    </div>

                    <div style={{ textAlign: 'left', marginTop: '24px', borderTop: '2px solid var(--border)', paddingTop: '20px' }}>
                      <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '800' }}>Detailed Questions Review</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {selectedPracticeSet.questions.map((q, idx) => {
                          const selectedOpt = practiceAnswers[idx];
                          const isCorrect = selectedOpt === q.correct;
                          
                          return (
                            <div key={idx} style={{
                              padding: '16px',
                              borderRadius: '8px',
                              border: '1.5px solid',
                              borderColor: isCorrect ? '#A7F3D0' : '#FCA5A5',
                              background: isCorrect ? 'var(--gold-bg)' : 'rgba(239, 68, 68, 0.05)',
                              color: 'var(--text)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                                  Question {idx + 1}
                                </span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '20px',
                                  background: isCorrect ? 'var(--green)' : 'var(--red)',
                                  color: 'white'
                                }}>
                                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                              </div>
                              <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px' }}>{q.q}</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {q.options.map((opt, oIdx) => {
                                  const isCorrectOpt = oIdx === q.correct;
                                  const isSelectedOpt = oIdx === selectedOpt;
                                  let style = {
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12.5px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--white)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  };
                                  if (isCorrectOpt) {
                                    style.background = 'rgba(16, 185, 129, 0.1)';
                                    style.borderColor = 'var(--green)';
                                    style.fontWeight = 'bold';
                                  } else if (isSelectedOpt) {
                                    style.background = 'rgba(239, 68, 68, 0.1)';
                                    style.borderColor = 'var(--red)';
                                    style.fontWeight = 'bold';
                                  }
                                  return (
                                    <div key={oIdx} style={style}>
                                      <span style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        background: isCorrectOpt ? 'var(--green)' : isSelectedOpt ? 'var(--red)' : 'var(--muted)',
                                        color: 'white',
                                        fontSize: '9px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '800'
                                      }}>{String.fromCharCode(65 + oIdx)}</span>
                                      {opt}
                                    </div>
                                  );
                                })}
                              </div>
                              {q.explanation && (
                                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '12.5px', color: 'var(--text)', opacity: 0.9 }}>
                                  <strong>💡 Explanation:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {detailTab === "mocks" && (
              <div className="mocks-section-view">
                <h2>{activeCourse.title} Full & Section Mock Exams</h2>
                <p className="syllabus-sub">Take full-length or section-wise mock tests under a proctored environment. Exiting fullscreen mode will issue warnings.</p>
                
                <div className="section-filter-container" style={{ margin: "20px 0", display: "flex", gap: "10px", alignItems: "center" }}>
                  <label htmlFor="section-filter" style={{ fontWeight: "bold", color: "var(--light)" }}>Select Test Type:</label>
                  <select 
                    id="section-filter" 
                    value={selectedSection} 
                    onChange={(e) => setSelectedSection(e.target.value)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "var(--card-bg)",
                      color: "var(--light)",
                      border: "1px solid var(--border-color)",
                      cursor: "pointer"
                    }}
                  >
                    <option value="">Full Paper</option>
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Reasoning Ability">Reasoning Ability</option>
                    <option value="English Language">English Language</option>
                    <option value="General Awareness">General Awareness</option>
                  </select>
                </div>

                
                <div className="mocks-accordion-container" style={{ marginBottom: "30px" }}>
                  {/* Stage I Accordion */}
                  <div className="mocks-accordion-group">
                    <div 
                      className={`mocks-accordion-header ${accordionOpen.stage1 ? "open" : ""}`}
                      onClick={() => setAccordionOpen(prev => ({ ...prev, stage1: !prev.stage1 }))}
                    >
                      <div className="header-info">
                        <h3>{activeCourse.title} {activeCourse.category === "Bank & Insurance" ? "Prelims Mock Tests" : (activeCourse.category === "SSC Exams" ? "Tier - I Mock Tests" : (activeCourse.category === "RRB & Railways" ? "CBT - 1 Mock Tests" : "Stage - I Mock Tests"))}</h3>
                        <span className="papers-count">{mocks.slice(0, 15).length} Test Papers</span>
                      </div>
                      <ChevronDown className="accordion-chevron" size={20} />
                    </div>
                    {accordionOpen.stage1 && (
                      <div className="mocks-list-grid accordion-content">
                        {mocks.slice(0, 15).map((mock, idx) => {
                          const isFree = idx === 0;
                          const locked = !isPrelimsUnlocked && !isFree;
                          return (
                            <div className="mock-card" key={mock.id} style={{ opacity: locked ? 0.85 : 1 }}>
                              <div className="mock-card-header">
                                <span className="mock-badge">{isFree ? "Free Mock" : "Full Mock"}</span>
                                <span className="mock-duration">⏱ {mock.duration}</span>
                                {locked && <span className="lock-badge-premium" style={{ background: "var(--red)", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>🔒 Locked</span>}
                              </div>
                              <h3>{mock.title}</h3>
                              <div className="mock-details">
                                <span>📝 {Array.isArray(mock.questions) && mock.questions.length > 0 ? `${mock.questions.length} Questions` : "No Questions Available"}</span> &bull; 
                                <span>🏆 Strictly Proctored</span>
                              </div>
                              <button 
                                className="btn-start-mock-test" 
                                onClick={() => {
                                  if (locked) {
                                    alert("This is a premium mock test. Please unlock the course package to attempt.");
                                    const checkoutElem = document.querySelector(".discount-packages-container");
                                    if (checkoutElem) checkoutElem.scrollIntoView({ behavior: "smooth" });
                                  } else {
                                    if (Array.isArray(mock.questions) && mock.questions.length === 0) {
                                      alert("No Questions Available for this mock test yet.");
                                      return;
                                    }
                                    startFullMock(mock);
                                  }
                                }}
                                style={{ background: locked ? "var(--muted)" : "" }}
                              >
                                {locked ? "🔒 Unlock Premium Test" : "Start Proctored Test →"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Stage II Accordion */}
                  <div className="mocks-accordion-group" style={{ marginTop: '16px' }}>
                    <div 
                      className={`mocks-accordion-header ${accordionOpen.stage2 ? "open" : ""}`}
                      onClick={() => setAccordionOpen(prev => ({ ...prev, stage2: !prev.stage2 }))}
                    >
                      <div className="header-info">
                        <h3>{activeCourse.title} {activeCourse.category === "Bank & Insurance" ? "Mains Mock Tests" : (activeCourse.category === "SSC Exams" ? "Tier - II Mock Tests" : (activeCourse.category === "RRB & Railways" ? "CBT - 2 Mock Tests" : "Stage - II Mock Tests"))}</h3>
                        <span className="papers-count">{mocks.slice(15).length} Test Papers</span>
                      </div>
                      <ChevronDown className="accordion-chevron" size={20} />
                    </div>
                    {accordionOpen.stage2 && (
                      <div className="mocks-list-grid accordion-content">
                        {mocks.slice(15).map(mock => {
                          const locked = !isMainsUnlocked;
                          return (
                            <div className="mock-card" key={mock.id} style={{ opacity: locked ? 0.85 : 1 }}>
                              <div className="mock-card-header">
                                <span className="mock-badge">Full Mock</span>
                                <span className="mock-duration">⏱ {mock.duration}</span>
                                {locked && <span className="lock-badge-premium" style={{ background: "var(--red)", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>🔒 Locked</span>}
                              </div>
                              <h3>{mock.title}</h3>
                              <div className="mock-details">
                                <span>📝 {Array.isArray(mock.questions) && mock.questions.length > 0 ? `${mock.questions.length} Questions` : "No Questions Available"}</span> &bull; 
                                <span>🏆 Strictly Proctored</span>
                              </div>
                              <button 
                                className="btn-start-mock-test" 
                                onClick={() => {
                                  if (locked) {
                                    alert("This is a premium mock test. Please unlock the course package to attempt.");
                                    const checkoutElem = document.querySelector(".discount-packages-container");
                                    if (checkoutElem) checkoutElem.scrollIntoView({ behavior: "smooth" });
                                  } else {
                                    if (Array.isArray(mock.questions) && mock.questions.length === 0) {
                                      alert("No Questions Available for this mock test yet.");
                                      return;
                                    }
                                    startFullMock(mock);
                                  }
                                }}
                                style={{ background: locked ? "var(--muted)" : "" }}
                              >
                                {locked ? "🔒 Unlock Premium Test" : "Start Proctored Test →"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* UPSC Mains Offline Descriptive Mocks Accordion */}
                  {(activeCourse.category === "UPSC / Civil" || activeCourse.id.includes("mains")) && (
                    <div className="mocks-accordion-group" style={{ marginTop: '16px' }}>
                      <div 
                        className={`mocks-accordion-header ${accordionOpen.mains ? "open" : ""}`}
                        onClick={() => setAccordionOpen(prev => ({ ...prev, mains: !prev.mains }))}
                      >
                        <div className="header-info">
                          <h3>{activeCourse.title.replace(" Prelims", "").replace(" (Offline)", "")} Mains Mock Exams (Offline Written)</h3>
                          <span className="papers-count">{mainsMocks.length} Descriptive Papers</span>
                        </div>
                        <ChevronDown className="accordion-chevron" size={20} />
                      </div>
                      {accordionOpen.mains && (
                        <div className="mocks-list-grid accordion-content">
                          {mainsMocks.map((mock, idx) => {
                            const isFree = idx === 0 || idx === 5;
                            const locked = !isMainsUnlocked && !isFree;
                            return (
                              <div className="mock-card" key={mock.id} style={{ opacity: locked ? 0.85 : 1, border: "1px solid var(--border)" }}>
                                <div className="mock-card-header">
                                  <span className="mock-badge" style={{ background: "var(--gold-bg)", color: "var(--navy)", border: "1px solid var(--gold)" }}>Offline Mains</span>
                                  <span className="mock-duration">⏱ 3 Hours</span>
                                  {locked && <span className="lock-badge-premium" style={{ background: "var(--red)", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>🔒 Locked</span>}
                                </div>
                                <h3 style={{ margin: "10px 0" }}>{mock.title}</h3>
                                <div className="mock-details" style={{ fontSize: "12.5px", color: "var(--muted)", margin: "8px 0" }}>
                                  <span>📝 {mock.questions.length} Descriptive Questions</span> &bull; 
                                  <span>🏆 Marks: {mock.weightage}</span>
                                </div>
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                  <button 
                                    className="btn-start-mock-test"
                                    onClick={() => {
                                      if (locked) {
                                        alert("This is a premium mock test. Please unlock the course package to attempt.");
                                        const checkoutElem = document.querySelector(".discount-packages-container");
                                        if (checkoutElem) checkoutElem.scrollIntoView({ behavior: "smooth" });
                                      } else {
                                        handleDownloadMainsQuestionPaper(mock);
                                      }
                                    }}
                                    style={{ flex: 1, padding: "8px 12px", fontSize: "12px", background: locked ? "var(--muted)" : "var(--blue)", color: "white" }}
                                  >
                                    🖨️ Print Paper
                                  </button>
                                  <button 
                                    className="btn-start-mock-test"
                                    onClick={() => {
                                      if (locked) {
                                        alert("This is a premium mock test. Please unlock the course package to attempt.");
                                        const checkoutElem = document.querySelector(".discount-packages-container");
                                        if (checkoutElem) checkoutElem.scrollIntoView({ behavior: "smooth" });
                                      } else {
                                        handleDownloadMainsAnswers(mock);
                                      }
                                    }}
                                    style={{ flex: 1, padding: "8px 12px", fontSize: "12px", background: locked ? "var(--muted)" : "var(--gold-bg)", color: locked ? "var(--text)" : "var(--text)" }}
                                  >
                                    💡 Model Answers
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 50% Discount Packages Checkout */}
                {!isUnlocked ? (
                  <div className="discount-packages-container">
                    <div className="packages-header">
                      <h2>Unlock Packages on 50% Discount</h2>
                      <p>Do yourself a favor, start practising more with India's Best Online Test Series</p>
                    </div>

                    <div className="packages-tabs">
                      <button 
                        className={`package-tab-btn ${checkoutTab === "Railway" ? "active" : ""}`}
                        onClick={() => setCheckoutTab("Railway")}
                      >
                        {activeCourse.category.includes("Railway") ? "Railway" : activeCourse.title}
                      </button>
                      <button 
                        className={`package-tab-btn ${checkoutTab === "Mega Package" ? "active" : ""}`}
                        onClick={() => setCheckoutTab("Mega Package")}
                      >
                        Mega Package
                      </button>
                    </div>

                    <div className="package-card-container">
                      <div className="package-left">
                        <div className="book-artwork">
                          <span className="book-check">✓</span>
                          <div className="book-inner">
                            <span className="book-lbl">Mock Tests</span>
                            <span className="book-sub-lbl">Sectional & PYQs</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="package-center">
                        <div className="package-details-row">
                          <h3>Test Series <span className="info-icon">ℹ️</span></h3>
                          <span className="package-sub-title">{checkoutTab === "Railway" ? `${activeCourse.title} Series` : "Mega Package Series"}</span>
                        </div>
                        <div className="validity-select-wrapper">
                          <label>Validity:</label>
                          <select 
                            value={checkoutValidity}
                            onChange={(e) => setCheckoutValidity(e.target.value)}
                            className="validity-dropdown"
                          >
                            <option value="3">3 months</option>
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                          </select>
                        </div>
                      </div>

                      <div className="package-right">
                        <div className="price-info">
                          <span className="monthly-rate">
                            ₹{checkoutValidity === "3" ? "50" : checkoutValidity === "6" ? "50" : "41"}/month
                          </span>
                          <span className="discount-tag">( 50% off )</span>
                          <span className="original-rate">
                            ₹{checkoutValidity === "3" ? "99" : checkoutValidity === "6" ? "99" : "83"}/month
                          </span>
                        </div>
                        <div className="checkout-total-row">
                          <span className="final-price">
                            - ₹{checkoutValidity === "3" ? "149.00" : checkoutValidity === "6" ? "299.00" : "499.00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="package-subtotal-panel">
                      <div className="subtotal-row">
                        <span>Sub-Total</span>
                        <span style={{ textDecoration: "line-through", color: "#9ca3af" }}>₹{checkoutValidity === "3" ? "299" : checkoutValidity === "6" ? "599" : "999"}</span>
                        <span className="minus-price">- ₹{checkoutValidity === "3" ? "150.00" : checkoutValidity === "6" ? "300.00" : "500.00"}</span>
                      </div>
                      <div className="total-row">
                        <span>TOTAL AMOUNT</span>
                        <span className="total-price">₹{checkoutValidity === "3" ? "149" : checkoutValidity === "6" ? "299" : "499"}</span>
                        <button 
                          className="btn-buy-now"
                          onClick={handleBuyNow}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="course-unlocked-success-banner" style={{ background: 'var(--green-bg, #ECFDF5)', border: '1.5px solid var(--green, #10B981)', borderRadius: '12px', padding: '20px', textAlign: 'center', marginTop: '30px' }}>
                    <h3 style={{ color: 'var(--green, #059669)', margin: 0, fontWeight: '800' }}>🎉 Premium Package Active</h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14.5px', color: 'var(--text)' }}>You have unlocked all mock exams, practice sets, and previous year papers for this course.</p>
                  </div>
                )}
              </div>
            )}

            {detailTab === "pyqs" && (
              <div className="pyqs-section-view">
                <h2>{activeCourse.title} Solved Previous Year Papers (PYQ)</h2>
                <p className="syllabus-sub">Practice authentic previous years question papers from past examinations in a timed proctored setup.</p>
                
                <div className="mocks-list-grid" style={{ marginBottom: "30px" }}>
                  {pyqs.map(pyq => {
                    const locked = !isUnlocked;
                    return (
                      <div className="mock-card" key={pyq.id} style={{ opacity: locked ? 0.85 : 1 }}>
                        <div className="mock-card-header">
                          <span className="pyq-badge">Solved PYQ</span>
                          <span className="mock-duration">⏱ {pyq.duration}</span>
                          {locked && <span className="lock-badge-premium" style={{ background: "var(--red)", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>🔒 Locked</span>}
                        </div>
                        <h3>{pyq.title}</h3>
                         <div className="mock-details">
                          <span>📝 {Array.isArray(pyq.questions) && pyq.questions.length > 0 ? `${pyq.questions.length} Questions Solved` : "No Questions Available"}</span> &bull; 
                          <span>📖 Complete Solutions Included</span>
                        </div>
                        <button 
                          className="btn-start-pyq-test" 
                          onClick={() => {
                            if (locked) {
                              alert("Previous year papers are premium. Please unlock the course package to attempt.");
                              const checkoutElem = document.querySelector(".discount-packages-container");
                              if (checkoutElem) checkoutElem.scrollIntoView({ behavior: "smooth" });
                            } else {
                              if (Array.isArray(pyq.questions) && pyq.questions.length === 0) {
                                alert("No Questions Available for this paper yet.");
                                return;
                              }
                              startFullMock(pyq);
                            }
                          }}
                          style={{ background: locked ? "var(--muted)" : "" }}
                        >
                          {locked ? "🔒 Unlock Premium Papers" : "Attempt Paper Now →"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {!isUnlocked ? (
                  <div className="discount-packages-container">
                    <div className="packages-header">
                      <h2>Unlock Previous Year Papers</h2>
                      <p>Get full access to all proctored previous year exam papers with complete step-by-step explanations.</p>
                    </div>

                    <div className="package-card-container">
                      <div className="package-left">
                        <div className="book-artwork">
                          <span className="book-check">✓</span>
                          <div className="book-inner">
                            <span className="book-lbl">PYQs</span>
                            <span className="book-sub-lbl">Fully Solved</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="package-center">
                        <div className="package-details-row">
                          <h3>Test Series <span className="info-icon">ℹ️</span></h3>
                          <span className="package-sub-title">{activeCourse.title} PYQ Bundle</span>
                        </div>
                        <div className="validity-select-wrapper">
                          <label>Validity:</label>
                          <select 
                            value={checkoutValidity}
                            onChange={(e) => setCheckoutValidity(e.target.value)}
                            className="validity-dropdown"
                          >
                            <option value="3">3 months</option>
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                          </select>
                        </div>
                      </div>

                      <div className="package-right">
                        <div className="price-info">
                          <span className="monthly-rate">
                            ₹{checkoutValidity === "3" ? "50" : checkoutValidity === "6" ? "50" : "41"}/month
                          </span>
                          <span className="discount-tag">( 50% off )</span>
                        </div>
                        <div className="checkout-total-row">
                          <span className="final-price">
                            ₹{checkoutValidity === "3" ? "149" : checkoutValidity === "6" ? "299" : "499"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="package-subtotal-panel">
                      <div className="total-row">
                        <span>TOTAL AMOUNT</span>
                        <span className="total-price">
                          ₹{checkoutValidity === "3" ? "149" : checkoutValidity === "6" ? "299" : "499"}
                        </span>
                        <button 
                          className="btn-buy-now"
                          onClick={handleBuyNow}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="course-unlocked-success-banner" style={{ background: 'var(--green-bg, #ECFDF5)', border: '1.5px solid var(--green, #10B981)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--green, #059669)', margin: 0, fontWeight: '800' }}>🎉 Premium Package Active</h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14.5px', color: 'var(--text)' }}>You have unlocked all mock exams, practice sets, and previous year papers for this course.</p>
                  </div>
                )}
              </div>
            )}

            {detailTab === "analytics" && (() => {
              const filteredAttempts = courseAttempts.filter(att => 
                att.testName && att.testName.toLowerCase().includes(activeCourse.title.toLowerCase())
              );
              
              const avgScore = filteredAttempts.length > 0 
                ? Math.round(filteredAttempts.reduce((acc, curr) => acc + curr.score, 0) / filteredAttempts.length)
                : 0;

              const avgAccuracy = filteredAttempts.length > 0 
                ? Math.round(filteredAttempts.reduce((acc, curr) => acc + curr.accuracy, 0) / filteredAttempts.length)
                : 0;

              return (
                <div className="analytics-section-view">
                  <h2>Attempts & Performance Analytics</h2>
                  <p className="syllabus-sub">Track your real-time performance, scores, and accuracy curves for this course.</p>
                  
                  {filteredAttempts.length > 0 ? (
                    <>
                      <div className="analytics-overview-grid">
                        <div className="overview-metric-card">
                          <h3>{filteredAttempts.length}</h3>
                          <span>Total Tests Attempted</span>
                        </div>
                        <div className="overview-metric-card">
                          <h3>{avgScore}%</h3>
                          <span>Average Score</span>
                        </div>
                        <div className="overview-metric-card">
                          <h3>{avgAccuracy}%</h3>
                          <span>Average Accuracy</span>
                        </div>
                      </div>

                      <div className="attempts-table-card">
                        <h3>Test Attempt History</h3>
                        <div className="attempts-table-wrapper">
                          <table className="attempts-table">
                            <thead>
                              <tr>
                                <th>Test Name</th>
                                <th>Attempt Date</th>
                                <th>Score Obtained</th>
                                <th>Accuracy</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAttempts.map((att, i) => (
                                <tr key={i}>
                                  <td className="att-name">🏆 {att.testName}</td>
                                  <td>{att.date || new Date().toLocaleDateString()}</td>
                                  <td className="att-score">{att.score}%</td>
                                  <td className="att-accuracy">{att.accuracy}%</td>
                                  <td>
                                    <span className={`status-pill ${att.score >= 70 ? 'passed' : 'failed'}`}>
                                      {att.score >= 70 ? 'Above Cutoff' : 'Below Cutoff'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-attempts-placeholder">
                      <AlertTriangle size={40} color="var(--accent)"/>
                      <h3>No test attempt records found for {activeCourse.title}.</h3>
                      <p>Start practicing mocks or PYQs above to see your analytics charts compile here in real time!</p>
                    </div>
                  )}
                </div>
              );
            })()}



            {detailTab === "more" && (
              <div className="more-section-view">
                <h2>Future Scope & Extra Resources</h2>
                <p className="syllabus-sub">Explore additional student support and book 1-on-1 sessions.</p>
                
                <div className="more-layout-grid">
                  <div className="more-card book-mentorship">
                    <h3>📅 Book 1-on-1 Topper Mentorship</h3>
                    <p>Connect with a student who successfully cleared the {activeCourse.title} exam last year. They will guide you on weekly schedules, speed tactics, and descriptive writing tips.</p>
                    <button className="btn-mentorship-book" onClick={() => alert("Mentorship booking system is coming soon in the next update!")}>
                      Request Booking Slot
                    </button>
                  </div>

                  <div className="more-card feedback-doubt-box">
                    <h3>📬 Drop a Query / Feedback</h3>
                    <p>Stuck on a tricky problem? Report it directly to the offline KR Institute of Learning faculty team.</p>
                    
                    {feedbackSubmitted ? (
                      <div className="feedback-success">
                        <CheckCircle size={24} color="#15803d"/>
                        <p>Thank you! Your query has been logged in our backend server database. Our faculty will respond via email shortly.</p>
                        <button className="btn-send-another" onClick={() => setFeedbackSubmitted(false)}>Send Another Query</button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                        <input 
                          type="text" 
                          placeholder="Your Name" 
                          required 
                          value={feedbackName} 
                          onChange={(e) => setFeedbackName(e.target.value)}
                        />
                        <input 
                          type="email" 
                          placeholder="Your Email" 
                          required 
                          value={feedbackEmail} 
                          onChange={(e) => setFeedbackEmail(e.target.value)}
                        />
                        <textarea 
                          placeholder="Type your question or feedback here..." 
                          required 
                          value={feedbackMsg}
                          onChange={(e) => setFeedbackMsg(e.target.value)}
                        />
                        <button type="submit" className="btn-submit-feedback">Submit Query to Backend</button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="back-home-wrapper">
        <button className="btn-back-home" onClick={() => navigate("home")}>
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>
      <div className="courses-header-section">
        <h2>{selectedCategory} Courses</h2>
        <p>Choose an exam below to view syllabus details and solve interactive practice sets.</p>
      </div>

      <div className="courses-pills-container">
        {COURSE_PILLS.map((pill) => (
          <button 
            key={pill} 
            className={`courses-pill-btn ${selectedPill === pill ? "active" : ""}`}
            onClick={() => handlePillClick(pill)}
          >
            {pill}
          </button>
        ))}
      </div>

      {filteredExams.length > 0 ? (
        <div className="exams-badges-grid">
          {filteredExams.map((course) => (
            <div 
              className="exam-badge-card" 
              key={course.id}
              onClick={() => handleCourseClick(course)}
            >
              <ExamLogo type={course.logoType} />
              <span className="exam-badge-title">{course.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-exams-found">
          <BookOpen size={48} color="var(--muted)"/>
          <h3>No exams matched your search query.</h3>
          <p>Try searching for other terms or choose a category from the sidebar menu.</p>
        </div>
      )}
    </div>
  );
}
