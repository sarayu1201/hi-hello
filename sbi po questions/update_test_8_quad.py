import json

# Standard Options for Quadratic Equations
QUAD_OPTIONS = [
    {"id": "A", "text": "$x > y$", "image": None},
    {"id": "B", "text": "$x \\ge y$", "image": None},
    {"id": "C", "text": "$x < y$", "image": None},
    {"id": "D", "text": "$x \\le y$", "image": None},
    {"id": "E", "text": "$x = y$ or no relation can be established between $x$ and $y$", "image": None}
]

def update_test_8_quad():
    path = "sbi_po_prelims test _8.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Q61 (index 60)
    q61 = data[60]
    q61["question"] = "$I: x^2 - 17x + 70 = 0$\n$II: y^2 + 10y + 24 = 0$"
    q61["questionImage"] = None
    q61["imageStatus"] = None
    q61["imageNote"] = None
    q61["correctAnswer"] = "A"
    q61["options"] = QUAD_OPTIONS
    q61["explanation"] = (
        "**Correct Answer:** Option **A**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 - 17x + 70 = 0$\n"
        "- Equation II: $y^2 + 10y + 24 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 - 10x - 7x + 70 = 0$$\n"
        "$$x(x - 10) - 7(x - 10) = 0$$\n"
        "$$(x - 10)(x - 7) = 0 \\implies x = 10, 7$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 + 6y + 4y + 24 = 0$$\n"
        "$$y(y + 6) + 4(y + 6) = 0$$\n"
        "$$(y + 6)(y + 4) = 0 \\implies y = -6, -4$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "Since both roots of $x$ ($10, 7$) are positive and both roots of $y$ ($-6, -4$) are negative, we have:\n"
        "$$x > y$$\n\n"
        "**Conclusion:** Hence, Option **A** is the correct answer."
    )

    # Q62 (index 61)
    q62 = data[61]
    q62["question"] = "$I: x^2 - 9x + 18 = 0$\n$II: 2y^2 - 9y + 9 = 0$"
    q62["questionImage"] = None
    q62["imageStatus"] = None
    q62["imageNote"] = None
    q62["correctAnswer"] = "B"
    q62["options"] = QUAD_OPTIONS
    q62["explanation"] = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 - 9x + 18 = 0$\n"
        "- Equation II: $2y^2 - 9y + 9 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 - 6x - 3x + 18 = 0$$\n"
        "$$x(x - 6) - 3(x - 6) = 0$$\n"
        "$$(x - 6)(x - 3) = 0 \\implies x = 6, 3$$\n\n"
        "**From Equation II:**\n"
        "$$2y^2 - 6y - 3y + 9 = 0$$\n"
        "$$2y(y - 3) - 3(y - 3) = 0$$\n"
        "$$(2y - 3)(y - 3) = 0 \\implies y = 1.5, 3$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "- For $x = 6$: $6 > 1.5$, $6 > 3 \\implies x > y$\n"
        "- For $x = 3$: $3 > 1.5$, $3 = 3 \\implies x \\ge y$\n"
        "Thus, $x \\ge y$.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct answer."
    )

    # Q63 (index 62)
    q63 = data[62]
    q63["question"] = "$I: x^2 - 17x + 70 = 0$\n$II: y^2 - 14y + 48 = 0$"
    q63["questionImage"] = None
    q63["imageStatus"] = None
    q63["imageNote"] = None
    q63["correctAnswer"] = "E"
    q63["options"] = QUAD_OPTIONS
    q63["explanation"] = (
        "**Correct Answer:** Option **E**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 - 17x + 70 = 0$\n"
        "- Equation II: $y^2 - 14y + 48 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 - 10x - 7x + 70 = 0$$\n"
        "$$x(x - 10) - 7(x - 10) = 0$$\n"
        "$$(x - 10)(x - 7) = 0 \\implies x = 10, 7$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 - 8y - 6y + 48 = 0$$\n"
        "$$y(y - 8) - 6(y - 8) = 0$$\n"
        "$$(y - 8)(y - 6) = 0 \\implies y = 8, 6$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "- For $x = 10$: $10 > 8$, $10 > 6 \\implies x > y$\n"
        "- For $x = 7$: $7 < 8$, but $7 > 6 \\implies$ conflicting relations ($x < y$ and $x > y$).\n"
        "Since conflicting relationships exist, no relation can be established between $x$ and $y$.\n\n"
        "**Conclusion:** Hence, Option **E** is the correct answer."
    )

    # Q64 (index 63)
    q64 = data[63]
    q64["question"] = "$I: 4x^2 + 3x - 10 = 0$\n$II: y^2 + 10y - 119 = 0$"
    q64["questionImage"] = None
    q64["imageStatus"] = None
    q64["imageNote"] = None
    q64["correctAnswer"] = "E"
    q64["options"] = QUAD_OPTIONS
    q64["explanation"] = (
        "**Correct Answer:** Option **E**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $4x^2 + 3x - 10 = 0$\n"
        "- Equation II: $y^2 + 10y - 119 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$4x^2 + 8x - 5x - 10 = 0$$\n"
        "$$4x(x + 2) - 5(x + 2) = 0$$\n"
        "$$(4x - 5)(x + 2) = 0 \\implies x = 1.25, -2$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 + 17y - 7y - 119 = 0$$\n"
        "$$y(y + 17) - 7(y + 17) = 0$$\n"
        "$$(y - 7)(y + 17) = 0 \\implies y = 7, -17$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "- For $x = 1.25$: $1.25 < 7$, but $1.25 > -17 \\implies$ conflicting relations ($x < y$ and $x > y$).\n"
        "Since conflicting relationships exist, no relation can be established between $x$ and $y$.\n\n"
        "**Conclusion:** Hence, Option **E** is the correct answer."
    )

    # Q65 (index 64)
    q65 = data[64]
    q65["question"] = "$I: x^2 - 11x + 28 = 0$\n$II: y^2 + 13y + 30 = 0$"
    q65["questionImage"] = None
    q65["imageStatus"] = None
    q65["imageNote"] = None
    q65["correctAnswer"] = "A"
    q65["options"] = QUAD_OPTIONS
    q65["explanation"] = (
        "**Correct Answer:** Option **A**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 - 11x + 28 = 0$\n"
        "- Equation II: $y^2 + 13y + 30 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 - 7x - 4x + 28 = 0$$\n"
        "$$x(x - 7) - 4(x - 7) = 0$$\n"
        "$$(x - 7)(x - 4) = 0 \\implies x = 7, 4$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 + 10y + 3y + 30 = 0$$\n"
        "$$y(y + 10) + 3(y + 10) = 0$$\n"
        "$$(y + 10)(y + 3) = 0 \\implies y = -10, -3$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "Since both roots of $x$ ($7, 4$) are positive and both roots of $y$ ($-10, -3$) are negative, we clearly have:\n"
        "$$x > y$$\n\n"
        "**Conclusion:** Hence, Option **A** is the correct answer."
    )

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Test 8 Q61-65 updated successfully!")

if __name__ == "__main__":
    update_test_8_quad()
