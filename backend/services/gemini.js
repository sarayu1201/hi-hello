require('dotenv').config();

// Unified System Prompt rules for high precision PDF/text question parsing
const SYSTEM_PROMPT = `
You are an expert exam paper parser. Your task is to extract all questions from the provided input (images or markdown text).
Strictly follow these production rules:
1. Maintain 100% data integrity. Do not skip any question, option, text character, or mathematical symbol.
2. Guarantee exact word-for-word, character-for-character text matching for regional languages (such as Telugu and Hindi) exactly as written. Never summarize, skip, or translate them.
3. Identify all mathematical expressions, physics formulas, equations, fractions, and matrices, and convert them to standard, perfectly isolated LaTeX formatting ($...$ for inline math, and $$...$$ for block math equations). Ensure LaTeX delimiters are balanced.
4. Map the choices to the options array structured with IDs 'A', 'B', 'C', and 'D'. Each option text must map strictly to a unique, non-duplicating option ID.
5. Double-check the generated JSON output format to ensure it contains zero duplicate properties, repeats, or malformed options.
`;

async function generateJobSummaries(title, organization, state, qualification) {
    const fallback = {
        summary_english: `Official recruitment notification released by ${organization} for the post of '${title}'. Eligible candidates are requested to verify full terms and apply online.`,
        summary_telugu: `${organization} సంస్థ నుండి '${title}' ఖాళీల భర్తీకి అధికారిక నోటిఫికేషన్ విడుదలయింది. అర్హత గల అభ్యర్థులు చివరి తేదీ లోపు ఆన్‌లైన్ ద్వారా దరఖాస్తు చేసుకోగలరు.`,
        eligibility_summary: `• Qualification: ${qualification || 'Refer to official advertisement'}\n• Nationality: Indian Citizen\n• Age Limit: As per official board guidelines`,
        important_dates_summary: `• Application Start Date: Refer to official portal\n• Application Last Date: Refer to official notification link`
    };

    return fallback;
}

async function generateAdminChatResponse(message, history, contextData) {
    return "The AI Assistant is currently disabled. Please contact system support for log details.";
}

module.exports = {
    generateJobSummaries,
    generateAdminChatResponse
};
