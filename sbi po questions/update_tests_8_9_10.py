import json

# Standard Options for Quadratic Equations
QUAD_OPTIONS = [
    {"id": "A", "text": "$x > y$", "image": None},
    {"id": "B", "text": "$x \\ge y$", "image": None},
    {"id": "C", "text": "$x < y$", "image": None},
    {"id": "D", "text": "$x \\le y$", "image": None},
    {"id": "E", "text": "$x = y$ or no relation can be established between $x$ and $y$", "image": None}
]

def update_test_8():
    path = "sbi_po_prelims test _8.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Q40 (index 39)
    q40 = data[39]
    q40["question"] = "$(15.02 \\times 12) \\div 11.99 + 24.78^2 = ?$"
    q40["questionImage"] = None
    q40["imageStatus"] = None
    q40["imageNote"] = None
    q40["explanation"] = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers:\n"
        "- $15.02 \\approx 15$\n"
        "- $11.99 \\approx 12$\n"
        "- $24.78 \\approx 25$\n\n"
        "**Step 2 (Execution):** Substitute the values back into the equation:\n"
        "$$\\text{LHS} \\approx (15 \\times 12) \\div 12 + 25^2$$\n"
        "$$\\text{LHS} \\approx 180 \\div 12 + 625$$\n"
        "$$\\text{LHS} \\approx 15 + 625 = 640$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $640$ corresponds to Option **B**.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct answer."
    )

    # Q41 (index 40)
    q41 = data[40]
    q41["question"] = "$109.09 + 511.98 \\div 15.97 - ?^2 = (20.99)^2 - (19.96)^2$"
    q41["questionImage"] = None
    q41["imageStatus"] = None
    q41["imageNote"] = None
    q41["explanation"] = (
        "**Correct Answer:** Option **C**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers:\n"
        "- $109.09 \\approx 109$\n"
        "- $511.98 \\approx 512$\n"
        "- $15.97 \\approx 16$\n"
        "- $20.99 \\approx 21$\n"
        "- $19.96 \\approx 20$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the rounded values:\n"
        "$$109 + 512 \\div 16 - x^2 \\approx 21^2 - 20^2$$\n"
        "$$109 + 32 - x^2 \\approx 441 - 400$$\n"
        "$$141 - x^2 \\approx 41$$\n"
        "$$x^2 \\approx 141 - 41 = 100$$\n"
        "$$x \\approx 10$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $10$ corresponds to Option **C**.\n\n"
        "**Conclusion:** Hence, Option **C** is the correct answer."
    )

    # Q42 (index 41)
    q42 = data[41]
    q42["question"] = "$20.09\\% \\text{ of } ? + 70.03\\% \\text{ of } 699.92 = \\sqrt{676.09} \\div 12.97 + 499.99$"
    q42["questionImage"] = None
    q42["imageStatus"] = None
    q42["imageNote"] = None
    q42["explanation"] = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers/squares:\n"
        "- $20.09\\% \\approx 20\\% = 0.2$\n"
        "- $70.03\\% \\approx 70\\% = 0.7$\n"
        "- $699.92 \\approx 700$\n"
        "- $\\sqrt{676.09} \\approx \\sqrt{676} = 26$\n"
        "- $12.97 \\approx 13$\n"
        "- $499.99 \\approx 500$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$20\\% \\text{ of } x + 70\\% \\text{ of } 700 \\approx 26 \\div 13 + 500$$\n"
        "$$0.2x + 0.7 \\times 700 \\approx 2 + 500$$\n"
        "$$0.2x + 490 = 502$$\n"
        "$$0.2x = 502 - 490 = 12$$\n"
        "$$x = \\frac{12}{0.2} = 60$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $60$ corresponds to Option **B**.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct answer."
    )

    # Q43 (index 42)
    q43 = data[42]
    q43["question"] = "$\\sqrt[3]{2196.903} \\div \\sqrt{1520.960} \\times 3.102 + ? = 143.991$"
    q43["questionImage"] = None
    q43["imageStatus"] = None
    q43["imageNote"] = None
    q43["explanation"] = (
        "**Correct Answer:** Option **A**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers/cubes/squares:\n"
        "- $\\sqrt[3]{2196.903} \\approx \\sqrt[3]{2197} = 13$\n"
        "- $\\sqrt{1520.960} \\approx \\sqrt{1521} = 39$\n"
        "- $3.102 \\approx 3$\n"
        "- $143.991 \\approx 144$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$13 \\div 39 \\times 3 + x \\approx 144$$\n"
        "$$\\frac{13}{39} \\times 3 + x \\approx 144$$\n"
        "$$\\frac{1}{3} \\times 3 + x \\approx 144$$\n"
        "$$1 + x = 144 \\implies x = 143$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $143$ corresponds to Option **A**.\n\n"
        "**Conclusion:** Hence, Option **A** is the correct answer."
    )

    # Q44 (index 43)
    q44 = data[43]
    q44["question"] = "$31.9 \\times 55.011 - ? = (12.01)^3 + 7.94\\% \\text{ of } 250.14$"
    q44["questionImage"] = None
    q44["imageStatus"] = None
    q44["imageNote"] = None
    q44["explanation"] = (
        "**Correct Answer:** Option **E**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers:\n"
        "- $31.9 \\approx 32$\n"
        "- $55.011 \\approx 55$\n"
        "- $(12.01)^3 \\approx 12^3 = 1728$\n"
        "- $7.94\\% \\approx 8\\% = 0.08$\n"
        "- $250.14 \\approx 250$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$32 \\times 55 - x \\approx 1728 + 8\\% \\text{ of } 250$$\n"
        "$$1760 - x \\approx 1728 + 0.08 \\times 250$$\n"
        "$$1760 - x \\approx 1728 + 20$$\n"
        "$$1760 - x = 1748$$\n"
        "$$x = 1760 - 1748 = 12$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $12$ corresponds to Option **E**.\n\n"
        "**Conclusion:** Hence, Option **E** is the correct answer."
    )

    # Q45 (index 44)
    q45 = data[44]
    q45["question"] = "$\\frac{?}{80.95} + 23.97\\% \\text{ of } 325.09 + 55.96 \\div 7.93 = 88.06$"
    q45["questionImage"] = None
    q45["imageStatus"] = None
    q45["imageNote"] = None
    q45["explanation"] = (
        "**Correct Answer:** Option **D**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers:\n"
        "- $80.95 \\approx 81$\n"
        "- $23.97\\% \\approx 24\\% = 0.24$\n"
        "- $325.09 \\approx 325$\n"
        "- $55.96 \\approx 56$\n"
        "- $7.93 \\approx 8$\n"
        "- $88.06 \\approx 88$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$\\frac{x}{81} + 24\\% \\text{ of } 325 + 56 \\div 8 \\approx 88$$\n"
        "$$\\frac{x}{81} + 0.24 \\times 325 + 7 \\approx 88$$\n"
        "$$\\frac{x}{81} + 78 + 7 = 88$$\n"
        "$$\\frac{x}{81} + 85 = 88$$\n"
        "$$\\frac{x}{81} = 3 \\implies x = 3 \\times 81 = 243$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $243$ corresponds to Option **D**.\n\n"
        "**Conclusion:** Hence, Option **D** is the correct answer."
    )

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Test 8 updated successfully!")


