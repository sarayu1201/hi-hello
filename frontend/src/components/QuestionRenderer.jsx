import React, { useEffect, useRef } from "react";

// Self-healing text parser to repair merged words, spacing, and punctuation
export const cleanText = (text) => {
  if (!text) return "";
  
  let fixed = text
    // Safe corrections for common merged words from OCR
    .replace(/\bIfthe\b/g, "If the")
    .replace(/\bofasphere\b/g, "of a sphere")
    .replace(/\bfindthe\b/gi, "find the")
    .replace(/\bvalueof\b/gi, "value of ")
    .replace(/\beachof\b/gi, "each of")
    .replace(/\bfitin\b/gi, "fit in")
    .replace(/\bwhatis\b/gi, "what is")
    .replace(/\bnumberof\b/gi, "number of")
    .replace(/\boftriangle\b/gi, "of triangle")
    .replace(/\bABCandtriangle\b/gi, "ABC and triangle")
    .replace(/\bDEFare\b/gi, "DEF are")
    .replace(/\bofABis\b/gi, "of AB is")
    .replace(/\bIfAB\b/gi, "If AB")
    .replace(/\bangleBis\b/gi, "angle B is")
    .replace(/\bsideAC\b/gi, "side AC")
    .replace(/\bsideBC\b/gi, "side BC")
    .replace(/\bBCandAD\b/gi, "BC and AD")
    .replace(/\blengthof\b/gi, "length of ")
    .replace(/\bcentreO\b/gi, "centre O")
    .replace(/\bmeetsBA\b/gi, "meets BA")
    .replace(/\bangleATC\b/gi, "angle ATC")
    .replace(/\bangleACT\b/gi, "angle ACT")
    .replace(/\bangleAOB\b/gi, "angle AOB")
    .replace(/\bIf177\b/gi, "If 177")
    .replace(/\bratio\\frac\b/gi, "ratio \\frac")
    .replace(/\bbridgeof\b/gi, "bridge of")
    .replace(/\bspeedof\b/gi, "speed of")
    .replace(/\btrainof\b/gi, "train of")
    .replace(/\bproductof\b/gi, "product of")
    .replace(/\bperimetersof\b/gi, "perimeters of")
    .replace(/\bareaof\b/gi, "area of")
    // Fix spaces around alphanumeric boundaries: e.g. "56cm" -> "56 cm"
    .replace(/([a-zA-Z]+)([0-9]+)/g, "$1 $2")
    .replace(/([0-9]+)([a-zA-Z]+)/g, "$1 $2")
    // Separate lowercase to uppercase transition (e.g. "heightCD" -> "height CD")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // Separate multi-uppercase to lowercase transition (e.g. "CDintersects" -> "CD intersects")
    .replace(/([A-Z]{2,})([a-z])/g, "$1 $2")
    // Separate single-uppercase variable followed by standard math words (e.g. "Pand" -> "P and", "Qrespectively" -> "Q respectively")
    .replace(/\b([A-Z])(and|are|respectively|is|at|intersects|height|width|length|cm|in|of|to|And|Are|Respectively|Is|At|Intersects|Height|Width|Length|Cm|In|Of|To)\b/g, "$1 $2")
    // Correct "Intriangle" and similar shapes
    .replace(/\bIn(triangle|circle|square|rectangle|cone|sphere)\b/gi, "In $1")
    // Double spaces to single spaces
    .replace(/[ ]{2,}/g, " ");

  return fixed;
};

// Self-healing LaTeX checker and formatter
// Robust LaTeX checker and formatter
function getNestedContent(text, startIdx) {
  let depth = 0;
  let openChar = text[startIdx];
  let closeChar = openChar === '{' ? '}' : (openChar === '(' ? ')' : ']');
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    else if (text[i] === closeChar) {
      depth--;
      if (depth === 0) return { content: text.substring(startIdx + 1, i), endIdx: i };
    }
  }
  return { content: text.substring(startIdx + 1), endIdx: text.length };
}

