import fitz
import re
import json
import os

pdf_path = r'c:\Users\Administrator\Downloads\sbi po questions\SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift.pdf'
out_json_path = r'c:\Users\Administrator\Downloads\sbi po questions\sbi_po_prelims test _1.json'

doc = fitz.open(pdf_path)

full_text = ''
for i, page in enumerate(doc):
    full_text += f'\n[PAGE {i+1}]\n' + page.get_text('text')

# 1. Extract Solutions (S1 to S100)
sols_map = {}
for i in range(1, 101):
    m = re.search(rf'S{i}\.\s*Ans\.\s*\(?([a-eA-E])\)?', full_text)
    if m:
        sols_map[i] = m.group(1).upper()
    else:
        # fallback search
        m2 = re.search(rf'S{i}\.\s*Ans\.?\s*([a-eA-E])', full_text)
        if m2:
            sols_map[i] = m2.group(1).upper()
        else:
            sols_map[i] = "A"

# 2. Map directions
directions_map = {}

# Passages and directions text
p_cloze = """The controlled use of fire represents one of humanity's most ______ (A) technological breakthroughs. Early hominids ______ (B) fire long before the ______ (C) of agriculture or permanent settlements. Fire provided warmth in cold climates, extended light into dark hours, and provided protection from predators. Most importantly, cooking food over fire ______ (D) dense nutrients, making them easier to digest and allowing human brains to absorb higher energy. Thus, fire was not merely a tool for survival; it was a ______ (E) catalyst for human cognitive and cultural evolution."""

p_rc = """However, the global economic environment remains uncertain. Trade disruptions, fluctuating commodity prices, and geopolitical tensions can stall development plans, even in countries with ambitious social investment strategies. A grim example is when external shocks force governments to cut back on essential public spending, undermining years of progress in education and healthcare. Moreover, persistent inflation erodes purchasing power, disproportionately affecting vulnerable populations. Central banks face the delicate task of balancing interest rate hikes to curb inflation without triggering a recession. Meanwhile, technological advancements, particularly in artificial intelligence and automation, offer opportunities for productivity gains, but also pose challenges for labor markets. Navigating these economic shifts requires resilient policy frameworks and international cooperation."""

p_jumble = """(A) Climate change is accelerating at an unprecedented rate across the globe.
(B) Rising global temperatures have led to severe weather anomalies.
(C) Consequently, coastal regions face severe flooding risks.
(D) Governments are implementing renewable energy targets to mitigate impacts.
(E) Sustainable agricultural practices are also being promoted widely.
(F) Urgent international collaboration remains the key to long-term success."""

p_di_pie = """The pie chart given in the paper shows the total population distribution in five cities (A, B, C, D, E). Total population = 1200."""

p_di_bar = """The bar graph given in the paper shows the data/production/sales across different categories for companies across multiple years."""

p_caselet = """Read the following information: A total of 100 people like three different beverages (Tea, Coffee, Juice). a:c = 5:3, g = b, e = 16, d = 130% of f, d:f = 13:10, f = 20."""

for i in range(1, 7):
    directions_map[i] = f"Directions (1-6): In the following passage, there are blanks denoted by letters (A)-(E). Choose the most appropriate word for each blank.\n\n{p_cloze}"

for i in range(16, 24):
    directions_map[i] = f"Directions (16-23): Read the following passage carefully and answer the questions that follow.\n\n{p_rc}"

for i in range(31, 36):
    directions_map[i] = f"Directions (31-35): Rearrange the given six sentences (A), (B), (C), (D), (E), and (F) in a logical order to form a coherent paragraph.\n\n{p_jumble}"

for i in range(41, 46):
    directions_map[i] = f"Directions (41-45): Study the pie chart showing population distribution of five cities (A, B, C, D, E) and answer the questions.\n\n{p_di_pie}"

for i in range(46, 50):
    directions_map[i] = f"Directions (46-49): Read the given caselet information regarding beverage preferences of 100 people and answer the questions.\n\n{p_caselet}"

for i in range(50, 56):
    directions_map[i] = f"Directions (50-55): Study the bar graph carefully and answer the following questions.\n\n{p_di_bar}"

for i in range(59, 62):
    directions_map[i] = "Directions (59-61): In each question, two equations (I) and (II) are given. You have to solve both equations and establish the relationship between x and y.\nOption A: x > y\nOption B: x >= y\nOption C: x < y\nOption D: x <= y\nOption E: x = y or no relationship can be established."

for i in range(71, 76):
    directions_map[i] = "Directions (71-75): Study the given information carefully and answer the questions. Seven persons sit in a row facing North according to their age and designation."

for i in range(76, 79):
    directions_map[i] = "Directions (76-78): In each question below, statements are given followed by conclusions. Decide which of the given conclusions logically follows."

for i in range(81, 86):
    directions_map[i] = "Directions (81-85): Read the given information carefully: 8 persons live on 4 different floors in 2 different flats (Flat A and Flat B)."

for i in range(86, 91):
    directions_map[i] = "Directions (86-90): Read the given information carefully: 10 persons sit in two parallel rows containing 5 persons each facing each other."

for i in range(91, 96):
    directions_map[i] = "Directions (91-95): Read the given information carefully: 7 persons N, M, K, Q, L, O, P were born in different years (1955, 1961, 1972, 1987, 1998, 2006, 2017) with base year 2025."

for i in range(96, 101):
    directions_map[i] = "Directions (96-100): Study the following information carefully: 7 persons A, B, C, D, E, F, G sit around a circular table facing the center."

print('Directions mapped.')