def update_test_9():
    path = "sbi_po_prelims test _9.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Q55 (index 54)
    q55 = data[54]
    q55["question"] = "$59.90\\% \\text{ of } 1020.11 - 9.88\\% \\text{ of } 79.91 = ?^3 + 92.01$"
    q55["questionImage"] = None
    q55["imageStatus"] = None
    q55["imageNote"] = None
    q55["explanation"] = (
        "**Correct Answer:** Option **D**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers:\n"
        "- $59.90\\% \\approx 60\\%$\n"
        "- $1020.11 \\approx 1020$\n"
        "- $9.88\\% \\approx 10\\%$\n"
        "- $79.91 \\approx 80$\n"
        "- $92.01 \\approx 92$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$60\\% \\text{ of } 1020 - 10\\% \\text{ of } 80 \\approx x^3 + 92$$\n"
        "$$0.60 \\times 1020 - 0.10 \\times 80 \\approx x^3 + 92$$\n"
        "$$612 - 8 = x^3 + 92$$\n"
        "$$604 = x^3 + 92$$\n"
        "$$x^3 = 604 - 92 = 512$$\n"
        "$$x = \\sqrt[3]{512} = 8$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $8$ corresponds to Option **D**.\n\n"
        "**Conclusion:** Hence, Option **D** is the correct answer."
    )

    # Q56 (index 55)
    q56 = data[55]
    q56["question"] = "$(10.22 \\times 9.94) \\div 4.98 - ? = 6.97$"
    q56["questionImage"] = None
    q56["imageStatus"] = None
    q56["imageNote"] = None
    q56["explanation"] = (
        "**Correct Answer:** Option **E**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers:\n"
        "- $10.22 \\approx 10$\n"
        "- $9.94 \\approx 10$\n"
        "- $4.98 \\approx 5$\n"
        "- $6.97 \\approx 7$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$(10 \\times 10) \\div 5 - x \\approx 7$$\n"
        "$$100 \\div 5 - x \\approx 7$$\n"
        "$$20 - x = 7$$\n"
        "$$x = 20 - 7 = 13$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $13$ corresponds to Option **E**.\n\n"
        "**Conclusion:** Hence, Option **E** is the correct answer."
    )

    # Q57 (index 56)
    q57 = data[56]
    q57["question"] = "$129.92 + 199.89 + 40.01\\% \\text{ of } 160.21 + 6.12 = ?^2$"
    q57["questionImage"] = None
    q57["imageStatus"] = None
    q57["imageNote"] = None
    q57["explanation"] = (
        "**Correct Answer:** Option **D**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers:\n"
        "- $129.92 \\approx 130$\n"
        "- $199.89 \\approx 200$\n"
        "- $40.01\\% \\approx 40\\%$\n"
        "- $160.21 \\approx 160$\n"
        "- $6.12 \\approx 6$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$130 + 200 + 40\\% \\text{ of } 160 + 6 \\approx x^2$$\n"
        "$$330 + 0.40 \\times 160 + 6 \\approx x^2$$\n"
        "$$330 + 64 + 6 = x^2$$\n"
        "$$x^2 = 400 \\implies x = 20$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $20$ corresponds to Option **D**.\n\n"
        "**Conclusion:** Hence, Option **D** is the correct answer."
    )

    # Q58 (index 57)
    q58 = data[57]
    q58["question"] = "$\\sqrt{1764.02} + 21.04^2 - ? = \\frac{5}{12} \\times 167.97$"
    q58["questionImage"] = None
    q58["imageStatus"] = None
    q58["imageNote"] = None
    q58["explanation"] = (
        "**Correct Answer:** Option **A**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers/squares:\n"
        "- $\\sqrt{1764.02} \\approx \\sqrt{1764} = 42$\n"
        "- $21.04^2 \\approx 21^2 = 441$\n"
        "- $167.97 \\approx 168$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$42 + 441 - x \\approx \\frac{5}{12} \\times 168$$\n"
        "$$483 - x \\approx 5 \\times 14$$\n"
        "$$483 - x = 70$$\n"
        "$$x = 483 - 70 = 413$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $413$ corresponds to Option **A**.\n\n"
        "**Conclusion:** Hence, Option **A** is the correct answer."
    )

    # Q59 (index 58)
    q59 = data[58]
    q59["question"] = "$\\sqrt[3]{729.14} + 11.01^3 + 60.24\\% \\text{ of } 449.86 = ?$"
    q59["questionImage"] = None
    q59["imageStatus"] = None
    q59["imageNote"] = None
    q59["explanation"] = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers/cubes:\n"
        "- $\\sqrt[3]{729.14} \\approx \\sqrt[3]{729} = 9$\n"
        "- $11.01^3 \\approx 11^3 = 1331$\n"
        "- $60.24\\% \\approx 60\\%$\n"
        "- $449.86 \\approx 450$\n\n"
        "**Step 2 (Execution):** Substitute the values back into the equation:\n"
        "$$\\text{LHS} \\approx 9 + 1331 + 60\\% \\text{ of } 450$$\n"
        "$$\\text{LHS} \\approx 1340 + 0.60 \\times 450$$\n"
        "$$\\text{LHS} \\approx 1340 + 270 = 1610$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $1610$ corresponds to Option **B**.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct answer."
    )

    # Q60 (index 59)
    q60 = data[59]
    q60["question"] = "$22.11^2 + 199.98 - ? = 29.89\\% \\text{ of } 400.02$"
    q60["questionImage"] = None
    q60["imageStatus"] = None
    q60["imageNote"] = None
    q60["explanation"] = (
        "**Correct Answer:** Option **E**\n\n"
        "**Key Concept:** Simplification & Approximation\n\n"
        "**Step 1 (Setup):** Round the decimal values to the nearest integers/squares:\n"
        "- $22.11^2 \\approx 22^2 = 484$\n"
        "- $199.98 \\approx 200$\n"
        "- $29.89\\% \\approx 30\\%$\n"
        "- $400.02 \\approx 400$\n\n"
        "**Step 2 (Execution):** Let the unknown value be $x$. Substitute the values:\n"
        "$$484 + 200 - x \\approx 30\\% \\text{ of } 400$$\n"
        "$$684 - x \\approx 0.30 \\times 400$$\n"
        "$$684 - x = 120$$\n"
        "$$x = 684 - 120 = 564$$\n\n"
        "**Step 3 (Verification):** Comparing the result with options, $564$ corresponds to Option **E**.\n\n"
        "**Conclusion:** Hence, Option **E** is the correct answer."
    )

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Test 9 updated successfully!")