function wrapLaTeXInString(text) {
  let result = "";
  let idx = 0;
  while (idx < text.length) {
    let nextFrac = text.indexOf("\\frac", idx);
    let nextSqrt = text.indexOf("\\sqrt", idx);
    
    let target = -1;
    let type = ""; // "frac" or "sqrt"
    if (nextFrac !== -1 && (nextSqrt === -1 || nextFrac < nextSqrt)) {
      target = nextFrac;
      type = "frac";
    } else if (nextSqrt !== -1) {
      target = nextSqrt;
      type = "sqrt";
    }
    
    if (target === -1) {
      // Find other standalone commands
      let cmdRegex = /\\(times|div|alpha|beta|gamma|theta|lambda|pi|sum|int|le|ge|sin|cos|tan|log|ln|pm|approx|ne|circ|cap|cup|cap'\b|cup'\b|cap\b|cup\b|cap'|cup')\b/;
      let match = cmdRegex.exec(text.substring(idx));
      if (match) {
        let matchIdx = idx + match.index;
        result += text.substring(idx, matchIdx);
        result += `$${match[0]}$`;
        idx = matchIdx + match[0].length;
        continue;
      }
      
      result += text.substring(idx);
      break;
    }
    
    result += text.substring(idx, target);
    
    // Parse arguments of \frac or \sqrt
    let curr = target + 5;
    while (curr < text.length && /\s/.test(text[curr])) curr++;
    
    if (curr < text.length && text[curr] === '{') {
      let firstArg = getNestedContent(text, curr);
      curr = firstArg.endIdx + 1;
      
      if (type === "frac") {
        while (curr < text.length && /\s/.test(text[curr])) curr++;
        if (curr < text.length && text[curr] === '{') {
          let secondArg = getNestedContent(text, curr);
          curr = secondArg.endIdx + 1;
          let wrappedFrac = `$\\frac{${firstArg.content}}{${secondArg.content}}$`;
          result += wrappedFrac;
        } else {
          result += `$\\frac{${firstArg.content}}{}$`;
        }
      } else {
        let wrappedSqrt = `$\\sqrt{${firstArg.content}}$`;
        result += wrappedSqrt;
      }
      idx = curr;
    } else {
      let commandLength = 5;
      result += `$${text.substring(target, target + commandLength + 1)}$`;
      idx = target + commandLength + 1;
    }
  }
  return result;
}

export const cleanLaTeX = (text) => {
  if (!text) return "";

  let fixed = text.trim();
  
  // Robustly remove starting and trailing dollars, even with trailing punctuation and hidden characters
  fixed = fixed.replace(/^[\s\u200b\ufeff]*\$/, "");
  fixed = fixed.replace(/\$[\s\u200b\ufeff]*([.?)\s]*)$/, "$1");

  // 1. Normalize delimiters
  fixed = fixed
    .replace(/\\\$[\s*([{\s]*/g, "$")
    .replace(/\\\([\s*([{\s]*/g, "$")
    .replace(/[\s*)[\]}\s]*\\\$/g, "$")
    .replace(/[\s*)[\]}\s]*\\\)/g, "$")
    .replace(/\\\[[\s*([{\s]*/g, "$$")
    .replace(/[\s*)[\]}\s]*\\\]/g, "$$");

  // Move currency signs out of math blocks to prevent MathJax font render errors:
  // e.g. $₹4,307 \frac{9}{13}$ -> ₹$4,307 \frac{9}{13}$
  fixed = fixed.replace(/\$([₹Rs]+)([\s\S]*?)\$/gi, (match, currency, rest) => {
    return `${currency}$${rest}$`;
  });

  // 2. Ensure closed dollar block delimiters
  const dollarCount = (fixed.match(/(?<!\\)\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    fixed += "$";
  }

  // 3. Fix percentage signs inside math blocks (escape them as \% if not already escaped)
  fixed = fixed.replace(/\$([\s\S]*?)\$/g, (match, mathContent) => {
    let escaped = mathContent.replace(/(?<!\\)%/g, "\\%");
    if (escaped.includes("₹") && !escaped.includes("\\text{₹}")) {
      escaped = escaped.replaceAll("₹", "\\text{₹}");
    }
    if (escaped.includes("Rs") && !escaped.includes("\\text{Rs}")) {
      escaped = escaped.replaceAll("Rs", "\\text{Rs}");
    }
    return `$${escaped}$`;
  });

  // 4. Wrap raw LaTeX commands outside math blocks
  let parts = fixed.split("$");
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      parts[i] = parts[i].replace(/\\text\s*\{([^{}]+)\}/g, "$1");
      parts[i] = wrapLaTeXInString(parts[i]);
      
      // Replace units with unicode superscripts in plain text
      parts[i] = parts[i]
        .replace(/\bcm\^2\b/g, "cm²")
        .replace(/\bm\^2\b/g, "m²")
        .replace(/\bkm\^2\b/g, "km²")
        .replace(/\bcm\^3\b/g, "cm³")
        .replace(/\bm\^3\b/g, "m³")
        .replace(/\bkm\^3\b/g, "km³");
      
      // Also wrap standalone power terms and subscript terms (allowing multiple letters)
      parts[i] = parts[i].replace(/\b([a-zA-Z]+)\^(\{?[a-zA-Z0-9+\-*=]+\}?)/g, (m, g1, g2) => `$${g1}^${g2}$`);
      parts[i] = parts[i].replace(/\b([a-zA-Z]+)_(\{?[a-zA-Z0-9+\-*=]+\}?)/g, (m, g1, g2) => `$${g1}_${g2}$`);
      parts[i] = parts[i].replace(/(\([a-zA-Z0-9+\-*= ]+\))\^(\{?[a-zA-Z0-9+\-*=]+\}?)/g, (m, g1, g2) => `$${g1}^${g2}$`);
      parts[i] = parts[i].replace(/(\([a-zA-Z0-9+\-*= ]+\))_(\{?[a-zA-Z0-9+\-*=]+\}?)/g, (m, g1, g2) => `$${g1}_${g2}$`);
    } else {
      // Replace units inside math blocks for professional look
      parts[i] = parts[i]
        .replace(/\bcm\^2\b/g, "\\text{cm}^2")
        .replace(/\bm\^2\b/g, "\\text{m}^2")
        .replace(/\bkm\^2\b/g, "\\text{km}^2")
        .replace(/\bcm\^3\b/g, "\\text{cm}^3")
        .replace(/\bm\^3\b/g, "\\text{m}^3")
        .replace(/\bkm\^3\b/g, "\\text{km}^3");
    }
    }
  }
  fixed = parts.join("$");

  // 5. Clean up adjacent dollars
  fixed = fixed.replace(/\$\s*\$/g, " ");

  return fixed;
};

