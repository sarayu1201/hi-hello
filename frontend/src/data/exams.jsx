import React from "react";

// SVG logo rendering component for authentic exam visuals
export const ExamLogo = ({ type }) => {
  switch (type.toLowerCase()) {
    case "sbi":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0054A6"/>
          <circle cx="50" cy="50" r="13" fill="#FFFFFF"/>
          <rect x="46" y="50" width="8" height="24" fill="#FFFFFF"/>
        </svg>
      );
    case "ibps":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <rect x="15" y="15" width="70" height="70" rx="14" fill="#0091FF"/>
          <path d="M30 35h40v8H46v10h20v8H46v12h24v8H30V35z" fill="#FFFFFF"/>
          <circle cx="50" cy="22" r="5" fill="#FFFFFF"/>
        </svg>
      );
    case "lic":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#002F6C"/>
          <circle cx="50" cy="50" r="34" fill="#F1B434"/>
          <path d="M50 25c4 0 7 5 7 10s-3 8-7 8-7-3-7-8 3-10 7-10z" fill="#D32F2F"/>
          <path d="M30 60c10 6 30 6 40 0" stroke="#002F6C" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <path d="M32 55c8 4 28 4 36 0" stroke="#002F6C" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "rbi":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0F1E36" stroke="#ECC036" strokeWidth="3"/>
          <circle cx="50" cy="50" r="34" fill="none" stroke="#ECC036" strokeWidth="1" strokeDasharray="3,2"/>
          <path d="M38 42h24v4H50v8h12v4H50v8h12v4H38V42z" fill="#ECC036"/>
          <text x="50" y="36" fontSize="11" fontWeight="900" fill="#ECC036" textAnchor="middle" letterSpacing="1">SEAL</text>
        </svg>
      );
    case "esic":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#9E1B1B"/>
          <circle cx="50" cy="50" r="32" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
          <path d="M50 30 L55 45 L70 45 L58 53 L62 68 L50 59 L38 68 L42 53 L30 45 L45 45 Z" fill="#FFFFFF"/>
        </svg>
      );
    case "idbi":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#006A4E"/>
          <circle cx="50" cy="50" r="28" fill="none" stroke="#FFFFFF" strokeWidth="3"/>
          <path d="M50 22 L62 45 L38 45 Z" fill="#FFFFFF"/>
          <rect x="47" y="45" width="6" height="18" fill="#FFFFFF"/>
        </svg>
      );
    case "pnb":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#800020"/>
          <circle cx="50" cy="50" r="22" fill="none" stroke="#FFF200" strokeWidth="5"/>
          <rect x="47" y="32" width="6" height="36" fill="#FFF200"/>
        </svg>
      );
    case "lic_hfl":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <rect x="15" y="15" width="70" height="70" rx="8" fill="#004B87"/>
          <path d="M25 40 L50 25 L75 40 L75 75 L25 75 Z" fill="#ECC036"/>
          <path d="M35 75 L35 52 L65 52 L65 75 Z" fill="#004B87"/>
        </svg>
      );
    case "bob":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#F26522"/>
          <path d="M35 35h15c8 0 12 4 12 8s-4 7-9 7c6 0 10 3 10 9s-5 9-13 9H35V35zm10 8v6h4c3 0 5-1 5-3s-2-3-5-3h-4zm0 14v8h6c3 0 5-2 5-4s-2-4-5-4h-6z" fill="#FFFFFF"/>
        </svg>
      );
    case "canara":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0091FF"/>
          <path d="M32 68 L50 32 L68 68 Z" fill="none" stroke="#FFFFFF" strokeWidth="5"/>
          <polygon points="50,22 64,48 36,48" fill="#ECC036"/>
        </svg>
      );
    case "dena":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#FF5A00"/>
          <circle cx="50" cy="50" r="22" fill="none" stroke="#FFFFFF" strokeWidth="4"/>
          <path d="M50 28 L50 72 M28 50 L72 50" stroke="#FFFFFF" strokeWidth="4"/>
        </svg>
      );
    case "ecgc":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#003A70"/>
          <path d="M30 45 Q 40 32, 50 45 T 70 45 T 90 45" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
          <path d="M30 60 Q 40 47, 50 60 T 70 60 T 90 60" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      );
    case "gic":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#00205B"/>
          <path d="M50 25 L75 35 L75 55 Q 75 75, 50 82 Q 25 75, 25 55 L25 35 Z" fill="#FFFFFF"/>
          <path d="M50 29 L70 38 L70 53 Q 70 70, 50 77 Q 30 70, 30 53 L30 38 Z" fill="#00205B"/>
        </svg>
      );
    case "indian_bank":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0055A5"/>
          <circle cx="50" cy="50" r="26" fill="#FFFFFF"/>
          <path d="M50 24 L50 76 M24 50 L76 50" stroke="#0055A5" strokeWidth="5"/>
        </svg>
      );
    case "ippb":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#6F2C91"/>
          <circle cx="50" cy="50" r="24" fill="#FFFFFF"/>
          <text x="50" y="58" fontSize="22" fontWeight="900" fill="#6F2C91" textAnchor="middle" fontFamily="sans-serif">P</text>
        </svg>
      );
    case "nainital":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#008080"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#FFFFFF" strokeWidth="4"/>
          <path d="M50 30 L50 70" stroke="#FFFFFF" strokeWidth="4"/>
        </svg>
      );
    case "nhb":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#00427A"/>
          <path d="M32 50 L50 32 L68 50 L68 72 L32 72 Z" fill="#FFFFFF"/>
          <rect x="45" y="52" width="10" height="20" fill="#00427A"/>
        </svg>
      );
    case "oicl":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#004B87"/>
          <path d="M30 45c10-8 30-8 40 0s10 18 0 25-30 8-40 0-10-17 0-25z" fill="#00A86B"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#FFFFFF" strokeWidth="3"/>
        </svg>
      );
    case "epfo":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#00875A"/>
          <circle cx="50" cy="50" r="26" fill="#FFFFFF"/>
          <circle cx="50" cy="50" r="16" fill="#00875A"/>
        </svg>
      );
    case "fci":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0072CE"/>
          <path d="M40 70 Q 50 35, 60 25 Q 52 50, 48 70" fill="#4CD964"/>
          <path d="M46 70 Q 56 35, 66 25 Q 58 50, 54 70" fill="#4CD964"/>
        </svg>
      );
    case "ssc":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#1E2D5A" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="36" fill="none" stroke="#E5C158" strokeWidth="1" strokeDasharray="3,2"/>
          <path d="M32 56 C28 44 34 32 50 32 C66 32 72 44 68 56 C64 64 58 66 50 66 C42 66 36 64 32 56 Z" fill="none" stroke="#E5C158" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="50" y="53" fontSize="15" fontWeight="900" fill="#E5C158" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">SSC</text>
          <polygon points="50,24 52,28 56,28 53,30 54,34 50,32 46,34 47,30 44,28 48,28" fill="#E5C158"/>
          <path d="M34 60 Q50 66 66 60" fill="none" stroke="#E5C158" strokeWidth="3"/>
        </svg>
      );
    case "rrb":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0B2F8F" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,3"/>
          <rect x="34" y="44" width="32" height="18" fill="#E5C158"/>
          <rect x="42" y="32" width="16" height="12" fill="#E5C158"/>
          <path d="M40 32 L60 32 L58 30 L42 30 Z" fill="#FFFFFF"/>
          <rect x="36" y="34" width="4" height="10" fill="#E5C158"/>
          <path d="M34 34 L42 34 L40 32 L36 32 Z" fill="#FFFFFF"/>
          <polygon points="34,62 30,68 70,68 66,62" fill="#FFFFFF"/>
          <circle cx="34" cy="46" r="3" fill="#FFFFFF"/>
          <polygon points="34,46 22,40 22,52" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,1"/>
          <circle cx="40" cy="62" r="4" fill="#0B2F8F" stroke="#E5C158" strokeWidth="2"/>
          <circle cx="50" cy="62" r="4" fill="#0B2F8F" stroke="#E5C158" strokeWidth="2"/>
          <circle cx="60" cy="62" r="4" fill="#0B2F8F" stroke="#E5C158" strokeWidth="2"/>
          <text x="50" y="24" fontSize="8" fontWeight="900" fill="#E5C158" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">RRB</text>
        </svg>
      );
    case "upsc":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0A1128" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="36" fill="none" stroke="#E5C158" strokeWidth="0.8" strokeDasharray="2,2"/>
          <circle cx="50" cy="46" r="14" fill="none" stroke="#E5C158" strokeWidth="2"/>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x2 = 50 + 14 * Math.cos(angle);
            const y2 = 46 + 14 * Math.sin(angle);
            return (
              <line key={i} x1="50" y1="46" x2={x2} y2={y2} stroke="#E5C158" strokeWidth="1" />
            );
          })}
          <path d="M38 60 C38 60 44 65 50 60 C56 65 62 60 62 60" fill="none" stroke="#E5C158" strokeWidth="2" strokeLinecap="round"/>
          <text x="50" y="72" fontSize="9" fontWeight="900" fill="#E5C158" textAnchor="middle" letterSpacing="1.5" fontFamily="sans-serif">UPSC</text>
        </svg>
      );
    case "neet":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#7F1D1D" stroke="#E5C158" strokeWidth="2"/>
          <rect x="44" y="24" width="12" height="52" fill="#B91C1C" rx="2"/>
          <rect x="24" y="44" width="52" height="12" fill="#B91C1C" rx="2"/>
          <rect x="46" y="26" width="8" height="48" fill="#FFFFFF" rx="1"/>
          <rect x="26" y="46" width="48" height="8" fill="#FFFFFF" rx="1"/>
          <line x1="50" y1="20" x2="50" y2="80" stroke="#E5C158" strokeWidth="3" strokeLinecap="round"/>
          <path d="M46 70 C42 66 42 60 50 56 C58 52 58 46 50 42 C42 38 42 32 50 28 C58 24 54 20 50 20" fill="none" stroke="#E5C158" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="50" cy="20" r="2" fill="#E5C158"/>
        </svg>
      );
    case "jee":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#1E3A8A" stroke="#E5C158" strokeWidth="2"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#E5C158" strokeWidth="4" strokeDasharray="6,4"/>
          <circle cx="50" cy="50" r="22" fill="none" stroke="#E5C158" strokeWidth="2"/>
          <circle cx="50" cy="50" r="14" fill="#1E3A8A"/>
          <ellipse cx="50" cy="50" rx="28" ry="8" fill="none" stroke="#FFFFFF" strokeWidth="1" transform="rotate(30 50 50)"/>
          <ellipse cx="50" cy="50" rx="28" ry="8" fill="none" stroke="#FFFFFF" strokeWidth="1" transform="rotate(90 50 50)"/>
          <ellipse cx="50" cy="50" rx="28" ry="8" fill="none" stroke="#FFFFFF" strokeWidth="1" transform="rotate(150 50 50)"/>
          <circle cx="50" cy="50" r="3.5" fill="#E5C158"/>
          <polygon points="50,16 64,22 50,28 36,22" fill="#E5C158"/>
          <path d="M42 24.5 L42 32 C42 36 58 36 58 32 L58 24.5" fill="#E5C158"/>
          <path d="M64 22 L64 34" stroke="#E5C158" strokeWidth="1"/>
          <circle cx="64" cy="34" r="1.5" fill="#E5C158"/>
        </svg>
      );
    case "bank_mh":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0054A6"/>
          <path d="M50 24 C36 24 34 38 34 50 C34 68 50 78 50 78 C50 78 66 68 66 50 C66 38 64 24 50 24 Z" fill="none" stroke="#FFFFFF" strokeWidth="4.5"/>
          <path d="M50 36 L50 64 M40 50 L60 50" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>
      );
    case "lvb":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#D32F2F"/>
          <circle cx="50" cy="50" r="28" fill="#F1B434"/>
          <circle cx="50" cy="50" r="16" fill="#D32F2F"/>
          <circle cx="50" cy="50" r="8" fill="#F1B434"/>
        </svg>
      );
    case "central":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#E53935"/>
          <circle cx="50" cy="50" r="34" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
          <path d="M 38,62 C 38,40 50,30 50,30 C 50,30 62,40 62,62" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
          <path d="M 44,62 C 44,46 50,40 50,40 C 50,40 56,46 56,62" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="30" x2="50" y2="62" stroke="#FFFFFF" strokeWidth="2.5"/>
        </svg>
      );
    case "delhi_police":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0D1E3A" stroke="#E5C158" strokeWidth="2"/>
          <circle cx="50" cy="50" r="36" fill="none" stroke="#E5C158" strokeWidth="1" strokeDasharray="3,2"/>
          <path d="M30 38 C30 30 50 25 50 25 C50 25 70 30 70 38 C70 54 50 72 50 72 C50 72 30 54 30 38 Z" fill="#991B1B"/>
          <path d="M50 25 C50 25 70 30 70 38 C70 54 50 72 50 72 L50 25 Z" fill="#1D4ED8"/>
          <path d="M36 60 L64 32 M64 60 L36 32" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round"/>
          <circle cx="50" cy="46" r="14" fill="#0D1E3A" stroke="#E5C158" strokeWidth="1.5"/>
          <text x="50" y="52" fontSize="12" fontWeight="900" fill="#E5C158" textAnchor="middle" fontFamily="sans-serif">DP</text>
        </svg>
      );
    case "rpf":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#7F1D1D" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#E5C158" strokeWidth="1"/>
          <path d="M30 52 C28 40 38 30 50 30 C62 30 72 40 70 52 C68 62 60 68 50 68 C40 68 32 62 30 52 Z" fill="none" stroke="#E5C158" strokeWidth="1.5" strokeDasharray="4,3"/>
          <polygon points="50,26 54,38 66,38 56,46 60,58 50,50 40,58 44,46 34,38 46,38" fill="#E5C158"/>
          <rect x="30" y="50" width="40" height="12" rx="4" fill="#1E3A8A" stroke="#E5C158" strokeWidth="1"/>
          <text x="50" y="59" fontSize="8" fontWeight="900" fill="#E5C158" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">RPF</text>
        </svg>
      );
    case "appsc":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#065F46" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,2"/>
          <path d="M38 68 L62 68 L58 72 L42 72 Z" fill="#E5C158"/>
          <path d="M34 54 C34 68 66 68 66 54 C66 46 60 44 50 44 C40 44 34 46 34 54 Z" fill="#E5C158"/>
          <ellipse cx="50" cy="44" rx="10" ry="2" fill="#E5C158" stroke="#065F46" strokeWidth="0.5"/>
          <path d="M44 44 C44 32 50 24 50 24 C50 24 56 32 56 44 Z" fill="#D97706"/>
          <path d="M42 44 C34 40 32 46 36 48 Z" fill="#047857" stroke="#E5C158" strokeWidth="0.5"/>
          <path d="M58 44 C66 40 68 46 64 48 Z" fill="#047857" stroke="#E5C158" strokeWidth="0.5"/>
          <path d="M46 44 C42 36 40 42 44 44 Z" fill="#047857" stroke="#E5C158" strokeWidth="0.5"/>
          <path d="M54 44 C58 36 60 42 56 44 Z" fill="#047857" stroke="#E5C158" strokeWidth="0.5"/>
          <path d="M34 54 Q50 60 66 54" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
          <path d="M36 58 Q50 64 64 58" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
        </svg>
      );
    case "tspsc":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0F766E" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3,3"/>
          <rect x="28" y="66" width="10" height="6" fill="#E5C158"/>
          <rect x="62" y="66" width="10" height="6" fill="#E5C158"/>
          <rect x="31" y="44" width="4" height="22" fill="#E5C158"/>
          <rect x="65" y="44" width="4" height="22" fill="#E5C158"/>
          <path d="M29 44 L37 44 L35 41 L31 41 Z" fill="#E5C158"/>
          <path d="M63 44 L71 44 L69 41 L65 41 Z" fill="#E5C158"/>
          <rect x="26" y="37" width="48" height="4" fill="#E5C158"/>
          <rect x="24" y="32" width="52" height="3" fill="#E5C158"/>
          <path d="M32 32 C32 20 68 20 68 32 Z" fill="none" stroke="#E5C158" strokeWidth="3"/>
          <polygon points="50,32 53,38 47,38" fill="#E5C158"/>
          <path d="M35 32 C35 24 65 24 65 32" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
          <line x1="20" y1="72" x2="80" y2="72" stroke="#FFFFFF" strokeWidth="1.5"/>
        </svg>
      );
    case "bits":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0A2540" stroke="#E5C158" strokeWidth="2"/>
          <path d="M32 30 C32 30 32 60 50 74 C68 60 68 30 68 30 Z" fill="#1E3A8A" stroke="#E5C158" strokeWidth="1.5"/>
          <path d="M32 40 L60 68 L68 62 L40 34 Z" fill="#E5C158"/>
          <path d="M52 38 L60 34 L62 42 L54 46 Z" fill="#FFFFFF"/>
          <line x1="56" y1="39" x2="60" y2="43" stroke="#1E3A8A" strokeWidth="1"/>
          <circle cx="40" cy="58" r="5" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
          <path d="M40 52 L40 54 M40 62 L40 64 M34 58 L36 58 M44 58 L46 58" stroke="#FFFFFF" strokeWidth="1.5"/>
          <polygon points="50,18 52,22 56,22 53,25 54,29 50,27 46,29 47,25 44,22 48,22" fill="#E5C158"/>
        </svg>
      );
    case "vit":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#003566" stroke="#E5C158" strokeWidth="2"/>
          <polygon points="50,22 72,32 72,62 50,78 28,62 28,32" fill="#1D4ED8" stroke="#E5C158" strokeWidth="1.5"/>
          <path d="M36 48 C36 40 64 40 64 48 C64 56 36 56 36 48 Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
          <path d="M50 30 L50 66" stroke="#FFFFFF" strokeWidth="1.5"/>
          <line x1="30" y1="48" x2="70" y2="48" stroke="#FFFFFF" strokeWidth="1.5"/>
          <text x="50" y="64" fontSize="18" fontWeight="900" fill="#E5C158" textAnchor="middle" fontFamily="sans-serif">V</text>
        </svg>
      );
    case "ap_police":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#065F46" stroke="#E5C158" strokeWidth="2"/>
          <path d="M30 28 C30 28 30 54 50 74 C70 54 70 28 70 28 Z" fill="#1E3A8A" stroke="#E5C158" strokeWidth="2"/>
          <polygon points="50,34 53,42 61,42 55,47 57,55 50,50 43,55 45,47 39,42 47,42" fill="#E5C158"/>
          <path d="M32 62 Q50 68 68 62" fill="none" stroke="#E5C158" strokeWidth="5"/>
          <text x="50" y="64" fontSize="6.5" fontWeight="900" fill="#1E3A8A" textAnchor="middle" fontFamily="sans-serif">AP POLICE</text>
        </svg>
      );
    case "ts_police":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0F766E" stroke="#E5C158" strokeWidth="2"/>
          <path d="M30 28 C30 28 30 54 50 74 C70 54 70 28 70 28 Z" fill="#111827" stroke="#E5C158" strokeWidth="2"/>
          <path d="M42 54 L42 44 C42 38 58 38 58 44 L58 54" fill="none" stroke="#E5C158" strokeWidth="2"/>
          <line x1="38" y1="54" x2="62" y2="54" stroke="#E5C158" strokeWidth="2"/>
          <path d="M32 62 Q50 68 68 62" fill="none" stroke="#E5C158" strokeWidth="5"/>
          <text x="50" y="64" fontSize="6" fontWeight="900" fill="#111827" textAnchor="middle" fontFamily="sans-serif">TS POLICE</text>
        </svg>
      );
    case "court":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#1E2D5A" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#E5C158" strokeWidth="1" strokeDasharray="3,1"/>
          <line x1="50" y1="26" x2="50" y2="68" stroke="#E5C158" strokeWidth="3"/>
          <path d="M40 68 L60 68 L55 72 L45 72 Z" fill="#E5C158"/>
          <line x1="32" y1="34" x2="68" y2="34" stroke="#E5C158" strokeWidth="3"/>
          <line x1="34" y1="34" x2="26" y2="52" stroke="#E5C158" strokeWidth="1"/>
          <line x1="34" y1="34" x2="42" y2="52" stroke="#E5C158" strokeWidth="1"/>
          <path d="M24 52 Q34 56 44 52 Z" fill="#E5C158"/>
          <line x1="66" y1="34" x2="58" y2="52" stroke="#E5C158" strokeWidth="1"/>
          <line x1="66" y1="34" x2="74" y2="52" stroke="#E5C158" strokeWidth="1"/>
          <path d="M56 52 Q66 56 76 52 Z" fill="#E5C158"/>
          <polygon points="50,26 52,32 48,32" fill="#FFFFFF"/>
        </svg>
      );
    case "dsc":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#312E81" stroke="#E5C158" strokeWidth="2.5"/>
          <path d="M50 64 C50 64 62 58 74 62 L74 38 C62 34 50 40 50 40 C50 40 38 34 26 38 L26 62 C38 58 50 64 50 64 Z" fill="#FFFFFF" stroke="#E5C158" strokeWidth="1"/>
          <line x1="50" y1="40" x2="50" y2="64" stroke="#E5C158" strokeWidth="2"/>
          <path d="M50 40 C46 36 44 30 50 20 C56 30 54 36 50 40 Z" fill="#EF4444"/>
          <path d="M50 40 C48 37 46 34 50 28 C54 34 52 37 50 40 Z" fill="#F59E0B"/>
          <line x1="50" y1="14" x2="50" y2="18" stroke="#E5C158" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="36" y1="18" x2="40" y2="22" stroke="#E5C158" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="64" y1="18" x2="60" y2="22" stroke="#E5C158" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "sachivalayam":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#166534" stroke="#E5C158" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3,3"/>
          <path d="M26 68 L26 52 L36 44 L46 52 L46 68 Z" fill="#E5C158"/>
          <path d="M32 68 L32 58 L40 58 L40 68 Z" fill="#166534"/>
          <circle cx="56" cy="38" r="8" fill="#F59E0B"/>
          <path d="M68 68 L68 56 L64 56 L64 68 Z" fill="#78350F"/>
          <circle cx="66" cy="50" r="10" fill="#22C55E"/>
          <circle cx="72" cy="46" r="7" fill="#15803D"/>
          <circle cx="60" cy="48" r="8" fill="#166534"/>
          <line x1="20" y1="68" x2="80" y2="68" stroke="#FFFFFF" strokeWidth="2"/>
        </svg>
      );
    case "state":
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#0D9488"/>
          <path d="M36 72 L64 72 L60 60 L62 60 L58 46 L60 46 L55 30 L60 30 L50 18 L40 30 L45 30 L40 46 L42 46 L38 60 L40 60 Z" fill="#FFFFFF"/>
          <line x1="30" y1="72" x2="70" y2="72" stroke="#FFFFFF" strokeWidth="3"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" width="46" height="46" className="exam-svg-logo">
          <circle cx="50" cy="50" r="40" fill="#64748B"/>
          <text x="50" y="58" fontSize="22" fontWeight="900" fill="#FFFFFF" textAnchor="middle">EX</text>
        </svg>
      );
  }
};

