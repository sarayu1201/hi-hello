import React from "react";
import { CheckCircle, XCircle, AlertCircle, Download, BookOpen, ArrowLeft } from "lucide-react";
import QuestionRenderer from "./QuestionRenderer";
const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.protocol + "//" + window.location.hostname + ":5000");

const ensureMathDelimiters = (text) => {
  if (!text) return "";
  const str = String(text).trim();
  
  if (str.includes("$")) {
    return str;
  }
  
  // If it's a single formula token without spaces
  if (!str.includes(" ")) {
    if (str.includes("\\") || str.includes("^") || str.includes("_")) {
      return `$${str}$`;
    }
    return str;
  }
  
  // Split by spaces and wrap only specific math-containing words
  const words = str.split(" ");
  const mappedWords = words.map(word => {
    const cleanWord = word.trim();
    if (!cleanWord) return "";
    
    if (cleanWord.includes("\\") || cleanWord.includes("^") || cleanWord.includes("_")) {
      if (cleanWord.startsWith("$") && cleanWord.endsWith("$")) {
        return cleanWord;
      }
      
      // Preserve punctuation at the end of the math token (e.g. commas or periods: "120cm^2,")
      const punctuationMatch = cleanWord.match(/[,.;?]+$/);
      if (punctuationMatch) {
        const punctuation = punctuationMatch[0];
        const mathPart = cleanWord.slice(0, -punctuation.length);
        return `$${mathPart}$${punctuation}`;
      }
      
      return `$${cleanWord}$`;
    }
    return word;
  });
  
  return mappedWords.join(" ");
};

const stripLaTeX = (text) => {
  return text || "";
};

const renderLaTeX = (text, subject = "", direction = "") => {
  return <QuestionRenderer text={text} direction={direction} subject={subject} />;
};

