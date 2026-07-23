import re

def test():
    inputs = [
        "sbi_clerk_prelims_test2",
        "SBI Clerk Prelims - Test 2",
        "sbi_clerk_prelims_test10",
        "SBI Clerk Prelims - Test 10",
        "sbi_clerk_prelims_test1",
        "ibps_clerk_prelims_test5"
    ]
    
    # Corrected regex: remove the leading \b and check
    pattern = re.compile(r'(?:mock|test|paper|cbt)?\s*_?(\d+)\b', re.IGNORECASE)
    
    print("Testing Corrected Regex:")
    for inp in inputs:
        queryStr = inp.lower().strip()
        m = pattern.search(queryStr)
        match_val = m.group(1) if m else None
        print(f"Input: '{inp}' -> Match: {match_val} (Matched segment: '{m.group(0) if m else None}')")

if __name__ == "__main__":
    test()