// Complete courses database modeled from Oliveboard categories grid
export const ALL_EXAMS = [
  // Bank & Insurance
  { id: "sbi_po", title: "SBI PO", category: "Bank & Insurance", logoType: "sbi", price: 10, mrp: 14999, duration: "6 Months" },
  { id: "sbi_clerk", title: "SBI Clerk", category: "Bank & Insurance", logoType: "sbi", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ibps_rrb_clerk", title: "IBPS RRB Clerk", category: "Bank & Insurance", logoType: "ibps", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ibps_rrb_po", title: "IBPS RRB PO", category: "Bank & Insurance", logoType: "ibps", price: 8999, mrp: 14999, duration: "6 Months" },
  { id: "ibps_po", title: "IBPS PO", category: "Bank & Insurance", logoType: "ibps", price: 8999, mrp: 14999, duration: "6 Months" },
  { id: "ibps_clerk", title: "IBPS Clerk", category: "Bank & Insurance", logoType: "ibps", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "nicl_ao", title: "NICL AO", category: "Bank & Insurance", logoType: "oicl", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "nicl_assistant", title: "NICL Assistant", category: "Bank & Insurance", logoType: "oicl", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "niacl_ao", title: "NIACL AO", category: "Bank & Insurance", logoType: "oicl", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "niacl_assistant", title: "NIACL Assistant", category: "Bank & Insurance", logoType: "oicl", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ibps_so", title: "IBPS SO", category: "Bank & Insurance", logoType: "ibps", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "ibps_afo", title: "IBPS AFO", category: "Bank & Insurance", logoType: "ibps", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "lic_aao", title: "LIC AAO", category: "Bank & Insurance", logoType: "lic", price: 8999, mrp: 14999, duration: "5 Months" },
  { id: "lic_aao_so", title: "LIC AAO SO/ AE Specialist", category: "Bank & Insurance", logoType: "lic", price: 8999, mrp: 14999, duration: "5 Months" },
  { id: "lic_ado", title: "LIC ADO", category: "Bank & Insurance", logoType: "lic", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "lic_assistant", title: "LIC Assistant Exam", category: "Bank & Insurance", logoType: "lic", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "lic_hfl", title: "LIC HFL", category: "Bank & Insurance", logoType: "lic_hfl", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "rbi_assistant", title: "RBI Assistant", category: "Bank & Insurance", logoType: "rbi", price: 6999, mrp: 11999, duration: "6 Months" },
  { id: "bob_lbo", title: "BoB LBO", category: "Bank & Insurance", logoType: "bob", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "sbi_apprentice", title: "SBI Apprentice", category: "Bank & Insurance", logoType: "sbi", price: 4999, mrp: 7999, duration: "4 Months" },
  { id: "bank_of_mh", title: "Bank of MH Manipal", category: "Bank & Insurance", logoType: "bank_mh", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "canara_bank_po", title: "Canara Bank PO", category: "Bank & Insurance", logoType: "canara", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "dena_bank_po", title: "Dena Bank PO", category: "Bank & Insurance", logoType: "dena", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "ecgc_po", title: "ECGC PO", category: "Bank & Insurance", logoType: "ecgc", price: 8999, mrp: 14999, duration: "6 Months" },
  { id: "esic_sso", title: "ESIC SSO", category: "Bank & Insurance", logoType: "esic", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "esic_udc", title: "ESIC UDC", category: "Bank & Insurance", logoType: "esic", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "gic_am", title: "GIC Assistant Manager", category: "Bank & Insurance", logoType: "gic", price: 8999, mrp: 14999, duration: "5 Months" },
  { id: "idbi_am", title: "IDBI Assistant Manager", category: "Bank & Insurance", logoType: "idbi", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "idbi_executive", title: "IDBI Executive", category: "Bank & Insurance", logoType: "idbi", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "indian_bank_po", title: "Indian Bank PO", category: "Bank & Insurance", logoType: "indian_bank", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "ippb_officer", title: "IPPB Officer", category: "Bank & Insurance", logoType: "ippb", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "lakshmi_vilas", title: "Lakshmi Vilas Bank PO", category: "Bank & Insurance", logoType: "lvb", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "nainital_bank", title: "Nainital Bank", category: "Bank & Insurance", logoType: "nainital", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "nainital_po", title: "Nainital Bank PO", category: "Bank & Insurance", logoType: "nainital", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "nhb_assistant", title: "NHB Assistant", category: "Bank & Insurance", logoType: "nhb", price: 6999, mrp: 10999, duration: "5 Months" },
  { id: "oicl_ao", title: "OICL AO", category: "Bank & Insurance", logoType: "oicl", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "pnb_it", title: "PNB IT Officer", category: "Bank & Insurance", logoType: "pnb", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "central_warehouse", title: "Central Warehousing Corp", category: "Bank & Insurance", logoType: "central", price: 6999, mrp: 10999, duration: "5 Months" },
  { id: "epfo_assistant", title: "EPFO Assistant", category: "Bank & Insurance", logoType: "epfo", price: 6999, mrp: 10999, duration: "5 Months" },
  { id: "fci_manager", title: "FCI Manager", category: "Bank & Insurance", logoType: "fci", price: 7999, mrp: 12999, duration: "5 Months" },

  // SSC Exams
  { id: "ssc_cgl", title: "SSC CGL", category: "SSC Exams", logoType: "ssc", price: 9999, mrp: 16999, duration: "8 Months" },
  { id: "ssc_chsl", title: "SSC CHSL", category: "SSC Exams", logoType: "ssc", price: 6999, mrp: 11999, duration: "6 Months" },
  { id: "ssc_mts", title: "SSC MTS", category: "SSC Exams", logoType: "ssc", price: 4999, mrp: 8999, duration: "5 Months" },
  { id: "ssc_cpo", title: "SSC CPO", category: "SSC Exams", logoType: "ssc", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "ssc_gd", title: "SSC GD", category: "SSC Exams", logoType: "ssc", price: 4999, mrp: 7999, duration: "4 Months" },
  { id: "ssc_steno", title: "SSC Stenographer", category: "SSC Exams", logoType: "ssc", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "delhi_police", title: "Delhi Police Constable", category: "SSC Exams", logoType: "delhi_police", price: 4999, mrp: 7999, duration: "4 Months" },
  { id: "ssc_selection", title: "SSC Selection Post", category: "SSC Exams", logoType: "ssc", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ssc_je", title: "SSC JE (Junior Engineer)", category: "SSC Exams", logoType: "ssc", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "ssc_jht", title: "SSC JHT (Translator)", category: "SSC Exams", logoType: "ssc", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ssc_cgl_tier2", title: "SSC CGL Tier-2 Special", category: "SSC Exams", logoType: "ssc", price: 6999, mrp: 10999, duration: "4 Months" },
  { id: "ssc_chsl_tier2", title: "SSC CHSL Tier-2 Focus", category: "SSC Exams", logoType: "ssc", price: 4999, mrp: 7999, duration: "3 Months" },
  { id: "ssc_cpo_paper2", title: "SSC CPO Paper-2 English", category: "SSC Exams", logoType: "ssc", price: 5999, mrp: 9999, duration: "3 Months" },
  { id: "ssc_mts_havildar", title: "SSC MTS & Havildar", category: "SSC Exams", logoType: "ssc", price: 4999, mrp: 8999, duration: "5 Months" },
  { id: "ssc_imd", title: "SSC IMD Scientific Asst", category: "SSC Exams", logoType: "ssc", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "delhi_police_hc", title: "Delhi Police Head Constable", category: "SSC Exams", logoType: "delhi_police", price: 4999, mrp: 7999, duration: "5 Months" },

  // Railways
  { id: "rrb_asm", title: "RRB Assistant Station Master (ASM)", category: "RRB & Railways", logoType: "rrb", price: 6999, mrp: 11999, duration: "6 Months" },
  { id: "rrb_tc", title: "Railway TC", category: "RRB & Railways", logoType: "rrb", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "rrb_ntpc_tamil", title: "RRB NTPC (Tamil)", category: "RRB & Railways", logoType: "rrb", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "rrb_tte", title: "Railway TTE", category: "RRB & Railways", logoType: "rrb", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "rrb_ntpc_malayalam", title: "RRB NTPC (Malayalam)", category: "RRB & Railways", logoType: "rrb", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "rrb_technician", title: "RRB Technician", category: "RRB & Railways", logoType: "rrb", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "rrb_ntpc", title: "RRB (NTPC)", category: "RRB & Railways", logoType: "rrb", price: 6999, mrp: 11999, duration: "6 Months" },
  { id: "rrb_group_d", title: "RRB/RRC Group D", category: "RRB & Railways", logoType: "rrb", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "rrb_gd", title: "RRB GD", category: "RRB & Railways", logoType: "rrb", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "rrb_group_d_telugu", title: "RRB / RRC Group D (Telugu)", category: "RRB & Railways", logoType: "rrb", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "rrb_alp", title: "RRB ALP", category: "RRB & Railways", logoType: "rrb", price: 6999, mrp: 10999, duration: "5 Months" },
  { id: "rrb_alp_psychometric", title: "RRB ALP Psychometric Test", category: "RRB & Railways", logoType: "rrb", price: 5999, mrp: 8999, duration: "5 Months" },
  { id: "rrb_ntpc_kannada", title: "RRB NTPC (Kannada)", category: "RRB & Railways", logoType: "rrb", price: 5999, mrp: 9999, duration: "5 Months" },

  // UPSC / Civil
  { id: "upsc_cse", title: "UPSC CSE Prelims", category: "UPSC / Civil", logoType: "upsc", price: 24999, mrp: 39999, duration: "12 Months" },
  { id: "upsc_cse_mains", title: "UPSC CSE Mains (Offline)", category: "UPSC / Civil", logoType: "upsc", price: 26999, mrp: 41999, duration: "12 Months" },
  { id: "appsc_group1", title: "APPSC Group-1", category: "UPSC / Civil", logoType: "appsc", price: 1, mrp: 24999, duration: "9 Months" },
  { id: "tspsc_group1", title: "TSPSC Group-1", category: "UPSC / Civil", logoType: "tspsc", price: 14999, mrp: 24999, duration: "9 Months" },
  { id: "appsc_group3", title: "APPSC Group-3 Panchayat", category: "UPSC / Civil", logoType: "appsc", price: 8999, mrp: 14999, duration: "6 Months" },
  { id: "appsc_group4", title: "APPSC Group-4 Junior Asst", category: "UPSC / Civil", logoType: "appsc", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "tspsc_group3", title: "TSPSC Group-3 Panchayat", category: "UPSC / Civil", logoType: "tspsc", price: 8999, mrp: 14999, duration: "6 Months" },
  { id: "tspsc_group4", title: "TSPSC Group-4 Junior Asst", category: "UPSC / Civil", logoType: "tspsc", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "upsc_csat", title: "UPSC Civil Services CSAT", category: "UPSC / Civil", logoType: "upsc", price: 8999, mrp: 14999, duration: "5 Months" },
  { id: "upsc_epfo_ao", title: "UPSC EPFO EO/AO Exam", category: "UPSC / Civil", logoType: "upsc", price: 7999, mrp: 12999, duration: "5 Months" },
  { id: "upsc_apfc", title: "UPSC APFC Officer", category: "UPSC / Civil", logoType: "upsc", price: 9999, mrp: 15999, duration: "6 Months" },
  { id: "upsc_cds", title: "UPSC Combined Defence (CDS)", category: "UPSC / Civil", logoType: "upsc", price: 8999, mrp: 14999, duration: "6 Months" },
  { id: "upsc_nda", title: "UPSC National Defence (NDA)", category: "UPSC / Civil", logoType: "upsc", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "appsc_group1_mains", title: "APPSC Group-1 Mains Special", category: "UPSC / Civil", logoType: "appsc", price: 12999, mrp: 19999, duration: "6 Months" },
  { id: "tspsc_group1_mains", title: "TSPSC Group-1 Mains Special", category: "UPSC / Civil", logoType: "tspsc", price: 12999, mrp: 19999, duration: "6 Months" },

  // NEET / JEE
  { id: "neet_ug", title: "NEET UG", category: "NEET / JEE", logoType: "neet", price: 18999, mrp: 29999, duration: "12 Months" },
  { id: "jee_main", title: "JEE Main", category: "NEET / JEE", logoType: "jee", price: 15999, mrp: 24999, duration: "10 Months" },
  { id: "jee_adv", title: "JEE Advanced Focus", category: "NEET / JEE", logoType: "jee", price: 19999, mrp: 29999, duration: "12 Months" },
  { id: "bitsat", title: "BITSAT Comprehensive", category: "NEET / JEE", logoType: "bits", price: 12999, mrp: 19999, duration: "8 Months" },
  { id: "ap_eapcet", title: "AP EAPCET (EAMCET)", category: "NEET / JEE", logoType: "appsc", price: 9999, mrp: 14999, duration: "6 Months" },
  { id: "ts_eapcet", title: "TS EAPCET (EAMCET)", category: "NEET / JEE", logoType: "tspsc", price: 9999, mrp: 14999, duration: "6 Months" },
  { id: "neet_dropper", title: "NEET UG Dropper's Batch", category: "NEET / JEE", logoType: "neet", price: 19999, mrp: 29999, duration: "12 Months" },
  { id: "jee_dropper", title: "JEE Main & Adv Dropper", category: "NEET / JEE", logoType: "jee", price: 17999, mrp: 26999, duration: "12 Months" },
  { id: "ap_eapcet_agri", title: "AP EAPCET Agriculture Focus", category: "NEET / JEE", logoType: "appsc", price: 9999, mrp: 14999, duration: "6 Months" },
  { id: "ts_eapcet_agri", title: "TS EAPCET Agriculture Focus", category: "NEET / JEE", logoType: "tspsc", price: 9999, mrp: 14999, duration: "6 Months" },
  { id: "viteee", title: "VITEEE Engineering Prep", category: "NEET / JEE", logoType: "vit", price: 8999, mrp: 13999, duration: "5 Months" },

  // State Exams
  { id: "appsc_group2", title: "APPSC Group-2 Premium", category: "State Exams", logoType: "appsc", price: 11999, mrp: 19999, duration: "9 Months" },
  { id: "tspsc_group2", title: "TSPSC Group-2 Premium", category: "State Exams", logoType: "tspsc", price: 11999, mrp: 19999, duration: "9 Months" },
  { id: "ap_police", title: "AP Police SI & Constable", category: "State Exams", logoType: "ap_police", price: 6999, mrp: 11999, duration: "6 Months" },
  { id: "ts_police", title: "TS Police SI & Constable", category: "State Exams", logoType: "ts_police", price: 6999, mrp: 11999, duration: "6 Months" },
  { id: "grama_sach", title: "AP Grama Sachivalayam", category: "State Exams", logoType: "sachivalayam", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ap_hc", title: "AP High Court Assistant", category: "State Exams", logoType: "court", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ts_hc", title: "TS High Court Assistant", category: "State Exams", logoType: "court", price: 5999, mrp: 9999, duration: "5 Months" },
  { id: "ap_dsc", title: "AP DSC (SGT & School Asst)", category: "State Exams", logoType: "dsc", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "ts_dsc", title: "TS DSC (SGT & School Asst)", category: "State Exams", logoType: "dsc", price: 7999, mrp: 12999, duration: "6 Months" },
  { id: "ap_police_si", title: "AP Police Sub Inspector (SI)", category: "State Exams", logoType: "ap_police", price: 5999, mrp: 8999, duration: "5 Months" },
  { id: "ap_police_const", title: "AP Police Constable Special", category: "State Exams", logoType: "ap_police", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "ts_police_si", title: "TS Police Sub Inspector (SI)", category: "State Exams", logoType: "ts_police", price: 5999, mrp: 8999, duration: "5 Months" },
  { id: "ts_police_const", title: "TS Police Constable Special", category: "State Exams", logoType: "ts_police", price: 4999, mrp: 7999, duration: "5 Months" },
  { id: "ap_tet", title: "AP Teacher Eligibility Test", category: "State Exams", logoType: "dsc", price: 4999, mrp: 7999, duration: "4 Months" },
  { id: "ts_tet", title: "TS Teacher Eligibility Test", category: "State Exams", logoType: "dsc", price: 4999, mrp: 7999, duration: "4 Months" },
  { id: "ap_sub_registrar", title: "APPSC Sub Registrar Focus", category: "State Exams", logoType: "appsc", price: 8999, mrp: 14999, duration: "6 Months" }
];

export const STANDARD_SYLLABUS = [
  {
    subject: "Quantitative Aptitude",
    concepts: [
      { name: "Simplification & Approximation", weightage: "5-10 Marks", difficulty: "Easy" },
      { name: "Data Interpretation (DI)", weightage: "10-15 Marks", difficulty: "Hard" },
      { name: "Number Series (Missing & Wrong)", weightage: "5 Marks", difficulty: "Medium" },
      { name: "Arithmetic Word Problems", weightage: "10 Marks", difficulty: "Hard" }
    ]
  },
  {
    subject: "Reasoning Ability",
    concepts: [
      { name: "Puzzles & Seating Arrangement", weightage: "15-20 Marks", difficulty: "Hard" },
      { name: "Syllogism & Logical Reasoning", weightage: "5 Marks", difficulty: "Easy" },
      { name: "Coding-Decoding", weightage: "3-5 Marks", difficulty: "Easy" }
    ]
  },
  {
    subject: "English Language",
    concepts: [
      { name: "Reading Comprehension", weightage: "10 Marks", difficulty: "Hard" },
      { name: "Error Spotting & Grammar", weightage: "5 Marks", difficulty: "Medium" }
    ]
  }
];

export function generateQuantQuestion(i, category = "Bank & Insurance") {
  const topics = ["Aptitude", "Arithmetic", "Calculation"];
  
  if (category === "NEET / JEE") {
    // Physics Numerical questions
    const physicsTopics = ["Kinematics", "Force and Motion", "Work and Energy", "Electrostatics"];
    const pTopic = physicsTopics[i % physicsTopics.length];
    if (pTopic === "Kinematics") {
      const v = 10 + (i % 6) * 5; // 10, 15, 20... m/s
      const t = 2 + (i % 4) * 2;  // 2, 4, 6, 8 s
      const d = v * t;
      return {
        q: `A car accelerates uniformly from rest to a velocity of ${v} m/s in ${t} seconds. Find the distance traveled by the car during this time interval.`,
        options: [`${d} m`, `${(d / 2).toFixed(0)} m`, `${d * 2} m`, `${(d * 1.5).toFixed(0)} m`],
        correct: 1, // d/2 is correct for s = 0.5 * v * t
        explanation: `Distance s = Average Velocity * Time. Since initial velocity u = 0 and final velocity v = ${v} m/s, Average Velocity = (u + v)/2 = ${v/2} m/s. Distance s = (${v}/2) * ${t} = ${(v/2)*t} meters. \n\n*Real-Life Example*: When a racer accelerates their motorcycle off a starting line to a speed of ${v} m/s in ${t} seconds, the actual track distance covered is exactly ${(v/2)*t} meters.`
      };
    } else if (pTopic === "Force and Motion") {
      const m = 2 + (i % 5) * 2; // 2, 4, 6, 8, 10 kg
      const a = 3 + (i % 4);     // 3, 4, 5, 6 m/s^2
      const f = m * a;
      return {
        q: `A block of mass ${m} kg is kept on a frictionless horizontal table. What constant horizontal force is required to produce an acceleration of ${a} m/s²?`,
        options: [`${f} N`, `${f + 10} N`, `${(f / 2).toFixed(0)} N`, `${f * 2} N`],
        correct: 0,
        explanation: `According to Newton's Second Law: Force (F) = mass (m) * acceleration (a). Given mass = ${m} kg and acceleration = ${a} m/s². Force = ${m} * ${a} = ${f} Newtons. \n\n*Real-Life Example*: If you are pushing a groceries crate of mass ${m} kg across a smooth supermarket floor to accelerate it at ${a} m/s², you must exert a force of exactly ${f} Newtons.`
      };
    } else if (pTopic === "Work and Energy") {
      const f = 10 + (i % 5) * 10; // 10, 20, 30... N
      const d = 5 + (i % 4) * 5;   // 5, 10, 15, 20 m
      const w = f * d;
      return {
        q: `A constant force of ${f} N acts on a body and displaces it by ${d} meters in the direction of the force. Calculate the work done by this force.`,
        options: [`${w - 50} Joules`, `${w} Joules`, `${w + 100} Joules`, `${(w / 2).toFixed(0)} Joules`],
        correct: 1,
        explanation: `Work Done (W) = Force (F) * Displacement (d) * cos(theta). Since the displacement is in the direction of the force, theta = 0 and cos(0) = 1. W = ${f} * ${d} = ${w} Joules. \n\n*Real-Life Example*: If you drag a heavy travel suitcase along a terminal walkway with a force of ${f} N over a distance of ${d} meters, you expend exactly ${w} Joules of energy.`
      };
    } else {
      const q1 = 2 + (i % 3); // 2, 3, 4 microCoulombs
      const q2 = 5 + (i % 4); // 5, 6, 7, 8 microCoulombs
      const r = 3; // 3 meters
      const f = ((9 * q1 * q2) / (r * r)).toFixed(2);
      return {
        q: `Two point charges of ${q1} µC and ${q2} µC are separated by a distance of ${r} meters in vacuum. Find the magnitude of the electrostatic force between them (k = 9 × 10⁹ N·m²/C²).`,
        options: [`${f} × 10⁻³ N`, `${(f * 2.5).toFixed(2)} × 10⁻³ N`, `${f} × 10⁻⁴ N`, `${(f * 1.5).toFixed(2)} × 10⁻³ N`],
        correct: 0,
        explanation: `Coulomb's Law: F = k * |q1 * q2| / r². Given q1 = ${q1} × 10⁻⁶ C, q2 = ${q2} × 10⁻⁶ C, and r = ${r} m. Force = (9 × 10⁹ * ${q1} × 10⁻⁶ * ${q2} × 10⁻⁶) / ${r * r} = (${9 * q1 * q2} × 10⁻³) / 9 = ${f} × 10⁻³ N. \n\n*Real-Life Example*: When static electricity builds up on two clothes items in a dryer carrying ${q1} µC and ${q2} µC charges respectively at a distance of ${r}m, they attract or repel with a force of ${f} milliNewtons.`
      };
    }
  }

  // Standard Quantitative Aptitude (Banking, SSC, Railways, Civil, State Exams)
  const mathTopics = ["Time and Work", "Profit and Loss", "Averages", "Interest", "Ratio and Proportion", "Speed, Time and Distance", "Simplification"];
  const topic = mathTopics[i % mathTopics.length];
  
  if (topic === "Time and Work") {
    const name1 = ["Rajesh", "Suresh", "Amit", "Rahul", "Priya", "Sneha", "Kiran"][i % 7];
    const name2 = ["Ramesh", "Ganesh", "Sumit", "Rohit", "Anjali", "Neha", "Arjun"][i % 7];
    const d1 = 10 + (i % 5) * 5; // 10, 15, 20, 25, 30
    const d2 = 12 + (i % 4) * 6; // 12, 18, 24, 30
    const total = d1 * d2;
    const combined = (d1 * d2) / (d1 + d2);
    const ans = combined.toFixed(1);
    
    return {
      q: `${name1} can complete a task in ${d1} days, and ${name2} can complete the same task in ${d2} days. If they work together, how many days will they take to complete the task?`,
      options: [`${ans} days`, `${(combined + 2.1).toFixed(1)} days`, `${(combined - 1.5).toFixed(1)} days`, `${(combined * 1.3).toFixed(1)} days`],
      correct: 0,
      explanation: `Combined Work Formula: Time = (d1 * d2) / (d1 + d2). Given d1 = ${d1} and d2 = ${d2}. Combined time = (${d1} * ${d2}) / (${d1} + ${d2}) = ${total} / ${d1 + d2} = ${ans} days. \n\n*Real-Life Example*: If ${name1} and ${name2} are organizing files in an office database, collaborating allows them to combine their speeds, reducing the overall completion time to just ${ans} days.`
    };
  } else if (topic === "Profit and Loss") {
    const item = ["laptop", "mobile phone", "bicycle", "watch", "camera", "tablet", "headphones"][i % 7];
    const cp = 500 + (i % 8) * 150; // 500, 650, 800, 950...
    const profitPct = 10 + (i % 5) * 5; // 10%, 15%, 20%, 25%, 30%
    const profitAmt = (cp * profitPct) / 100;
    const sp = cp + profitAmt;
    
    return {
      q: `A dealer buys a ${item} for Rs. ${cp} and sells it at a profit of ${profitPct}%. What is the selling price of the ${item}?`,
      options: [`Rs. ${sp - 30}`, `Rs. ${sp}`, `Rs. ${sp + 45}`, `Rs. ${cp - profitAmt}`],
      correct: 1,
      explanation: `Selling Price (SP) = Cost Price (CP) * (100 + Profit%) / 100. Given CP = ${cp} and Profit = ${profitPct}%. SP = ${cp} * (100 + ${profitPct}) / 100 = Rs. ${sp}. \n\n*Real-Life Example*: If you buy a ${item} at a wholesale market for Rs. ${cp} and resell it online with a ${profitPct}% markup, your customers pay Rs. ${sp}, netting you a profit of Rs. ${profitAmt}.`
    };
  } else if (topic === "Averages") {
    const count = 4 + (i % 4); // 4, 5, 6, 7
    const oldAvg = 40 + (i % 5) * 5; // 40, 45, 50, 55, 60
    const newVal = 80 + (i % 8) * 5; // 80, 85, 90, 95...
    const newAvg = (oldAvg * count + newVal) / (count + 1);
    const ans = newAvg.toFixed(1);
    
    return {
      q: `The average weight of ${count} students is ${oldAvg} kg. If a teacher weighing ${newVal} kg joins the group, what is the new average weight of the group?`,
      options: [`${(newAvg + 1.5).toFixed(1)} kg`, `${(newAvg - 1.2).toFixed(1)} kg`, `${ans} kg`, `${(newAvg * 1.05).toFixed(1)} kg`],
      correct: 2,
      explanation: `Total weight initially = ${count} * ${oldAvg} = ${oldAvg * count} kg. New total weight = ${oldAvg * count} + ${newVal} = ${oldAvg * count + newVal} kg. Total members = ${count + 1}. New Average = ${oldAvg * count + newVal} / ${count + 1} = ${ans} kg. \n\n*Real-Life Example*: If a small delivery business operates ${count} mini trucks with average cargo of ${oldAvg} tons, adding one large container truck carrying ${newVal} tons raises the average cargo per truck to ${ans} tons.`
    };
  } else if (topic === "Interest") {
    const p = 1000 + (i % 8) * 1000; // 1000, 2000...
    const r = 5 + (i % 4); // 5%, 6%, 7%, 8%
    const t = 2 + (i % 3); // 2, 3, 4 years
    const si = (p * r * t) / 100;
    
    return {
      q: `What is the simple interest earned on a principal amount of Rs. ${p} at an annual interest rate of ${r}% over a period of ${t} years?`,
      options: [`Rs. ${si - 25}`, `Rs. ${si + 40}`, `Rs. ${si}`, `Rs. ${si + 100}`],
      correct: 2,
      explanation: `Simple Interest (SI) = (P * R * T) / 100. P = ${p}, R = ${r}%, T = ${t} years. SI = (${p} * ${r} * ${t}) / 100 = Rs. ${si}. \n\n*Real-Life Example*: If you deposit Rs. ${p} in a savings cooperative scheme that guarantees ${r}% simple interest yearly, you will earn Rs. ${si} as profit after ${t} years.`
    };
  } else if (topic === "Ratio and Proportion") {
    const valA = 2 + (i % 3); // 2, 3, 4
    const valB = 3 + (i % 4); // 3, 4, 5, 6
    const factor = 10 + (i % 8) * 5; // 10, 15, 20...
    const total = (valA + valB) * factor;
    const shareA = valA * factor;
    
    return {
      q: `A sum of Rs. ${total} is divided between A and B in the ratio ${valA}:${valB}. What is the share of A?`,
      options: [`Rs. ${shareA}`, `Rs. ${shareA + 30}`, `Rs. ${shareA - 20}`, `Rs. ${total - shareA}`],
      correct: 0,
      explanation: `Total parts = ${valA} + ${valB} = ${valA + valB}. Value of 1 part = ${total} / ${valA + valB} = ${factor}. Share of A = ${valA} parts * ${factor} = Rs. ${shareA}. \n\n*Real-Life Example*: If two business partners divide a profit of Rs. ${total} in a ratio of ${valA}:${valB} based on their startup investments, Partner A receives a dividend of exactly Rs. ${shareA}.`
    };
  } else if (topic === "Speed, Time and Distance") {
    const speedKmh = 36 + (i % 5) * 18; // 36, 54, 72, 90, 108 km/h
    const speedMs = speedKmh * (5/18);
    const t = 10 + (i % 8) * 2; // 10, 12, 14... seconds
    const length = speedMs * t;
    
    return {
      q: `A train running at a speed of ${speedKmh} km/h crosses a stationary pole in ${t} seconds. What is the length of the train?`,
      options: [`${length - 40} meters`, `${length} meters`, `${length + 50} meters`, `${length * 1.5} meters`],
      correct: 1,
      explanation: `Speed in m/s = ${speedKmh} * (5/18) = ${speedMs} m/s. Length of train (Distance) = Speed * Time = ${speedMs} * ${t} = ${length} meters. \n\n*Real-Life Example*: A railway system designer calculating crossing clearances determines that a train traveling at ${speedKmh} km/h takes ${t} seconds to clear a signal gantry, meaning its physical length is exactly ${length} meters.`
    };
  } else {
    const num1 = 10 + (i % 8) * 2; // 10, 12, 14...
    const num2 = 3 + (i % 4) * 2; // 3, 5, 7, 9
    const num3 = 10 + (i % 5) * 5; // 10, 15, 20...
    const ans = num1 * num2 + num3;
    
    return {
      q: `Simplify the expression using BODMAS rules: ${num1} × ${num2} + ${num3} = ?`,
      options: [`${ans - 10}`, `${ans + 15}`, `${num1 * (num2 + num3)}`, `${ans}`],
      correct: 3,
      explanation: `By BODMAS rules, perform multiplication before addition: ${num1} × ${num2} = ${num1 * num2}. Then perform addition: ${num1 * num2} + ${num3} = ${ans}. \n\n*Real-Life Example*: If you buy ${num2} cases of apples at Rs. ${num1} per case, and pay a flat cargo delivery fee of Rs. ${num3}, the total invoice amount is exactly Rs. ${ans}.`
    };
  }
}

export function generateReasoningQuestion(i, category = "Bank & Insurance") {
  if (category === "NEET / JEE") {
    // Chemistry conceptual questions
    const chemTopics = ["Organic Chemistry", "Atomic Structure", "Periodic Table", "Chemical Bonding"];
    const cTopic = chemTopics[i % chemTopics.length];
    if (cTopic === "Organic Chemistry") {
      return {
        q: `Which of the following organic compounds will yield a silver mirror when treated with Ammoniacal Silver Nitrate (Tollens' reagent)?`,
        options: ["Acetone", "Acetaldehyde", "Ethanol", "Diethyl ether"],
        correct: 1,
        explanation: `Ammoniacal Silver Nitrate is reduced to metallic silver (silver mirror) by aldehydes but not by ketones, alcohols, or ethers. Acetaldehyde is an aldehyde and reacts positively. \n\n*Real-Life Example*: Tollens' chemical reduction is used in crafting vintage silver mirrors by washing the glass with a solution of aldehydes to coat it with metallic silver.`
      };
    } else if (cTopic === "Atomic Structure") {
      const n = 2 + (i % 3); // n = 2, 3, 4
      const orbitals = n * n;
      return {
        q: `What is the total number of atomic orbitals associated with the principal quantum number n = ${n}?`,
        options: [`${orbitals}`, `${n * 2}`, `${orbitals + 2}`, `${n}`],
        correct: 0,
        explanation: `The total number of orbitals in a shell with principal quantum number n is given by the formula n². For n = ${n}, number of orbitals = ${n}² = ${orbitals}. \n\n*Real-Life Example*: Quantum mechanics rules determine how electrons pack in shells. For shell ${n}, there are exactly ${orbitals} separate sub-atomic orbitals where electrons can reside.`
      };
    } else if (cTopic === "Periodic Table") {
      return {
        q: `Identify the element with the highest electronegativity value in the modern periodic table.`,
        options: ["Oxygen", "Chlorine", "Fluorine", "Nitrogen"],
        correct: 2,
        explanation: `Fluorine is the most electronegative element on the Pauling scale (value 3.98) due to its small atomic radius and high nuclear attraction. \n\n*Real-Life Example*: Due to its extreme electronegativity, fluorine is highly reactive and forms robust bonds, which is why Teflon (fluorocarbon) coating is incredibly non-stick and heat-resistant.`
      };
    } else {
      return {
        q: `Which of the following molecules exhibits a planar triangular shape according to VSEPR theory?`,
        options: ["Ammonia (NH₃)", "Boron trifluoride (BF₃)", "Water (H₂O)", "Methane (CH₄)"],
        correct: 1,
        explanation: `Boron trifluoride has 3 bond pairs and 0 lone pairs on the central Boron atom. It has sp² hybridization and forms a symmetric planar triangular geometry. \n\n*Real-Life Example*: The planar shape of molecules like BF₃ allows them to act as electrophiles in chemical catalysts, facilitating bonds in industrial polymer synthesis.`
      };
    }
  }

  // Standard Reasoning (Banking, SSC, Railways, Civil, State Exams)
  const reasoningTopics = ["Syllogism", "Coding-Decoding", "Blood Relation", "Direction Sense", "Ordering", "Seating Arrangement"];
  const topic = reasoningTopics[i % reasoningTopics.length];
  
  if (topic === "Syllogism") {
    const item1 = ["Pens", "Books", "Phones", "Bottles", "Tables"][i % 5];
    const item2 = ["Papers", "Notebooks", "Laptops", "Glasses", "Desks"][i % 5];
    const item3 = ["Erasers", "Pencils", "Chargers", "Covers", "Stools"][i % 5];
    
    return {
      q: `Statements:\n1. All ${item1} are ${item2}.\n2. No ${item2} is ${item3}.\n\nConclusions:\nI. No ${item1} is ${item3}.\nII. Some ${item2} are ${item1}.`,
      options: ["Only conclusion I follows", "Only conclusion II follows", "Both conclusions I and II follow", "Neither conclusion follows"],
      correct: 2,
      explanation: `All ${item1} lie inside ${item2}. Since no ${item2} touches ${item3}, the circle of ${item1} cannot touch ${item3} either, so I follows. Also, there is a clear overlap of ${item2} with ${item1}, so II follows. Both follow. \n\n*Real-Life Example*: If all smartphones (${item1}) are gadgets (${item2}), and no gadget is a vegetable (${item3}), then no smartphone is a vegetable, and some gadgets are smartphones.`
    };
  } else if (topic === "Coding-Decoding") {
    const word = ["BANK", "EXAM", "TEST", "PREP", "QUIZ"][i % 5];
    const shift = 1 + (i % 2); // 1 or 2
    let coded = "";
    for (let charIdx = 0; charIdx < word.length; charIdx++) {
      coded += String.fromCharCode(word.charCodeAt(charIdx) + shift);
    }
    const targetWord = ["ROSE", "LILY", "MINT", "SAGE", "FERN"][i % 5];
    let targetCoded = "";
    for (let charIdx = 0; charIdx < targetWord.length; charIdx++) {
      targetCoded += String.fromCharCode(targetWord.charCodeAt(charIdx) + shift);
    }
    
    return {
      q: `If the word '${word}' is coded as '${coded}' in a certain code language, how will the word '${targetWord}' be coded in the same language?`,
      options: [`${targetCoded}`, `${targetCoded.substring(1) + targetCoded[0]}`, `None of the options`, `${targetWord.toLowerCase()}`],
      correct: 0,
      explanation: `The coding logic shifts each letter forward by +${shift} positions in the alphabet. Shifting the letters of '${targetWord}' forward by +${shift} yields '${targetCoded}'. \n\n*Real-Life Example*: Basic military ciphers (like the Caesar cipher) shift letters by a set key (+${shift}) to transmit private orders that are unreadable without the decryption key.`
    };
  } else if (topic === "Blood Relation") {
    const relative = ["sister's son", "brother's daughter", "mother's brother", "father's sister"][i % 4];
    const relationName = ["nephew", "niece", "uncle", "aunt"][i % 4];
    const name = ["Ankita", "Bhavna", "Charu", "Deepak"][i % 4];
    
    return {
      q: `Pointing to a person, ${name} says: 'He/She is the only child of my ${relative}.' How is that person related to ${name}?`,
      options: [`Brother/Sister`, `${relationName}`, `Cousin`, `Father/Mother`],
      correct: 1,
      explanation: `My ${relative}'s only child corresponds directly to my ${relationName}. \n\n*Real-Life Example*: In a family directory, introducing a guest as the only child of your mother's brother simply means he is your cousin, or if he is your father's sister's child, your cousin.`
    };
  } else if (topic === "Direction Sense") {
    const dir1 = ["North", "East", "South", "West"][i % 4];
    const dist1 = 5 + (i % 4) * 5; // 5, 10, 15, 20
    const dist2 = 12;
    const ansDist = Math.sqrt(dist1*dist1 + dist2*dist2).toFixed(1);
    
    return {
      q: `A student walks ${dist1}m ${dir1} from the entrance, turns right and walks ${dist2}m. What is the shortest distance between the student's final position and the starting point?`,
      options: [`${(dist1 + dist2)}m`, `${(parseFloat(ansDist) + 3).toFixed(1)}m`, `${ansDist}m`, `${(dist1 - dist2 + 10)}m`],
      correct: 2,
      explanation: `The student's path forms a right-angled triangle. Hypotenuse = sqrt(${dist1}² + ${dist2}²) = sqrt(${dist1*dist1} + ${dist2*dist2}) = ${ansDist} meters. \n\n*Real-Life Example*: If a surveyor maps out a road turning right by 90 degrees, a straight line-of-sight laser rangefinder measures a direct return path of ${ansDist} meters.`
    };
  } else if (topic === "Ordering") {
    return {
      q: `Five students A, B, C, D, and E scored different marks in an exam. B scored more than C but less than E. D scored less than C. A scored the highest. Who scored the second highest?`,
      options: ["B", "C", "E", "D"],
      correct: 2,
      explanation: `Ranking: A is highest. B > C, and E > B. So A > E > B > C. D scored less than C, so A > E > B > C > D. The second highest score belongs to E. \n\n*Real-Life Example*: On a merit scholarship list, if student A gets Rank 1 and student E gets Rank 2, student E receives the second highest stipend.`
    };
  } else {
    return {
      q: `Six people P, Q, R, S, T, and U sit in a circle facing the center. P is opposite S. Q sits to the immediate left of P. T sits opposite Q. R is between S and T. Who sits opposite U?`,
      options: ["R", "S", "P", "T"],
      correct: 0,
      explanation: `Arranging the circle clockwise: P, Q, U, S, R, T. R sits directly opposite U. \n\n*Real-Life Example*: Around a circular boardroom table with six directors, chairs are arranged symmetrically so Director R faces Director U for face-to-face negotiations.`
    };
  }
}

export function generateEnglishQuestion(i, category = "Bank & Insurance") {
  if (category === "NEET / JEE") {
    // Biology conceptual questions
    const bioTopics = ["Cell Biology", "Genetics", "Human Physiology", "Ecology"];
    const bTopic = bioTopics[i % bioTopics.length];
    if (bTopic === "Cell Biology") {
      return {
        q: `Which of the following cellular organelles is responsible for synthesizing adenosine triphosphate (ATP), the energy currency of the cell?`,
        options: ["Lysosome", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correct: 2,
        explanation: `Mitochondria carry out aerobic respiration, producing ATP via the electron transport chain, which is why they are called the powerhouses of the cell. \n\n*Real-Life Example*: Much like a hydroelectric power plant generates electricity to power a city, mitochondria generate ATP to fuel all cellular activities.`
      };
    } else if (bTopic === "Genetics") {
      return {
        q: `A human cell undergoing normal meiosis will produce gametes containing how many chromosomes?`,
        options: ["46 chromosomes", "23 chromosomes", "92 chromosomes", "12 chromosomes"],
        correct: 1,
        explanation: `Meiosis is a reduction division that halves the chromosome number from diploid (2n=46) to haploid (n=23) in sperm and egg cells. \n\n*Real-Life Example*: When egg and sperm cells fuse during fertilization, their 23 chromosomes combine to restore the standard 46 chromosomes in the offspring.`
      };
    } else if (bTopic === "Human Physiology") {
      return {
        q: `Which hormone is secreted by the beta cells of the pancreas to regulate blood glucose levels?`,
        options: ["Glucagon", "Insulin", "Adrenaline", "Thyroxine"],
        correct: 1,
        explanation: `Insulin is produced by the pancreatic beta cells and lowers blood glucose by promoting its uptake into body cells and liver glycogen storage. \n\n*Real-Life Example*: After eating a sugary dessert, the pancreas releases insulin to keep blood sugar stable. A lack of insulin leads to diabetes.`
      };
    } else {
      return {
        q: `In an ecological pyramid, which trophic level represents primary consumers that feed directly on green plants?`,
        options: ["First Trophic Level", "Second Trophic Level", "Third Trophic Level", "Fourth Trophic Level"],
        correct: 1,
        explanation: `Green plants (producers) occupy the first trophic level. Herbivores (primary consumers) feed on them and occupy the second trophic level. \n\n*Real-Life Example*: In a forest ecosystem, caterpillars and deer feed directly on green leaves, acting as the second level of energy transfer.`
      };
    }
  }

  if (category === "UPSC / Civil") {
    // General Studies - History & Constitution questions
    const gsTopics = ["Indian History", "Indian Polity"];
    const gsTopic = gsTopics[i % gsTopics.length];
    if (gsTopic === "Indian History") {
      return {
        q: `The Battle of Plassey, which laid the foundation of British rule in India, was fought in which year?`,
        options: ["1757", "1764", "1857", "1885"],
        correct: 0,
        explanation: `The Battle of Plassey was fought on June 23, 1757, between the Nawab of Bengal, Siraj-ud-Daulah, and the British East India Company led by Robert Clive. \n\n*Real-Life Example*: Historical battle victories, like Plassey, allowed private trading firms to assume administrative and tax revenue collecting roles over vast territories.`
      };
    } else {
      return {
        q: `Which Article of the Indian Constitution guarantees the Right to Equality before the law?`,
        options: ["Article 19", "Article 21", "Article 14", "Article 32"],
        correct: 2,
        explanation: `Article 14 of the Constitution states that the State shall not deny to any person equality before the law or the equal protection of the laws within India. \n\n*Real-Life Example*: Article 14 ensures that a high-ranking politician and an ordinary citizen are subjected to the same traffic laws and judicial trials.`
      };
    }
  }

  // Standard English (Banking, SSC, Railways, State Exams)
  const englishTopics = ["Error Spotting", "Fill in the Blanks", "Synonyms & Antonyms", "Sentence Correction"];
  const topic = englishTopics[i % englishTopics.length];
  
  if (topic === "Error Spotting") {
    const items = [
      { s: "Neither the teacher nor the students was present in the class.", err: "was present", corr: "were present" },
      { s: "One of the most important factor for success is consistency.", err: "important factor", corr: "important factors" }
    ];
    const item = items[i % items.length];
    return {
      q: `Identify the grammatically incorrect segment in the following sentence:\n"${item.s}"`,
      options: [item.err, "No error", "was present in", "One of the"],
      correct: 0,
      explanation: `The segment "${item.err}" is incorrect and should be replaced with "${item.corr}". Subject-verb agreement rules require the verb to agree with the closer subject in neither/nor constructions. \n\n*Real-Life Example*: In editing business proposals or corporate emails, checking subject-verb agreements prevents grammatical slips that look unprofessional.`
    };
  } else if (topic === "Fill in the Blanks") {
    return {
      q: `Fill in the blank with the most appropriate option:\n"Due to heavy rains, the match was _______ until next week."`,
      options: ["put off", "put out", "put up", "put in"],
      correct: 0,
      explanation: `The phrasal verb 'put off' means to postpone or delay. In this context, the match was postponed. \n\n*Real-Life Example*: In project management, when critical components are delayed, the launch is 'put off' to allow schedules to align.`
    };
  } else if (topic === "Synonyms & Antonyms") {
    return {
      q: `What is the synonym of the word 'MITIGATE'?`,
      options: ["Aggravate", "Alleviate", "Prolong", "Increase"],
      correct: 1,
      explanation: `'Mitigate' means to make less severe, serious, or painful. 'Alleviate' is its direct synonym. \n\n*Real-Life Example*: When constructing coastal breakwaters, engineers seek to 'mitigate' (alleviate) the damage caused by heavy wave erosion during storms.`
    };
  } else {
    return {
      q: `Correct the underlined portion of the sentence: "Having worked all night, the report was completed."`,
      options: [
        "Having worked all night, he completed the report.",
        "Working all night, the report was completed.",
        "The report was completed after working all night.",
        "Having worked all night, completion of the report occurred."
      ],
      correct: 0,
      explanation: `The original sentence contains a dangling modifier. The subject of 'having worked' must be a person ('he'), not the 'report'. Option A resolves this. \n\n*Real-Life Example*: Writing clear instruction manuals requires assigning active verbs to real operators, ensuring readers know exactly who performs which action.`
    };
  }
}

export function generateGeneralAwarenessQuestion(i, category = "Bank & Insurance") {
  if (category === "NEET / JEE") {
    // General Science trivia questions
    const gsQ = [
      { q: "Which chemical element is present at the center of the chlorophyll molecule in plants?", opts: ["Iron", "Magnesium", "Copper", "Calcium"], corr: 1, exp: "Chlorophyll contains a magnesium ion coordinated inside a porphyrin ring." },
      { q: "What is the approximate speed of light in a vacuum?", opts: ["3 × 10⁸ m/s", "3 × 10⁵ m/s", "1.5 × 10⁸ m/s", "3 × 10⁶ m/s"], corr: 0, exp: "The speed of light in vacuum is approximately 299,792,458 m/s, or 3 × 10⁸ m/s." }
    ];
    const item = gsQ[i % gsQ.length];
    return {
      q: item.q,
      options: item.opts,
      correct: item.corr,
      explanation: `${item.exp} \n\n*Real-Life Example*: Magnesium gives leaves their green color. Without it, plants suffer from chlorosis, yellowing because they cannot make chlorophyll.`
    };
  }

  if (category === "UPSC / Civil") {
    // General Studies - Geography & Indian Economy
    const civilQ = [
      { q: "Which is the longest river that flows entirely within the territorial boundaries of India?", opts: ["Ganga", "Godavari", "Krishna", "Narmada"], corr: 1, exp: "The Godavari is the longest river flowing entirely within India, running for 1,465 km from Nashik to the Bay of Bengal." },
      { q: "What term describes a persistent and general increase in the price level of goods and services in an economy over time?", opts: ["Inflation", "Deflation", "Stagflation", "Recession"], corr: 0, exp: "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power." }
    ];
    const item = civilQ[i % civilQ.length];
    return {
      q: item.q,
      options: item.opts,
      correct: item.corr,
      explanation: `${item.exp} \n\n*Real-Life Example*: When inflation occurs, a basket of groceries that cost Rs. 1,000 last year might cost Rs. 1,070 this year, reducing the value of your cash savings.`
    };
  }

  if (category === "State Exams") {
    // Andhra Pradesh / Telangana State GK
    const stateQ = [
      { q: "Which sacred river flows directly through the city of Rajahmundry in Andhra Pradesh?", opts: ["Krishna River", "Godavari River", "Pennar River", "Tungabhadra River"], corr: 1, exp: "The holy Godavari River flows through Rajahmundry, where the famous Godavari Arch Bridge and Pushkar Ghats are located." },
      { q: "Who served as the first Chief Minister of Andhra Pradesh after its formation as a linguistic state in 1956?", opts: ["Tanguturi Prakasam", "Neelam Sanjiva Reddy", "Damodaram Sanjivayya", "Burgula Ramakrishna Rao"], corr: 1, exp: "Neelam Sanjiva Reddy was the first Chief Minister of Andhra Pradesh (1956-1960) and later became the 6th President of India." }
    ];
    const item = stateQ[i % stateQ.length];
    return {
      q: item.q,
      options: item.opts,
      correct: item.corr,
      explanation: `${item.exp} \n\n*Real-Life Example*: Rajahmundry hosts the massive Godavari Pushkaram festival every 12 years along the banks of the Godavari River, attracting millions of pilgrims.`
    };
  }

  // Standard General/Banking Awareness (Banking, SSC, Railways)
  const bankingQ = [
    { q: "What does the term 'Repo Rate' stand for in Reserve Bank of India monetary policy?", opts: ["Repurchase Rate", "Refinancing Rate", "Real-time Payment Rate", "Re-lending Rate"], corr: 0, exp: "Repo Rate is the Repurchase Rate at which the RBI lends money to commercial banks in exchange for government securities." },
    { q: "Which of the following is the regulatory body for insurance companies in India?", opts: ["SEBI", "IRDAI", "RBI", "NABARD"], corr: 1, exp: "The Insurance Regulatory and Development Authority of India (IRDAI) regulates and licenses the insurance sector in India." }
  ];
  const item = bankingQ[i % bankingQ.length];
  return {
    q: item.q,
    options: item.opts,
    correct: item.corr,
    explanation: `${item.exp} \n\n*Real-Life Example*: When the RBI increases the Repo Rate, commercial banks borrow at higher costs. They pass this cost to consumers, increasing home and car loan EMI interest rates.`
  };
}

export function generateQuestionsPool(category = "Bank & Insurance") {
  const pool = [];
  for (let i = 0; i < 400; i++) {
    if (i < 100) {
      pool.push(generateQuantQuestion(i, category));
    } else if (i < 200) {
      pool.push(generateReasoningQuestion(i, category));
    } else if (i < 250) {
      pool.push(generateEnglishQuestion(i, category));
    } else if (i < 300) {
      pool.push(generateGeneralAwarenessQuestion(i, category));
    } else if (i < 330) {
      pool.push(generateGeneralAwarenessQuestion(i, category));
    } else if (i < 360) {
      pool.push(generateQuantQuestion(i, category));
    } else if (i < 380) {
      pool.push(generateReasoningQuestion(i, category));
    } else {
      pool.push(generateEnglishQuestion(i, category));
    }
  }
  return pool;
}

export function getSyllabusForCategory(category) {
  switch (category) {
    case "NEET / JEE":
      return [
        {
          subject: "Physics",
          concepts: [
            { name: "Kinematics", weightage: "6 Marks", difficulty: "Medium" },
            { name: "Force and Motion", weightage: "8 Marks", difficulty: "Medium" },
            { name: "Work and Energy", weightage: "6 Marks", difficulty: "Easy" },
            { name: "Electrostatics", weightage: "10 Marks", difficulty: "Hard" }
          ]
        },
        {
          subject: "Chemistry",
          concepts: [
            { name: "Organic Chemistry", weightage: "12 Marks", difficulty: "Hard" },
            { name: "Atomic Structure", weightage: "8 Marks", difficulty: "Medium" },
            { name: "Periodic Table", weightage: "6 Marks", difficulty: "Easy" },
            { name: "Chemical Bonding", weightage: "10 Marks", difficulty: "Hard" }
          ]
        },
        {
          subject: "Biology / Mathematics",
          concepts: [
            { name: "Cell Biology", weightage: "15 Marks", difficulty: "Medium" },
            { name: "Genetics", weightage: "15 Marks", difficulty: "Hard" },
            { name: "Human Physiology", weightage: "12 Marks", difficulty: "Medium" },
            { name: "Ecology", weightage: "10 Marks", difficulty: "Easy" }
          ]
        }
      ];
    case "UPSC / Civil":
      return [
        {
          subject: "General Studies I",
          concepts: [
            { name: "Indian History", weightage: "15 Marks", difficulty: "Hard" },
            { name: "Indian Polity", weightage: "20 Marks", difficulty: "Medium" }
          ]
        },
        {
          subject: "General Studies II",
          concepts: [
            { name: "Quantitative Aptitude", weightage: "30 Marks", difficulty: "Medium" },
            { name: "Logical Reasoning", weightage: "25 Marks", difficulty: "Easy" },
            { name: "Reading Comprehension", weightage: "25 Marks", difficulty: "Medium" }
          ]
        }
      ];
    case "State Exams":
      return [
        {
          subject: "General Studies",
          concepts: [
            { name: "Andhra Pradesh / Telangana State GK", weightage: "15 Marks", difficulty: "Easy" }
          ]
        },
        {
          subject: "Aptitude & English",
          concepts: [
            { name: "Quantitative Aptitude", weightage: "30 Marks", difficulty: "Medium" },
            { name: "General English", weightage: "20 Marks", difficulty: "Easy" }
          ]
        }
      ];
    default: // Bank & Insurance, SSC, Railways
      return STANDARD_SYLLABUS;
  }
}

export function generateMockQuestionsForCategory(category, pool, mockIndex, courseTitle = "Exam") {
  const qStart = ((mockIndex - 1) * 7) % 300;
  
  let sections = [];
  if (category === "NEET / JEE") {
    // 75 questions: 25 Physics, 25 Chemistry, 25 Biology/Maths
    sections = [
      { name: "Physics", count: 25, start: qStart },
      { name: "Chemistry", count: 25, start: 100 + qStart },
      { name: "Biology / Mathematics", count: 25, start: 200 + qStart }
    ];
  } else if (category === "UPSC / Civil") {
    // 100 questions: 50 General Studies I, 50 General Studies II
    sections = [
      { name: "General Studies I", count: 50, start: qStart },
      { name: "General Studies II", count: 50, start: 150 + qStart }
    ];
  } else if (category === "State Exams") {
    // 100 questions: 40 General Studies, 30 Aptitude, 30 English
    sections = [
      { name: "General Studies", count: 40, start: qStart },
      { name: "Quantitative Aptitude", count: 30, start: 100 + qStart },
      { name: "General English", count: 30, start: 200 + qStart }
    ];
  } else if (category === "RRB & Railways" || category === "Railways") {
    // 100 questions: 30 Quant, 30 Reasoning, 40 General Awareness
    sections = [
      { name: "Quantitative Aptitude", count: 30, start: qStart },
      { name: "Reasoning Ability", count: 30, start: 100 + qStart },
      { name: "General Awareness", count: 40, start: 200 + qStart }
    ];
  } else if (category === "SSC Exams" || category === "SSC") {
    // 100 questions: 25 Quant, 25 Reasoning, 25 English, 25 General Awareness
    sections = [
      { name: "Quantitative Aptitude", count: 25, start: qStart },
      { name: "Reasoning Ability", count: 25, start: 100 + qStart },
      { name: "English Language", count: 25, start: 200 + qStart },
      { name: "General Awareness", count: 25, start: 250 + qStart }
    ];
  } else { // Bank & Insurance or Banking (Default)
    // 100 questions: 35 Quant, 35 Reasoning, 30 English
    sections = [
      { name: "Quantitative Aptitude", count: 35, start: qStart },
      { name: "Reasoning Ability", count: 35, start: 100 + qStart },
      { name: "English Language", count: 30, start: 200 + qStart }
    ];
  }

  const questions = [];
  sections.forEach(sec => {
    for (let i = 0; i < sec.count; i++) {
      const poolIndex = (sec.start + i) % pool.length;
      const q = pool[poolIndex];
      questions.push({
        ...q,
        section: sec.name,
        q: q.q.replace("[Exam]", courseTitle)
      });
    }
  });

  return questions;
}

export function generatePracticeModulesForCourse(course) {
  const syllabus = getSyllabusForCategory(course.category);
  const modules = [];
  const pool = generateQuestionsPool(course.category);
  
  // We generate exactly 50 practice modules per course, each containing at least 30 questions
  for (let i = 1; i <= 50; i++) {
    let subject = "";
    let conceptName = "";
    let qStart = 0;
    let stage = "";
    
    if (course.category === "NEET / JEE") {
      if (i <= 15) {
        subject = "Physics";
        conceptName = ["Kinematics", "Force and Motion", "Work and Energy", "Electrostatics"][(i - 1) % 4];
        qStart = ((i - 1) * 15) % 100;
        stage = "Stage - I";
      } else if (i <= 30) {
        subject = "Chemistry";
        conceptName = ["Organic Chemistry", "Atomic Structure", "Periodic Table", "Chemical Bonding"][(i - 16) % 4];
        qStart = 100 + (((i - 16) * 15) % 100);
        stage = "Stage - I";
      } else {
        subject = "Biology / Mathematics";
        conceptName = ["Cell Biology", "Genetics", "Human Physiology", "Ecology"][(i - 31) % 4];
        qStart = 200 + (((i - 31) * 15) % 100);
        stage = "Stage - II";
      }
    } else if (course.category === "UPSC / Civil") {
      if (i <= 15) {
        subject = "General Studies I";
        conceptName = ["Indian History", "Indian Polity"][(i - 1) % 2];
        qStart = ((i - 1) * 15) % 150;
        stage = "Prelims";
      } else if (i <= 30) {
        subject = "General Studies II";
        conceptName = ["Quantitative Aptitude", "Logical Reasoning"][(i - 16) % 2];
        qStart = 150 + (((i - 16) * 15) % 150);
        stage = "Prelims";
      } else {
        subject = "General Studies II";
        conceptName = "Reading Comprehension";
        qStart = 300 + (((i - 31) * 15) % 100);
        stage = "Mains";
      }
    } else if (course.category === "State Exams") {
      if (i <= 15) {
        subject = "General Studies";
        conceptName = "Andhra Pradesh / Telangana State GK";
        qStart = ((i - 1) * 15) % 150;
        stage = "Stage - I";
      } else if (i <= 30) {
        subject = "Aptitude & English";
        conceptName = "Quantitative Aptitude";
        qStart = 150 + (((i - 16) * 15) % 150);
        stage = "Stage - I";
      } else {
        subject = "Aptitude & English";
        conceptName = "General English";
        qStart = 300 + (((i - 31) * 15) % 100);
        stage = "Stage - II";
      }
    } else { // Bank & Insurance, SSC, Railways
      const isBank = course.category === "Bank & Insurance";
      const isSSC = course.category === "SSC Exams";
      
      if (i <= 15) {
        const isPrelims = i <= 8;
        if (isBank) {
          subject = isPrelims ? "Quant Prelims" : "Quant Mains";
          stage = isPrelims ? "Prelims" : "Mains";
        } else if (isSSC) {
          subject = isPrelims ? "Quant Tier - I" : "Quant Tier - II";
          stage = isPrelims ? "Tier - I" : "Tier - II";
        } else {
          subject = isPrelims ? "Quant CBT - 1" : "Quant CBT - 2";
          stage = isPrelims ? "CBT - 1" : "CBT - 2";
        }
        conceptName = ["Simplification & Approximation", "Data Interpretation (DI)", "Number Series (Missing & Wrong)", "Arithmetic Word Problems"][(i - 1) % 4];
        qStart = ((i - 1) * 15) % 100;
      } else if (i <= 30) {
        const isPrelims = (i - 15) <= 8;
        if (isBank) {
          subject = isPrelims ? "Reasoning Prelims" : "Reasoning Mains";
          stage = isPrelims ? "Prelims" : "Mains";
        } else if (isSSC) {
          subject = isPrelims ? "Reasoning Tier - I" : "Reasoning Tier - II";
          stage = isPrelims ? "Tier - I" : "Tier - II";
        } else {
          subject = isPrelims ? "Reasoning CBT - 1" : "Reasoning CBT - 2";
          stage = isPrelims ? "CBT - 1" : "CBT - 2";
        }
        conceptName = ["Puzzles & Seating Arrangement", "Syllogism & Logical Reasoning", "Coding-Decoding"][(i - 16) % 3];
        qStart = 100 + (((i - 16) * 15) % 100);
      } else {
        const isPrelims = (i - 30) <= 10;
        if (isBank) {
          subject = isPrelims ? "English Prelims" : "English Mains";
          stage = isPrelims ? "Prelims" : "Mains";
        } else if (isSSC) {
          subject = isPrelims ? "English Tier - I" : "English Tier - II";
          stage = isPrelims ? "Tier - I" : "Tier - II";
        } else {
          subject = isPrelims ? "General English CBT - 1" : "General English CBT - 2";
          stage = isPrelims ? "CBT - 1" : "CBT - 2";
        }
        conceptName = "English Language Practice";
        qStart = 200 + (((i - 31) * 15) % 100);
      }
    }
    
    // Slice exactly 30 questions for this module
    const moduleQuestions = [];
    for (let qIdx = 0; qIdx < 30; qIdx++) {
      const pIdx = (qStart + qIdx) % pool.length;
      moduleQuestions.push({
        ...pool[pIdx],
        q: pool[pIdx].q.replace("[Exam]", course.title)
      });
    }
    
    let subSetNum = i <= 15 ? i : (i <= 30 ? i - 15 : i - 30);
    let displaySetNum = subSetNum;
    if (course.category === "Bank & Insurance" || course.category === "SSC Exams" || course.category === "RRB & Railways") {
      if (i <= 15) {
        displaySetNum = i <= 8 ? i : i - 8;
      } else if (i <= 30) {
        displaySetNum = (i - 15) <= 8 ? (i - 15) : (i - 15) - 8;
      } else {
        displaySetNum = (i - 30) <= 10 ? (i - 30) : (i - 30) - 10;
      }
    }
    
    modules.push({
      id: `prac_${course.id}_${i}`,
      title: `${conceptName} Set ${displaySetNum}`,
      subject: subject,
      stage: stage,
      questions: moduleQuestions
    });
  }
  
  return modules;
}

const questionPool = generateQuestionsPool();
export const KR_ACHIEVERS_MOCKS_QUESTIONS = questionPool.slice(0, 300);
export const KR_ACHIEVERS_PRACTICE_QUESTIONS = questionPool.slice(300, 400);

export const STANDARD_PRACTICE = [
  {
    id: "kr_practice_1",
    title: "KR Achievers General Awareness Quiz 1",
    subject: "General Awareness",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(0, 10)
  },
  {
    id: "kr_practice_2",
    title: "KR Achievers Quantitative Aptitude Quiz 1",
    subject: "Quantitative Aptitude",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(30, 40)
  },
  {
    id: "kr_practice_3",
    title: "KR Achievers Reasoning Ability Quiz 1",
    subject: "Reasoning Ability",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(60, 70)
  },
  {
    id: "kr_practice_4",
    title: "KR Achievers English Language Quiz 1",
    subject: "English Language",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(80, 90)
  },
  {
    id: "kr_practice_5",
    title: "KR Achievers General Awareness Quiz 2",
    subject: "General Awareness",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(10, 20)
  },
  {
    id: "kr_practice_6",
    title: "KR Achievers Quantitative Aptitude Quiz 2",
    subject: "Quantitative Aptitude",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(40, 50)
  },
  {
    id: "kr_practice_7",
    title: "KR Achievers Reasoning Ability Quiz 2",
    subject: "Reasoning Ability",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(70, 80)
  },
  {
    id: "kr_practice_8",
    title: "KR Achievers English Language Quiz 2",
    subject: "English Language",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(90, 100)
  },
  {
    id: "kr_practice_9",
    title: "KR Achievers General Awareness Quiz 3",
    subject: "General Awareness",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(20, 30)
  },
  {
    id: "kr_practice_10",
    title: "KR Achievers Aptitude & Reasoning Speed Drill",
    subject: "Quantitative Aptitude",
    questions: KR_ACHIEVERS_PRACTICE_QUESTIONS.slice(50, 60)
  }
];

export const TOPIC_DATABASE = {
  "Simplification & Approximation": {
    aiExplanation: "Simplification is about finding the exact value using BODMAS rules. Approximation is about rounding off numbers to the nearest integers to solve quickly (e.g., 49.99% becomes 50%, 15.02 becomes 15). Always solve brackets first, then exponents/orders, division, multiplication, addition, and subtraction.",
    questions: [
      {
        q: "What is the approximate value of 39.99% of 450 + 29.98% of 300?",
        options: ["250", "270", "290", "310"],
        correct: 1,
        explanation: "Round off percentages: 40% of 450 = 180. 30% of 300 = 90. Sum = 180 + 90 = 270. \n\n*Real-Life Example*: If you are calculating a bill split where you pay 40% of Rs. 450 and your partner pays 30% of Rs. 300, the total combined expense is approximately Rs. 270."
      },
      {
        q: "Calculate the exact value using BODMAS: 125 / 5 + 4 × 12 - 8?",
        options: ["55", "65", "75", "85"],
        correct: 1,
        explanation: "Division first: 125 / 5 = 25. Multiplication next: 4 × 12 = 48. Equation becomes: 25 + 48 - 8 = 65. \n\n*Real-Life Example*: When allocating funds, dividing Rs. 125 among 5 files, adding 4 payouts of Rs. 12, and deducting Rs. 8 in fees results in a net Rs. 65 balance."
      },
      {
        q: "What is the approximate value of: (14.99)² - 5.05 × 19.98?",
        options: ["110", "125", "145", "160"],
        correct: 1,
        explanation: "Round off to nearest integers: 15² - 5 × 20 = 225 - 100 = 125. \n\n*Real-Life Example*: If you buy a square tile of side 15 feet (approx 14.99) and deduct 5 tables of 20 square feet each, the remaining room space is approximately 125 sq ft."
      },
      {
        q: "Calculate using BODMAS: 72 / (8 × 3) + 15 - 4?",
        options: ["12", "14", "16", "18"],
        correct: 1,
        explanation: "Solve bracket first: 72 / 24 + 15 - 4 = 3 + 15 - 4 = 14. \n\n*Real-Life Example*: If 72 boxes are divided into 8 crates of 3 boxes each, and you add 15 boxes and discard 4, the remaining count is exactly 14 boxes."
      },
      {
        q: "What is the approximate value of sqrt(144.01) × 3.99 - 5.98?",
        options: ["36", "42", "48", "54"],
        correct: 1,
        explanation: "Approximate terms: sqrt(144) × 4 - 6 = 12 × 4 - 6 = 48 - 6 = 42. \n\n*Real-Life Example*: If a square room of area 144 sq ft has a length of 12 ft, and you buy 4 identical rods of that length and cut off 6 ft in total, the remaining rod length is 42 ft."
      }
    ],
    leaderboard: [
      { name: "Rohan Sharma", score: 100, time: "1m 15s" },
      { name: "Divya Reddy", score: 100, time: "1m 32s" },
      { name: "Vikram Singh", score: 80, time: "1m 45s" }
    ]
  },
  "Data Interpretation (DI)": {
    aiExplanation: "DI requires analysing tables, bar graphs, pie charts, or line graphs to calculate ratios, percentages, and averages. Focus on scanning data quickly, writing calculations in structured formats, and using approximations for division queries.",
    questions: [
      {
        q: "In a pie chart representing student enrollment, if Section A represents 36 degrees of a total of 5000 students, how many students are in Section A?",
        options: ["360", "450", "500", "600"],
        correct: 2,
        explanation: "A circle is 360 degrees. 36 degrees is 36/360 = 10% of the circle. 10% of 5000 students = 500 students. \n\n*Real-Life Example*: If a city budget allocates 36 degrees of its circular budget pie chart to public health, it means exactly 10% of the total budget is dedicated to health."
      },
      {
        q: "The sales of a company increased from 40 lakhs in 2024 to 50 lakhs in 2025. Find the percentage growth.",
        options: ["10%", "20%", "25%", "30%"],
        correct: 2,
        explanation: "Growth = 50 - 40 = 10 lakhs. Percentage growth = (Growth / Initial Sales) * 100 = (10 / 40) * 100 = 25%. \n\n*Real-Life Example*: If a local bakery expands its sales from 40 loaves a day to 50 loaves, its daily sales volume grows by exactly 25%."
      },
      {
        q: "If total sales in 2024 is 120 crores, and the ratio of sales of product X to Y is 5:3, what are the sales of product X?",
        options: ["45 crores", "60 crores", "75 crores", "90 crores"],
        correct: 2,
        explanation: "Sales of product X = 120 * (5 / (5 + 3)) = 120 * 5/8 = 75 crores. \n\n*Real-Life Example*: If a family splits Rs. 120,000 between savings and expenses in a 5:3 ratio, the savings account receives Rs. 75,000."
      },
      {
        q: "In a bar graph, company A's production is 150 units, and B's production is 250 units. By what percentage is B's production more than A's?",
        options: ["33.33%", "50%", "66.67%", "75%"],
        correct: 2,
        explanation: "Percentage difference = ((250 - 150) / 150) * 100 = (100 / 150) * 100 = 66.67%. \n\n*Real-Life Example*: If a store has 150 customers on Monday and 250 on Tuesday, the customer traffic on Tuesday is 66.67% higher."
      },
      {
        q: "The average enrollment of 5 classes is 45. If a new class with 51 students joins, what is the new average enrollment across all 6 classes?",
        options: ["45.5", "46", "46.5", "47"],
        correct: 1,
        explanation: "Sum of enrollments = 45 * 5 = 225. New sum = 225 + 51 = 276. New average = 276 / 6 = 46. \n\n*Real-Life Example*: If a company operates 5 departments with an average of 45 workers each, and imports a department of 51 workers, the average workers per department becomes 46."
      }
    ],
    leaderboard: [
      { name: "Srikanth Verma", score: 100, time: "2m 10s" },
      { name: "Nisha Gupta", score: 100, time: "2m 40s" },
      { name: "Anjali Priya", score: 80, time: "2m 55s" }
    ]
  },
  "Number Series (Missing & Wrong)": {
    aiExplanation: "Look for patterns like common difference (arithmetic), geometric progression, square/cube patterns, prime number additions, or alternative series. In double-difference series, the difference of difference forms a constant pattern.",
    questions: [
      {
        q: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
        options: ["36", "40", "42", "48"],
        correct: 2,
        explanation: "The difference pattern is: +4, +6, +8, +10, +12. The next term is 30 + 12 = 42. \n\n*Real-Life Example*: When constructing steps on a staircase, if the height increases progressively by 4cm, 6cm, 8cm, 10cm, etc., the next step height will be 42cm."
      },
      {
        q: "Find the wrong number in the series: 3, 5, 9, 17, 30, 65?",
        options: ["9", "17", "30", "65"],
        correct: 2,
        explanation: "The pattern is (Previous Term * 2) - 1. 3*2-1 = 5; 5*2-1 = 9; 9*2-1 = 17; 17*2-1 = 33 (not 30); 33*2-1 = 65. Thus, 30 is the wrong term. \n\n*Real-Life Example*: In bacterial growth with a slight decay rate, if cell population roughly doubles minus 1 each hour, finding a count of 30 instead of 33 indicates a measurement error."
      },
      {
        q: "Find the missing number in the series: 7, 11, 19, 31, 47, ?",
        options: ["59", "63", "67", "71"],
        correct: 2,
        explanation: "Difference pattern is: +4, +8, +12, +16. Next difference is +20. Term is 47 + 20 = 67. \n\n*Real-Life Example*: A company expanding its warehouse capacity by adding 4, 8, 12, and 16 racks in successive years will add 20 racks in the fifth year, reaching a total of 67 racks."
      },
      {
        q: "Find the missing number in the series: 1, 8, 27, 64, 125, ?",
        options: ["196", "216", "225", "343"],
        correct: 1,
        explanation: "Perfect cubes series: 1^3, 2^3, 3^3, 4^3, 5^3, 6^3 = 216. \n\n*Real-Life Example*: A child building larger cubes with small 1x1 blocks will need 1, 8, 27, 64, 125, and finally 216 blocks to construct the next perfect cube."
      },
      {
        q: "Identify the wrong number in the series: 2, 3, 6, 18, 108, 1940?",
        options: ["6", "18", "108", "1940"],
        correct: 3,
        explanation: "Each term is the product of the previous two terms. 2*3=6, 3*6=18, 6*18=108, 18*108=1944. Thus, 1940 is the wrong number (should be 1944). \n\n*Real-Life Example*: In computing network node links where each stage multiplies incoming lines, a config mapping error that leads to 1940 channels instead of 1944 will cause communication dropping."
      }
    ],
    leaderboard: [
      { name: "Pranav Teja", score: 100, time: "45s" },
      { name: "Madhav Nair", score: 100, time: "58s" },
      { name: "Pooja Hegde", score: 80, time: "1m 12s" }
    ]
  },
  "Arithmetic Word Problems": {
    aiExplanation: "Covers percentages, profit & loss, simple & compound interest, time & work, speed/distance, and partnerships. Always translate word logic into algebraic equations step-by-step.",
    questions: [
      {
        q: "A can do work in 10 days, and B can do the same work in 15 days. In how many days can they complete it together?",
        options: ["5 days", "6 days", "8 days", "9 days"],
        correct: 1,
        explanation: "Total work = LCM of 10 and 15 = 30 units. A's efficiency = 3 units/day, B's efficiency = 2 units/day. Together they do 5 units/day. Days needed = 30 / 5 = 6 days. \n\n*Real-Life Example*: If two painters paint a fence, painter A taking 10 days and painter B taking 15 days, working together they finish the painting in 6 days."
      },
      {
        q: "An article is sold at 20% profit. If the cost price was 500, find its selling price.",
        options: ["550", "600", "650", "700"],
        correct: 1,
        explanation: "Selling Price = Cost Price * (100 + Profit%) / 100 = 500 * 1.2 = 600. \n\n*Real-Life Example*: A store owner buys a handbag for Rs. 500. To make a 20% profit, she prices it at Rs. 600."
      },
      {
        q: "A sum of money doubles itself in 5 years at simple interest. In how many years will it become 4 times itself?",
        options: ["10 years", "12 years", "15 years", "20 years"],
        correct: 2,
        explanation: "Interest earned = 2P - P = P in 5 years. For it to become 4 times, interest must be 4P - P = 3P. Years required = 3 * 5 = 15 years. \n\n*Real-Life Example*: If you deposit Rs. 10,000 and it yields Rs. 10,000 simple interest in 5 years, it will take 15 years to earn Rs. 30,000 in interest to quadruple your total value to Rs. 40,000."
      },
      {
        q: "A train running at 54 km/h crosses a stationary pole in 20 seconds. Find the length of the train.",
        options: ["200m", "250m", "300m", "350m"],
        correct: 2,
        explanation: "Speed in m/s = 54 * (5 / 18) = 15 m/s. Train length = Speed * Time = 15 m/s * 20s = 300m. \n\n*Real-Life Example*: If a bullet train crosses a signal post on a platform in exactly 20 seconds at a speed of 54 km/h, the physical length of the train is 300 meters."
      },
      {
        q: "A invests Rs. 4000 for 6 months and B invests Rs. 6000 for 8 months in a business. Find A's share in a total profit of Rs. 3600.",
        options: ["Rs. 1000", "Rs. 1200", "Rs. 1400", "Rs. 1600"],
        correct: 1,
        explanation: "Profit sharing ratio = (4000 * 6) : (6000 * 8) = 24000 : 48000 = 1:2. A's share = 3600 * 1/3 = Rs. 1200. \n\n*Real-Life Example*: In a startup partnership, dividing profits based on investment-months ensures fair compensation; A gets Rs. 1200 and B gets Rs. 2400 from a Rs. 3600 pool."
      }
    ],
    leaderboard: [
      { name: "Kiran Kumar", score: 100, time: "1m 20s" },
      { name: "Swapna Rao", score: 80, time: "1m 35s" },
      { name: "Ramesh G.", score: 80, time: "1m 50s" }
    ]
  },
  "Puzzles & Seating Arrangement": {
    aiExplanation: "Seating arrangements can be circular, linear, or square (facing center or outside). Floor puzzles, box puzzles, and scheduling puzzles are common. Write down all definite clues first, list negative cases on the side, and draw parallel diagrams for possibilities.",
    questions: [
      {
        q: "A, B, C, D, E sit in a row facing North. C sits in the exact middle. B sits to the immediate right of C. A sits at one of the extreme ends. Who sits to the left of C?",
        options: ["A", "B", "D", "Cannot be determined"],
        correct: 3,
        explanation: "The possible layouts are [A, D, C, B, E] or [E, D, C, B, A]. Thus, we cannot definitively say whether A or E is at the left end. The left of C could be D or A/E. \n\n*Real-Life Example*: When assigning seats for a panel discussion with 5 chairs, if we only fix the middle guest and their neighbor, multiple seating configurations are possible."
      },
      {
        q: "In a circle of 4 people facing the center: A sits opposite B, C sits to the immediate left of A. Who sits to the immediate right of A?",
        options: ["B", "C", "D", "None of these"],
        correct: 2,
        explanation: "Since A faces center and C sits to A's left, the person on A's right must be D (since B is opposite A). \n\n*Real-Life Example*: Around a square dining table with 4 chairs, if you sit facing your partner and your friend sits on your left, the only remaining guest must sit on your right."
      },
      {
        q: "Five boxes J, K, L, M, N are stacked vertically. K is immediately above L. M is below L. J is at the top. N is between J and K. Which box is in the middle of the stack?",
        options: ["J", "K", "L", "N"],
        correct: 1,
        explanation: "Ordering from top to bottom is J, N, K, L, M. Box K is exactly in the middle. \n\n*Real-Life Example*: When organizing cargo containers in a shipyard column, container K is the third container from the bottom in a stack of five."
      },
      {
        q: "In a linear row of 6 people facing North, P sits third from the left end. Q is to the immediate right of P. R sits at the extreme right end. How many people sit between Q and R?",
        options: ["1", "2", "3", "4"],
        correct: 0,
        explanation: "Positions are: 1, 2, P(3), Q(4), 5, R(6). There is exactly 1 person (in position 5) sitting between Q and R. \n\n*Real-Life Example*: In an airplane row of 6 seats, if passenger P is in seat 3, passenger Q is in seat 4, and passenger R is in seat 6, seat 5 is the empty seat between Q and R."
      },
      {
        q: "A, B, C, D sit around a circular table facing the center. A sits immediate left of B. B sits opposite C. D is to the immediate right of C. Who is opposite D?",
        options: ["A", "B", "C", "D"],
        correct: 0,
        explanation: "Circular order clockwise is A, B, D, C. A sits opposite D. \n\n*Real-Life Example*: During a card game with 4 players, if player A sits opposite D, they can directly see each other's expressions to spot a bluff."
      }
    ],
    leaderboard: [
      { name: "Harika Ch", score: 100, time: "2m 05s" },
      { name: "Srinivas Rao", score: 100, time: "2m 20s" },
      { name: "Kavitha M.", score: 80, time: "2m 45s" }
    ]
  },
  "Syllogism & Logical Reasoning": {
    aiExplanation: "Syllogisms use qualifiers like 'All', 'Some', 'No', and 'Some not'. Draw Venn diagrams to map standard overlaps. Check for complimentary pairs (Either-Or cases) when both conclusions are individually false but have the same subject-predicate.",
    questions: [
      {
        q: "Statements: All Keys are Rings. No Ring is Chain.\nConclusions: I. No Key is Chain. II. Some Rings are Keys.",
        options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"],
        correct: 2,
        explanation: "Since all keys are rings and no ring is a chain, keys cannot touch chains, so I follows. Rings overlap with keys, so II follows. Both follow. \n\n*Real-Life Example*: If all iPhones (Keys) are smartphones (Rings), and no smartphone (Ring) is a dial-up phone (Chain), then no iPhone (Key) is a dial-up phone (Chain)."
      },
      {
        q: "Statements: Some Pens are Paper. Some Paper are books.\nConclusions: I. Some Pens are books. II. No Pen is book.",
        options: ["Only I follows", "Only II follows", "Either I or II follows", "Neither follows"],
        correct: 2,
        explanation: "Since there is no direct link between Pens and books, both individual conclusions are unverified. However, since they cover the positive and negative extremes of the same entities, either one or the other must follow. \n\n*Real-Life Example*: In a drawer, if some blue items (Pens) are made of plastic (Paper), and some plastic items (Paper) are rulers (books), then a blue item either is a ruler or is not a ruler."
      },
      {
        q: "Statements: All Teachers are Scholars. Some Scholars are Writers.\nConclusions: I. Some Teachers are Writers. II. All Scholars are Teachers.",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        correct: 3,
        explanation: "No direct link exists between Teachers and Writers, so I doesn't follow. Scholars to Teachers is a partial overlap, so II doesn't follow. \n\n*Real-Life Example*: If all university professors (Teachers) are academics (Scholars), and some academics (Scholars) publish poetry (Writers), it does not mean professors write poetry, nor are all academics professors."
      },
      {
        q: "Statements: No Cat is Dog. All Dogs are Animals.\nConclusions: I. Some Animals are not Cats. II. No Animal is Cat.",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        correct: 0,
        explanation: "Dogs are animals and no dog is a cat, meaning the animal part which are dogs cannot be cats (I follows). But other animals could be cats, so II doesn't follow. \n\n*Real-Life Example*: If no golden retriever (Dog) is a Siamese (Cat), and all golden retrievers are canines (Animals), then some canines are not Siamese cats."
      },
      {
        q: "Statements: All Mangoes are Fruits. All Fruits are Sweet.\nConclusions: I. All Mangoes are Sweet. II. Some Sweet items are Fruits.",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        correct: 2,
        explanation: "All mangoes are fruits, and all fruits are sweet, so all mangoes are sweet (I follows). Fruits are part of sweet items, so II follows. Both follow. \n\n*Real-Life Example*: If all honeybees (Mangoes) are insects (Fruits), and all insects (Fruits) are multi-legged (Sweet), then all honeybees are multi-legged, and some multi-legged creatures are insects."
      }
    ],
    leaderboard: [
      { name: "Satish Naidu", score: 100, time: "50s" },
      { name: "Swetha P.", score: 100, time: "1m 02s" },
      { name: "Vijay Prasad", score: 80, time: "1m 15s" }
    ]
  },
  "Coding-Decoding": {
    aiExplanation: "Letters can be coded by shifts (e.g. A->B (+1)), reverse positions (A->Z, B->Y), matrix position values, or group substitution (Chinese coding). Always note down letter positional values (A=1, Z=26) to quickly decode.",
    questions: [
      {
        q: "If 'CAT' is coded as 'ECV' (+2 shift), how is 'DOG' coded?",
        options: ["FPH", "FQI", "EQJ", "GQI"],
        correct: 1,
        explanation: "Adding 2 positions to D, O, G gives: D(+2)=F, O(+2)=Q, G(+2)=I. Code is FQI. \n\n*Real-Life Example*: In web encryption protocols, shifting characters by a fixed value is a basic cipher used to obfuscate passwords during transit."
      },
      {
        q: "If 'A' is coded as 1 and 'CAB' is coded as 6, what is the code for 'BED'?",
        options: ["10", "11", "12", "13"],
        correct: 1,
        explanation: "Letter sum code: B=2, E=5, D=4. Sum = 2 + 5 + 4 = 11. \n\n*Real-Life Example*: A warehouse storage code that sums alphabetical letter values allows quick inventory checksum calculations."
      },
      {
        q: "If 'PEOPLE' is coded as 'ELPOEP' (reversal), how is the word 'TRAIN' coded?",
        options: ["NIART", "NART", "NITAR", "NTIAR"],
        correct: 0,
        explanation: "Reverse order of letters in TRAIN gives NIART. \n\n*Real-Life Example*: Mirror writing or text reversal is used in printing layouts and ambulance decals so drivers read them correctly in rearview mirrors."
      },
      {
        q: "If 'BLUE' is coded as '2-12-21-5' (letter indexes), how is 'RED' coded?",
        options: ["18-5-4", "18-4-5", "17-5-4", "18-6-4"],
        correct: 0,
        explanation: "R=18, E=5, D=4. Code is 18-5-4. \n\n*Real-Life Example*: Numerical mapping of alphabets is the first step in digital data transmissions where letters are converted to byte values."
      },
      {
        q: "If 'MOON' is coded as '5665' and 'SUN' is coded as '235', what is the code for 'N'?",
        options: ["2", "3", "5", "6"],
        correct: 2,
        explanation: "'N' is the common letter in both words. The common digit in their codes is '5'. \n\n*Real-Life Example*: Frequency analysis in cryptography identifies secret symbols by matching repeating letters in intercepted messages."
      }
    ],
    leaderboard: [
      { name: "Ravi Kiran", score: 100, time: "38s" },
      { name: "Deepika K", score: 100, time: "45s" },
      { name: "Naresh Kumar", score: 80, time: "55s" }
    ]
  },
  "Reading Comprehension": {
    aiExplanation: "Read the passage to understand the central theme, tone (informative, sarcastic, critical), and main supporting points. For vocabulary questions (synonyms/antonyms), refer back to the sentence to comprehend the contextual usage.",
    questions: [
      {
        q: "What is the primary key to identifying the tone of a reading comprehension passage?",
        options: ["Reading speed", "Word choices and adjectives used", "Number of paragraphs", "Length of sentences"],
        correct: 1,
        explanation: "The tone is established by the author's choice of adjectives, verbs, and phrasing (e.g., highly technical vs emotional/critical language). \n\n*Real-Life Example*: In reviewing customer emails, a customer service representative flags negative keywords like 'disappointed' or 'terrible' to route complaints to the escalation desk."
      },
      {
        q: "What is the contextual synonym of the word 'VIBRANT' when describing a lively bazaar scene?",
        options: ["Dull", "Quiet", "Energetic", "Dark"],
        correct: 2,
        explanation: "Vibrant in the context of a lively bazaar means energetic, colorful, and active. \n\n*Real-Life Example*: A town festival with crowds, music, and food stalls is described as a 'vibrant' environment because of its high energy and activity."
      },
      {
        q: "What is the primary purpose of scanning a reading comprehension passage in competitive exams?",
        options: ["To memorize the essay", "To search for specific keywords or facts", "To evaluate author styles", "To critique grammar details"],
        correct: 1,
        explanation: "Scanning allows you to locate specific keywords, numbers, or details required to answer specific questions quickly. \n\n*Real-Life Example*: A lawyer scanning a 100-page contract is looking specifically for terms like 'indemnity' or 'termination clause' rather than reading every word."
      },
      {
        q: "Which word represents the best contextual antonym of 'COMPLACENT' in a professional workforce?",
        options: ["Satisfied", "Ambitious", "Passive", "Indifferent"],
        correct: 1,
        explanation: "Complacent refers to uncritical satisfaction with oneself. Its opposite is being ambitious or proactive. \n\n*Real-Life Example*: In an annual performance review, an employee who sits idle is marked as complacent, whereas one who takes on new training is ambitious."
      },
      {
        q: "In standard reading comprehension passages, where is the main thesis or focus point typically located?",
        options: ["The introductory paragraph", "The middle supporting data", "The references list", "The final sentence of the third paragraph"],
        correct: 0,
        explanation: "The introduction introduces the main argument, setting the course of the entire passage. \n\n*Real-Life Example*: In journalism, the lead sentence of a newspaper article (the 'lede') tells the reader the main story, while later paragraphs add details."
      }
    ],
    leaderboard: [
      { name: "Gita Rao", score: 100, time: "1m 40s" },
      { name: "Nithin S.", score: 100, time: "1m 55s" },
      { name: "Shruti Sen", score: 80, time: "2m 10s" }
    ]
  },
  "Error Spotting & Grammar": {
    aiExplanation: "Look for subject-verb agreements, correct prepositions, pronoun usage, tense consistency, and parallel structures. For instance, collective nouns (like 'committee') take singular/plural verbs depending on group unity.",
    questions: [
      {
        q: "Identify the part containing an error: 'She have (A) been studying (B) since morning (C).'",
        options: ["She have (A)", "been studying (B)", "since morning (C)", "No error"],
        correct: 0,
        explanation: "Singular subject 'She' requires the singular helper verb 'has', not 'have'. \n\n*Real-Life Example*: In a corporate cover letter, writing 'Our team have completed the project' instead of 'Our team has completed the project' looks unprofessional to clients."
      },
      {
        q: "Fill in the blank with the correct preposition: 'He distributed the sweets ___ the ten children.'",
        options: ["between", "among", "with", "besides"],
        correct: 1,
        explanation: "'Between' is used for exactly two subjects. For three or more subjects, 'among' is grammatically correct. \n\n*Real-Life Example*: When a school teacher splits snacks, she splits them 'between' the two monitors, or distributes them 'among' the entire class."
      },
      {
        q: "Select the grammatically correct sentence from the following options:",
        options: ["Neither he nor I are going.", "Neither he nor I am going.", "Neither he nor I is going.", "Neither he nor me am going."],
        correct: 1,
        explanation: "When pronouns are joined by 'or'/'nor', the verb agrees in person with the nearer pronoun. 'I' is nearer, hence 'am'. \n\n*Real-Life Example*: Writing a clean joint statement 'Neither my manager nor I am attending the conference' ensures clear grammatical agreement."
      },
      {
        q: "Find the error: 'Each of the students (A) are required (B) to submit their report (C).'",
        options: ["Each of the students (A)", "are required (B)", "to submit their report (C)", "No error"],
        correct: 1,
        explanation: "'Each' is a singular distributor. Therefore, the verb must be singular ('is required' instead of 'are required'). \n\n*Real-Life Example*: In a university syllabus, declaring 'Each student is required to attend' is the correct form for singular distribution."
      },
      {
        q: "Identify the part containing an error: 'The report, along with the charts, (A) have been (B) submitted yesterday (C).'",
        options: ["The report, along with the charts, (A)", "have been (B)", "submitted yesterday (C)", "No error"],
        correct: 1,
        explanation: "Parenthetical phrases (along with...) do not alter subject number. The singular subject 'The report' requires 'has been'. \n\n*Real-Life Example*: In legal filings, writing 'The contract, together with all addenda, is signed' ensures the main singular subject agrees with the verb."
      }
    ],
    leaderboard: [
      { name: "Abhinav B.", score: 100, time: "48s" },
      { name: "Preeti Jain", score: 100, time: "54s" },
      { name: "Rahul Dutt", score: 80, time: "1m 05s" }
    ]
  }
};