def update_test_10():
    path = "sbi_po_prelims test _10.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Q42 (index 41)
    q42 = data[41]
    q42["question"] = "$I: x^2 - 32x + 112 = 0$\n$II: y^2 - 7y + 12 = 0$"
    q42["questionImage"] = None
    q42["imageStatus"] = None
    q42["imageNote"] = None
    q42["correctAnswer"] = "B"
    q42["options"] = QUAD_OPTIONS
    q42["explanation"] = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations in terms of factorized roots:\n"
        "- Equation I: $x^2 - 32x + 112 = 0$\n"
        "- Equation II: $y^2 - 7y + 12 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 - 28x - 4x + 112 = 0$$\n"
        "$$x(x - 28) - 4(x - 28) = 0$$\n"
        "$$(x - 28)(x - 4) = 0 \\implies x = 28, 4$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 - 4y - 3y + 12 = 0$$\n"
        "$$y(y - 4) - 3(y - 4) = 0$$\n"
        "$$(y - 4)(y - 3) = 0 \\implies y = 4, 3$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "- $28 > 4$, $28 > 3$\n"
        "- $4 = 4$, $4 > 3$\n"
        "Thus, $x \\ge y$.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct answer."
    )

    # Q43 (index 42)
    q43 = data[42]
    q43["question"] = "$I: x^2 + 12x + 35 = 0$\n$II: y^2 + 7y + 10 = 0$"
    q43["questionImage"] = None
    q43["imageStatus"] = None
    q43["imageNote"] = None
    q43["correctAnswer"] = "D"
    q43["options"] = QUAD_OPTIONS
    q43["explanation"] = (
        "**Correct Answer:** Option **D**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 + 12x + 35 = 0$\n"
        "- Equation II: $y^2 + 7y + 10 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 + 7x + 5x + 35 = 0$$\n"
        "$$x(x + 7) + 5(x + 7) = 0$$\n"
        "$$(x + 7)(x + 5) = 0 \\implies x = -7, -5$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 + 5y + 2y + 10 = 0$$\n"
        "$$y(y + 5) + 2(y + 5) = 0$$\n"
        "$$(y + 5)(y + 2) = 0 \\implies y = -5, -2$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "- For $x = -7$: $-7 < -5$, $-7 < -2 \\implies x < y$\n"
        "- For $x = -5$: $-5 = -5$, $-5 < -2 \\implies x \\le y$\n"
        "Thus, $x \\le y$.\n\n"
        "**Conclusion:** Hence, Option **D** is the correct answer."
    )

    # Q44 (index 43)
    q44 = data[43]
    q44["question"] = "$I: x^2 - 7x - 60 = 0$\n$II: y^2 + 13y + 40 = 0$"
    q44["questionImage"] = None
    q44["imageStatus"] = None
    q44["imageNote"] = None
    q44["correctAnswer"] = "B"
    q44["options"] = QUAD_OPTIONS
    q44["explanation"] = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 - 7x - 60 = 0$\n"
        "- Equation II: $y^2 + 13y + 40 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 - 12x + 5x - 60 = 0$$\n"
        "$$x(x - 12) + 5(x - 12) = 0$$\n"
        "$$(x - 12)(x + 5) = 0 \\implies x = 12, -5$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 + 8y + 5y + 40 = 0$$\n"
        "$$y(y + 8) + 5(y + 8) = 0$$\n"
        "$$(y + 8)(y + 5) = 0 \\implies y = -8, -5$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "- For $x = 12$: $12 > -8$, $12 > -5 \\implies x > y$\n"
        "- For $x = -5$: $-5 > -8$, $-5 = -5 \\implies x \\ge y$\n"
        "Thus, $x \\ge y$.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct answer."
    )

    # Q45 (index 44)
    q45 = data[44]
    q45["question"] = "$I: x^2 + x - 12 = 0$\n$II: y^2 + 2y - 15 = 0$"
    q45["questionImage"] = None
    q45["imageStatus"] = None
    q45["imageNote"] = None
    q45["correctAnswer"] = "E"
    q45["options"] = QUAD_OPTIONS
    q45["explanation"] = (
        "**Correct Answer:** Option **E**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 + x - 12 = 0$\n"
        "- Equation II: $y^2 + 2y - 15 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 + 4x - 3x - 12 = 0$$\n"
        "$$x(x + 4) - 3(x + 4) = 0$$\n"
        "$$(x + 4)(x - 3) = 0 \\implies x = -4, 3$$\n\n"
        "**From Equation II:**\n"
        "$$y^2 + 5y - 3y - 15 = 0$$\n"
        "$$y(y + 5) - 3(y + 5) = 0$$\n"
        "$$(y + 5)(y - 3) = 0 \\implies y = -5, 3$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "- For $x = 3$: $3 > -5$, $3 = 3 \\implies x \\ge y$\n"
        "- For $x = -4$: $-4 > -5$, but $-4 < 3 \\implies x > y$ and $x < y$\n"
        "Since conflicting relationships exist ($x > y$ and $x < y$), no relation can be established.\n\n"
        "**Conclusion:** Hence, Option **E** is the correct answer."
    )

    # Q46 (index 45)
    q46 = data[45]
    q46["question"] = "$I: x^2 + 31x + 84 = 0$\n$II: 4y^2 - 19y + 21 = 0$"
    q46["questionImage"] = None
    q46["imageStatus"] = None
    q46["imageNote"] = None
    q46["correctAnswer"] = "C"
    q46["options"] = QUAD_OPTIONS
    q46["explanation"] = (
        "**Correct Answer:** Option **C**\n\n"
        "**Key Concept:** Quadratic Equations\n\n"
        "**Step 1 (Setup):** Write the quadratic equations:\n"
        "- Equation I: $x^2 + 31x + 84 = 0$\n"
        "- Equation II: $4y^2 - 19y + 21 = 0$\n\n"
        "**Step 2 (Execution):** Solve both equations:\n"
        "**From Equation I:**\n"
        "$$x^2 + 28x + 3x + 84 = 0$$\n"
        "$$x(x + 28) + 3(x + 28) = 0$$\n"
        "$$(x + 28)(x + 3) = 0 \\implies x = -28, -3$$\n\n"
        "**From Equation II:**\n"
        "$$4y^2 - 12y - 7y + 21 = 0$$\n"
        "$$4y(y - 3) - 7(y - 3) = 0$$\n"
        "$$(4y - 7)(y - 3) = 0 \\implies y = 1.75, 3$$\n\n"
        "**Step 3 (Verification):** Compare the roots:\n"
        "Since both roots of $x$ ($x = -28, -3$) are negative and both roots of $y$ ($y = 1.75, 3$) are positive, we clearly have:\n"
        "$$x < y$$\n\n"
        "**Conclusion:** Hence, Option **C** is the correct answer."
    )

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Test 10 updated successfully!")

if __name__ == "__main__":
    update_test_8()
    update_test_9()
    update_test_10()