export default function QuestionRenderer({ text, direction = "", subject = "", className = "" }) {
  const containerRef = useRef(null);

  // Trigger MathJax typeset on mount and update
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise && containerRef.current) {
      window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
        console.warn("MathJax formatting pipeline warning:", err);
      });
    }
  }, [text, direction]);

  if (!text && !direction) return null;

  // 1. Text Parsing & Self-Healing Spacing
  let processedText = cleanText(text || "");
  let processedDirection = cleanText(direction || "");

  // 2. Math Parsing & Self-Healing LaTeX Delimiters
  processedText = cleanLaTeX(processedText);
  processedDirection = cleanLaTeX(processedDirection);

  // 3. Question Type / Table Representation Parsing
  const tableJsonMatch = processedText.match(/\{[\s\S]*?"headers"[\s\S]*?"rows"[\s\S]*?\}/);
  
  let contentNode = null;
  if (tableJsonMatch) {
    const beforeTable = processedText.substring(0, tableJsonMatch.index);
    const afterTable = processedText.substring(tableJsonMatch.index + tableJsonMatch[0].length);
    try {
      const tableData = JSON.parse(tableJsonMatch[0]);
      const headers = tableData.headers || [];
      const rows = tableData.rows || [];

      contentNode = (
        <div className="space-y-4">
          <div className="whitespace-pre-wrap">{beforeTable}</div>
          <div className="overflow-x-auto my-4 max-w-full rounded-lg border border-slate-200 shadow-sm">
            <table className="min-w-full border-collapse text-center">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 text-sm text-slate-700 border-r border-slate-200 last:border-r-0 font-medium">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="whitespace-pre-wrap">{afterTable}</div>
        </div>
      );
    } catch (e) {
      console.warn("Failed to parse JSON table in QuestionRenderer:", e);
    }
  }

  if (!contentNode) {
    contentNode = <div className="whitespace-pre-wrap">{processedText}</div>;
  }

  return (
    <div ref={containerRef} className={`mathjax-process leading-relaxed ${className}`}>
      {processedDirection && (
        <div className="bg-slate-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mb-4 text-slate-700 text-sm md:text-base font-normal shadow-sm whitespace-pre-wrap">
          <div className="font-bold text-xs text-indigo-600 uppercase tracking-wider mb-2">Directions</div>
          <div>{processedDirection}</div>
        </div>
      )}
      <div className="font-semibold text-slate-900">
        {contentNode}
      </div>
    </div>
  );
}
