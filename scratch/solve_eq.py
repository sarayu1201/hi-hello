import itertools

# We have 7 numbers: 80, 1782, 2300, 27, 24, 115, 264
# Let's search all permutations of these 7 numbers into a division/multiplication tree:
# e.g., (A / B) * (C / D) * (E / F) = ? * G or similar.
# Let's write a general solver:

nums = [80, 1782, 2300, 27, 24, 115, 264]

# Let's try to match:
# (a / b) * (c / d) * (e / f) = ? * (g / h) or similar.
# Or (a / b) * (c / d) = (e / f) * (? / g) etc.
# Let's try all arrangements of the 7 numbers into 7 positions: p0, p1, p2, p3, p4, p5, p6
# And one position is ? (which we solve for)
# Let's test all positions for ? among 8 slots (4 numerators, 4 denominators)

all_nums = [80, 1782, 2300, 27, 24, 115, 264]

# Let's assume the equation is:
# (n1 / d1) * (n2 / d2) * (n3 / d3) = (n4 / d4)
# where one of the 8 variables is ? (represented as x = 1.5)
# and the other 7 are a permutation of all_nums.

for perm in itertools.permutations(all_nums):
    # Let's assign them to 7 of the 8 positions
    # Case 0: ? is n4
    # (perm[0]/perm[3]) * (perm[1]/perm[4]) * (perm[2]/perm[5]) = x / perm[6]
    n1, n2, n3 = perm[0], perm[1], perm[2]
    d1, d2, d3, d4 = perm[3], perm[4], perm[5], perm[6]
    # Check if this equals 1.5
    try:
        val = (n1/d1) * (n2/d2) * (n3/d3) * d4
        if abs(val - 1.5) < 1e-5:
            print(f"Match 0: ({n1}/{d1}) * ({n2}/{d2}) * ({n3}/{d3}) = ? / {d4}")
    except:
        pass

    # Case 1: ? is d4
    # (perm[0]/perm[3]) * (perm[1]/perm[4]) * (perm[2]/perm[5]) = perm[6] / x
    try:
        val = perm[6] / ((n1/d1) * (n2/d2) * (n3/d3))
        if abs(val - 1.5) < 1e-5:
            print(f"Match 1: ({n1}/{d1}) * ({n2}/{d2}) * ({n3}/{d3}) = {perm[6]} / ?")
    except:
        pass

    # Case 2: ? is n3
    # (perm[0]/perm[3]) * (perm[1]/perm[4]) * (x / perm[5]) = perm[2] / perm[6]
    try:
        val = (perm[2]/perm[6]) * perm[5] / ((perm[0]/perm[3]) * (perm[1]/perm[4]))
        if abs(val - 1.5) < 1e-5:
            print(f"Match 2: ({perm[0]}/{perm[3]}) * ({perm[1]}/{perm[4]}) * (?/{perm[5]}) = {perm[2]} / {perm[6]}")
    except:
        pass
        
    # Case 3: ? is d3
    # (perm[0]/perm[3]) * (perm[1]/perm[4]) * (perm[2] / x) = perm[5] / perm[6]
    try:
        val = perm[2] * ((perm[0]/perm[3]) * (perm[1]/perm[4])) / (perm[5]/perm[6])
        if abs(val - 1.5) < 1e-5:
            print(f"Match 3: ({perm[0]}/{perm[3]}) * ({perm[1]}/{perm[4]}) * ({perm[2]}/?) = {perm[5]} / {perm[6]}")
    except:
        pass
