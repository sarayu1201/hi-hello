# Let's find the combination of operators that makes ? = 1.5
# The numbers are:
# Numerators: 1782, 2300, 80, ?
# Denominators: 27, 24, 115, 264
# In some order, they form four fractions:
# F1 = n1/d1, F2 = n2/d2, F3 = n3/d3, F4 = n4/d4
# And they are multiplied or equated: e.g. F1 * F2 * F3 = F4 or similar.
# In the solution layout:
# 80
# 1782
# 2300
# ?
# 27
# 24
# 115
# 264
# ×
# ×
# =
# ×
# This layout implies:
# (80/27) * (1782/24) * (?/115) = (2300/264) ?
# Or (1782/27) * (80/24) * (?/115) = (2300/264) ?
# Let's test combinations!

import itertools

numerators = [80, 1782, 2300]
denominators = [27, 24, 115, 264]

# Let's check which combination of matching numerators to denominators, and operators, gives ? = 1.5
for num_perm in itertools.permutations(numerators):
    for den_perm in itertools.permutations(denominators):
        # We have three complete fractions:
        # f1 = num_perm[0] / den_perm[0]
        # f2 = num_perm[1] / den_perm[1]
        # f3 = num_perm[2] / den_perm[2]
        # And one fraction with ?:
        # f_q = ? / den_perm[3]
        
        # Let's test: f1 * f2 * f_q = f3
        # ? = f3 * den_perm[3] / (f1 * f2)
        try:
            val = (num_perm[2]/den_perm[2]) * den_perm[3] / ((num_perm[0]/den_perm[0]) * (num_perm[1]/den_perm[1]))
            if abs(val - 1.5) < 1e-5:
                print(f"Match 1: ({num_perm[0]}/{den_perm[0]}) * ({num_perm[1]}/{den_perm[1]}) * (?/{den_perm[3]}) = ({num_perm[2]}/{den_perm[2]})")
        except:
            pass

        # Let's test: f1 * f2 = f3 * f_q
        # ? = f1 * f2 * den_perm[3] / f3
        try:
            val = (num_perm[0]/den_perm[0]) * (num_perm[1]/den_perm[1]) * den_perm[3] / (num_perm[2]/den_perm[2])
            if abs(val - 1.5) < 1e-5:
                print(f"Match 2: ({num_perm[0]}/{den_perm[0]}) * ({num_perm[1]}/{den_perm[1]}) = ({num_perm[2]}/{den_perm[2]}) * (?/{den_perm[3]})")
        except:
            pass
            
        # Let's test: f1 * f_q = f2 * f3
        # ? = f2 * f3 * den_perm[3] / f1
        try:
            val = (num_perm[1]/den_perm[1]) * (num_perm[2]/den_perm[2]) * den_perm[3] / (num_perm[0]/den_perm[0])
            if abs(val - 1.5) < 1e-5:
                print(f"Match 3: ({num_perm[0]}/{den_perm[0]}) * (?/{den_perm[3]}) = ({num_perm[1]}/{den_perm[1]}) * ({num_perm[2]}/{den_perm[2]})")
        except:
            pass
