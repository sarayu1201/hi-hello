import json

filepath = "QuestionBank/json/ssc_chsl_tier1_papers/ssc_chsl_tier1_paper4.json"
with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

# Q65 (Quant Q15, index 64)
q65 = data[64]
q65_text = "If $\\sin(\\theta + 30^\\circ) = \\frac{3}{\\sqrt{12}}$, then the value of $\\theta$ is equal to:"
q65_exp = "$\\frac{3}{\\sqrt{12}} = \\frac{3}{2\\sqrt{3}} = \\frac{\\sqrt{3}}{2}$\n$\\sin(\\theta + 30^\\circ) = \\frac{\\sqrt{3}}{2} \\implies \\theta + 30^\\circ = 60^\\circ \\implies \\theta = 30^\\circ$."
q65["question"] = q65_text
q65["q"] = q65_text
q65["explanation"] = q65_exp

# Q73 (Quant Q23, index 72)
q73 = data[72]
q73_text = "If $\\sqrt{x} = \\sqrt{5} - \\sqrt{3}$, then the value of $x^2 - 16x + 6$ is:"
q73_exp = (
    "Squaring both sides:\n"
    "$x = 5 + 3 - 2\\sqrt{15} \\implies x = 8 - 2\\sqrt{15}$\n"
    "$\\implies x - 8 = -2\\sqrt{15}$\n"
    "Squaring again:\n"
    "$(x - 8)^2 = (-2\\sqrt{15})^2 \\implies x^2 - 16x + 64 = 60$\n"
    "$\\implies x^2 - 16x + 4 = 0$\n"
    "Therefore, $x^2 - 16x + 6 = (x^2 - 16x + 4) + 2 = 0 + 2 = 2$."
)
q73["question"] = q73_text
q73["q"] = q73_text
q73["explanation"] = q73_exp

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully fixed CHSL Paper 4 Q15 and Q23 sqrt issues.")
