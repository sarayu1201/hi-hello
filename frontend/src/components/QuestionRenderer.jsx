import React, { useEffect, useRef } from "react";

// Self-healing text parser to repair merged words, spacing, and punctuation
export const cleanText = (text) => {
  if (!text) return "";
  
  let fixed = text
    // Correct common merged words from PDF OCR / ingestion issues
    .replace(/\bIfthe\b/g, "If the")
    .replace(/\bofasphere\b/g, "of a sphere")
    .replace(/\bfindthe\b/gi, "find the")
    .replace(/\bvalueof\b/gi, "value of")
    .replace(/\beachof\b/gi, "each of")
    .replace(/\bfitin\b/gi, "fit in")
    .replace(/\bwhatis\b/gi, "what is")
    .replace(/\bquestions?\b/gi, "question")
    .replace(/\bnumberof\b/gi, "number of")
    // Fix spaces around alphanumeric boundaries: e.g. "56cm" -> "56 cm", "sphere56" -> "sphere 56"
    .replace(/([a-zA-Z]+)([0-9]+)/g, "$1 $2")
    .replace(/([0-9]+)([a-zA-Z]+)/g, "$1 $2")
    // Double spaces to single spaces
    .replace(/[ ]{2,}/g, " ");

  return fixed;
};

// Self-healing LaTeX checker and formatter
export const cleanLaTeX = (text) => {
  if (!text) return "";

  let fixed = text;

  // Auto-prepend backslash to raw unformatted sqrt statements (e.g. sqrt{39.99} -> \sqrt{39.99})
  fixed = fixed.replace(/(?<!\\)sqrt/g, "\\sqrt");

  // Balance curly braces (e.g. if \sqrt{3025 has no closing curly brace)
  const openBraceCount = (fixed.match(/\\(sqrt|frac|text)\{/g) || []).length;
  let closeBraceCount = (fixed.match(/\}/g) || []).length;
  while (closeBraceCount < openBraceCount) {
    fixed += "}";
    closeBraceCount++;
  }

  // Ensure closed dollar block delimiters
  const dollarCount = (fixed.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    fixed += "$";
  }

  // Escape raw % percentage signs in LaTeX math blocks to avoid parsing warnings
  fixed = fixed.replace(/\$([\s\S]*?)\$/g, (match, mathContent) => {
    const escapedMath = mathContent.replace(/(?<!\\)%/g, "\\%");
    return `$${escapedMath}$`;
  });

  return fixed;
};

export default function QuestionRenderer({ text, subject = "", className = "" }) {
  const containerRef = useRef(null);

  // Trigger MathJax typeset on mount and update
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise && containerRef.current) {
      window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
        console.warn("MathJax formatting pipeline warning:", err);
      });
    }
  }, [text]);

  if (!text) return null;

  // 1. Text Parsing & Self-Healing Spacing
  let processedText = cleanText(text);

  // 2. Math Parsing & Self-Healing LaTeX Delimiters
  processedText = cleanLaTeX(processedText);

  // 3. Question Type / Table Representation Parsing
  const tableJsonMatch = processedText.match(/\{[\s\S]*?"headers"[\s\S]*?"rows"[\s\S]*?\}/);
  if (tableJsonMatch) {
    const beforeTable = processedText.substring(0, tableJsonMatch.index);
    const afterTable = processedText.substring(tableJsonMatch.index + tableJsonMatch[0].length);
    try {
      const tableData = JSON.parse(tableJsonMatch[0]);
      const headers = tableData.headers || [];
      const rows = tableData.rows || [];

      return (
        <div ref={containerRef} className={`space-y-4 mathjax-process leading-relaxed ${className}`}>
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

  // Default rendering path
  return (
    <span ref={containerRef} className={`mathjax-process whitespace-pre-wrap leading-relaxed ${className}`}>
      {processedText}
    </span>
  );
}