export default function ResultCard({ questions, answers, onGoBack, examType, subType }) {
  React.useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch(err => console.warn('MathJax typesetting warning:', err));
      }, 100);
    }
  }, [questions, answers]);

  // 1. Calculate analytical metrics
  let attempted = 0;
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;

  questions.forEach((q) => {
    const sel = answers[q.question_number];
    if (sel === undefined || sel === null || sel === "") {
      unattempted++;
    } else {
      attempted++;
      // Map correct answer to 0-indexed number safely
      let correctIdx = 0;
      if (q.correct !== undefined && q.correct !== null) {
        if (typeof q.correct === "number") {
          correctIdx = q.correct;
        } else {
          const val = String(q.correct).trim().toUpperCase();
          if (val) {
            if (!isNaN(val)) {
              correctIdx = parseInt(val, 10);
            } else {
              correctIdx = val.charCodeAt(0) - 65;
            }
          }
        }
      } else if (q.correct_answer !== undefined && q.correct_answer !== null) {
        if (typeof q.correct_answer === "number") {
          correctIdx = q.correct_answer;
        } else {
          const val = String(q.correct_answer).trim().toUpperCase();
          if (val) {
            if (!isNaN(val)) {
              correctIdx = parseInt(val, 10);
            } else {
              correctIdx = val.charCodeAt(0) - 65;
            }
          }
        }
      }

      // Map selected option to 0-indexed number safely
      let selectedIdx = -1;
      if (typeof sel === "number") {
        selectedIdx = sel;
      } else {
        const val = String(sel).trim().toUpperCase();
        if (val) {
          if (!isNaN(val)) {
            selectedIdx = parseInt(val, 10);
          } else {
            selectedIdx = val.charCodeAt(0) - 65;
          }
        }
      }

      if (correctIdx === selectedIdx) {
        correct++;
      } else {
        wrong++;
      }
    }
  });

  let totalScore = 0;
  let totalNegative = 0;
  questions.forEach((q) => {
    const sel = answers[q.question_number];
    if (sel !== undefined && sel !== null && sel !== "") {
      let correctIdx = 0;
      if (q.correct !== undefined && q.correct !== null) {
        if (typeof q.correct === "number") {
          correctIdx = q.correct;
        } else {
          const val = String(q.correct).trim().toUpperCase();
          if (val) {
            if (!isNaN(val)) {
              correctIdx = parseInt(val, 10);
            } else {
              correctIdx = val.charCodeAt(0) - 65;
            }
          }
        }
      } else if (q.correct_answer !== undefined && q.correct_answer !== null) {
        if (typeof q.correct_answer === "number") {
          correctIdx = q.correct_answer;
        } else {
          const val = String(q.correct_answer).trim().toUpperCase();
          if (val) {
            if (!isNaN(val)) {
              correctIdx = parseInt(val, 10);
            } else {
              correctIdx = val.charCodeAt(0) - 65;
            }
          }
        }
      }

      let selectedIdx = -1;
      if (typeof sel === "number") {
        selectedIdx = sel;
      } else {
        const val = String(sel).trim().toUpperCase();
        if (val) {
          if (!isNaN(val)) {
            selectedIdx = parseInt(val, 10);
          } else {
            selectedIdx = val.charCodeAt(0) - 65;
          }
        }
      }

      const qMarks = q.marks !== undefined ? parseFloat(q.marks) : 1.0;
      const qNegative = q.negative_marks !== undefined ? parseFloat(q.negative_marks) : (q.negativeMarks !== undefined ? parseFloat(q.negativeMarks) : 0.25);

      if (correctIdx === selectedIdx) {
        totalScore += qMarks;
      } else {
        totalNegative += qNegative;
      }
    }
  });

  const negativeMarks = parseFloat(totalNegative.toFixed(2));
  const finalScore = parseFloat((totalScore - totalNegative).toFixed(2));
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  // 2. PDF Download Report Handler
  const handleDownloadReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the PDF scorecard.");
      return;
    }

    let questionsHtml = "";
    questions.forEach((q, idx) => {
      const sel = answers[q.question_number];
      // Map correct answer to 0-indexed number safely
      let correctIdx = 0;
      if (q.correct !== undefined && q.correct !== null) {
        if (typeof q.correct === "number") {
          correctIdx = q.correct;
        } else {
          const val = String(q.correct).trim().toUpperCase();
          if (val) {
            if (!isNaN(val)) {
              correctIdx = parseInt(val, 10);
            } else {
              correctIdx = val.charCodeAt(0) - 65;
            }
          }
        }
      } else if (q.correct_answer !== undefined && q.correct_answer !== null) {
        if (typeof q.correct_answer === "number") {
          correctIdx = q.correct_answer;
        } else {
          const val = String(q.correct_answer).trim().toUpperCase();
          if (val) {
            if (!isNaN(val)) {
              correctIdx = parseInt(val, 10);
            } else {
              correctIdx = val.charCodeAt(0) - 65;
            }
          }
        }
      }

      // Map selected option to 0-indexed number safely
      let selectedIdx = -1;
      if (sel !== undefined && sel !== null && sel !== "") {
        if (typeof sel === "number") {
          selectedIdx = sel;
        } else {
          const val = String(sel).trim().toUpperCase();
          if (val) {
            if (!isNaN(val)) {
              selectedIdx = parseInt(val, 10);
            } else {
              selectedIdx = val.charCodeAt(0) - 65;
            }
          }
        }
      }

      const isCorrect = sel !== undefined && sel !== null && sel !== "" && correctIdx === selectedIdx;
      const isUnattempted = sel === undefined || sel === null || sel === "";

      let statusText = isCorrect ? "CORRECT" : isUnattempted ? "UNATTEMPTED" : "INCORRECT";
      let statusColor = isCorrect ? "#059669" : isUnattempted ? "#4B5563" : "#DC2626";
      let cardBg = isCorrect ? "#F0FDF4" : isUnattempted ? "#F9FAFB" : "#FEF2F2";
      let cardBorder = isCorrect ? "#10B981" : isUnattempted ? "#D1D5DB" : "#EF4444";

      let optionsHtml = "";
      (q.options || []).forEach((opt, oIdx) => {
        const isCorrectOpt = oIdx === correctIdx;
        const isSelectedOpt = oIdx === selectedIdx;

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

        const optionText = opt && typeof opt === 'object' ? opt.text : opt;

        optionsHtml += `
          <div style="background: ${optBg}; border: 1.5px solid ${optBorder}; color: ${optColor}; font-weight: ${optBold}; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; display: flex; align-items: center; gap: 8px;">
            <span style="width: 18px; height: 18px; border-radius: 50%; background: ${isCorrectOpt ? '#10B981' : isSelectedOpt ? '#EF4444' : '#94A3B8'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;">
              ${String.fromCharCode(65 + oIdx)}
            </span>
            <span>${optionText}</span>
          </div>
        `;
      });

      questionsHtml += `
        <div style="background: ${cardBg}; border: 1.5px solid ${cardBorder}; padding: 20px; border-radius: 8px; margin-bottom: 20px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${cardBorder}; padding-bottom: 8px; margin-bottom: 12px;">
            <span style="font-size: 12px; font-weight: 800; color: #4B5563; text-transform: uppercase;">
              Question ${idx + 1} &bull; ${q.section || "General"}
            </span>
            <span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 800;">
              ${statusText}
            </span>
          </div>
          <p style="font-size: 15px; font-weight: 700; margin: 0 0 12px 0; color: #111827;">${q.q || q.question_text}</p>
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
        <title>Result Card - ${subType}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1F2937; background: #FFFFFF; }
          .header { text-align: center; border-bottom: 3px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #1E3A8A; font-size: 28px; }
          .header p { margin: 5px 0 0 0; color: #4B5563; font-size: 14px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 35px; }
          .summary-card { background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; text-align: center; }
          .summary-card span { font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase; display: block; margin-bottom: 5px; }
          .summary-card strong { font-size: 22px; color: #1E3A8A; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${examType} - ${subType}</h1>
          <p>Official Performance Scorecard &bull; Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="summary-grid">
          <div class="summary-card"><span>Final Score</span><strong>${finalScore} pts</strong></div>
          <div class="summary-card"><span>Accuracy</span><strong>${accuracy}%</strong></div>
          <div class="summary-card"><span>Correct</span><strong>${correct} / ${questions.length}</strong></div>
          <div class="summary-card"><span>Negative Marks</span><strong>-${negativeMarks}</strong></div>
        </div>
        <div>${questionsHtml}</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans select-none animate-fade-in my-8">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 px-8 py-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-white/10 border border-white/20 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
            CBT Scorecard
          </span>
          <h1 className="text-2xl font-black font-sora mt-2">{examType}</h1>
          <p className="text-blue-200 text-xs mt-0.5">{subType} &bull; Analysis Dashboard</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Download size={14} />
            Download Result Card
          </button>
          <button 
            onClick={onGoBack}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </div>

      {/* Analytical Metrics Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-6 bg-slate-50 border-b border-slate-100">
        <div className="bg-white p-4 border border-slate-200 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Score</span>
          <strong className="text-xl text-blue-600 font-extrabold mt-1 block">{finalScore} pts</strong>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Accuracy</span>
          <strong className="text-xl text-emerald-600 font-extrabold mt-1 block">{accuracy}%</strong>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Correct</span>
          <strong className="text-xl text-emerald-650 font-extrabold mt-1 block">{correct} / {questions.length}</strong>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Wrong</span>
          <strong className="text-xl text-red-650 font-extrabold mt-1 block">{wrong}</strong>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Negative Marks</span>
          <strong className="text-xl text-red-505 font-extrabold mt-1 block">-{negativeMarks}</strong>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Unattempted</span>
          <strong className="text-xl text-slate-550 font-extrabold mt-1 block">{unattempted}</strong>
        </div>
      </div>

      {/* Solutions & Explanations Review Section */}
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
          <BookOpen size={20} className="text-blue-900" />
          <h2 className="text-lg font-bold font-sora text-slate-900">Incorrect & Skipped Questions Review</h2>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const sel = answers[q.question_number];
            // Map correct answer to 0-indexed number safely
            let correctIdx = 0;
            if (q.correct !== undefined && q.correct !== null) {
              if (typeof q.correct === "number") {
                correctIdx = q.correct;
              } else {
                const val = String(q.correct).trim().toUpperCase();
                if (val) {
                  if (!isNaN(val)) {
                    correctIdx = parseInt(val, 10);
                  } else {
                    correctIdx = val.charCodeAt(0) - 65;
                  }
                }
              }
            } else if (q.correct_answer !== undefined && q.correct_answer !== null) {
              if (typeof q.correct_answer === "number") {
                correctIdx = q.correct_answer;
              } else {
                const val = String(q.correct_answer).trim().toUpperCase();
                if (val) {
                  if (!isNaN(val)) {
                    correctIdx = parseInt(val, 10);
                  } else {
                    correctIdx = val.charCodeAt(0) - 65;
                  }
                }
              }
            }

            // Map selected option to 0-indexed number safely
            let selectedIdx = -1;
            if (sel !== undefined && sel !== null && sel !== "") {
              if (typeof sel === "number") {
                selectedIdx = sel;
              } else {
                const val = String(sel).trim().toUpperCase();
                if (val) {
                  if (!isNaN(val)) {
                    selectedIdx = parseInt(val, 10);
                  } else {
                    selectedIdx = val.charCodeAt(0) - 65;
                  }
                }
              }
            }

            const isCorrect = sel !== undefined && sel !== null && sel !== "" && correctIdx === selectedIdx;
            const isUnattempted = sel === undefined || sel === null || sel === "";

            return (
              <div 
                key={q.question_number}
                className={`p-6 rounded-xl border ${
                  isCorrect ? "bg-emerald-50/20 border-emerald-200" : isUnattempted ? "bg-slate-50/50 border-slate-200" : "bg-red-50/20 border-red-200"
                }`}
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Question {idx + 1} &bull; {q.section || "General"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                    isCorrect ? "bg-emerald-100 text-emerald-700" : isUnattempted ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-650"
                  }`}>
                    {isCorrect ? <CheckCircle size={10} /> : isUnattempted ? <AlertCircle size={10} /> : <XCircle size={10} />}
                    {isCorrect ? "Correct" : isUnattempted ? "Unattempted" : "Incorrect"}
                  </span>
                </div>

                <p className="text-slate-800 font-bold text-sm leading-relaxed mb-4">{renderLaTeX(q.q || q.question_text, q.section || q.subject, q.direction)}</p>

                {q.question_image && (
                  <div className="mb-4 flex flex-col items-start gap-1">
                    <img 
                      src={`${BACKEND_URL}/api/images/${q.question_image}`} 
                      alt="Question diagram"
                      className="max-h-80 w-auto rounded-lg border border-slate-200 cursor-zoom-in hover:scale-[1.01] transition-transform duration-200"
                      onClick={() => {
                        window.open(`${BACKEND_URL}/api/images/${q.question_image}`, '_blank');
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {(q.options || []).map((opt, oIdx) => {
                    const isCorrectOpt = oIdx === correctIdx;
                    const isSelectedOpt = oIdx === selectedIdx;
                    
                    let cardStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
                    if (isCorrectOpt) {
                      cardStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm";
                    } else if (isSelectedOpt) {
                      cardStyle = "bg-red-50 border-red-450 text-red-950 font-bold";
                    }

                    const optionText = opt && typeof opt === 'object' ? opt.text : opt;
                    let optionImage = opt && typeof opt === 'object' ? opt.image : null;
                    if (!optionImage && q.option_images && q.option_images[oIdx]) {
                      optionImage = q.option_images[oIdx];
                    }

                    return (
                      <div 
                        key={oIdx}
                        className={`flex flex-col gap-2 p-3 rounded-lg border text-xs leading-normal ${cardStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isCorrectOpt ? "bg-emerald-500 text-white" : isSelectedOpt ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{renderLaTeX(optionText, q.section || q.subject)}</span>
                        </div>
                        {optionImage && (
                          <div className="pl-8 flex flex-col items-start gap-1">
                            <img 
                              src={`${BACKEND_URL}/api/images/${optionImage}`} 
                              alt={`Option ${String.fromCharCode(65 + oIdx)} diagram`}
                              className="max-h-24 w-auto rounded border border-slate-200 cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                              onClick={() => {
                                window.open(`${BACKEND_URL}/api/images/${optionImage}`, '_blank');
                              }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Block */}
                {q.explanation && (
                  <div className="mt-4 p-4 bg-blue-50/40 border border-blue-100 rounded-lg text-xs leading-relaxed text-slate-700 mathjax-process">
                    <strong className="text-blue-900 block mb-1">💡 Explanation & Solution:</strong>
                    {stripLaTeX(q.explanation)}
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
