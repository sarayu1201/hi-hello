import re

def test():
    inputs = [
        "sbi_clerk_prelims_test2",
        "SBI Clerk Prelims - Test 2",
        "sbi_clerk_prelims_test10",
        "SBI Clerk Prelims - Test 10",
        "sbi_clerk_prelims_test1"
    ]
    
    pattern1 = re.compile(r'\b(?:mock|test|paper|cbt)?\s*_?(\d+)\b', re.IGNORECASE)
    pattern2 = re.compile(r'_(\d+)$')
    
    print("Testing Regex Matches:")
    for inp in inputs:
        queryStr = inp.lower().strip()
        
        # Test pattern 1
        m1 = pattern1.search(queryStr)
        # Test pattern 2
        m2 = pattern2.search(queryStr)
        
        match_val = None
        if m1:
            match_val = m1.group(1)
        elif m2:
            match_val = m2.group(1)
            
        print(f"Input: '{inp}'")
        print(f"  m1 matched group(1): {m1.group(1) if m1 else None}")
        print(f"  m1 matched whole:    {m1.group(0) if m1 else None}")
        print(f"  m2 matched group(1): {m2.group(1) if m2 else None}")
        print(f"  Resolved Number:     {match_val}")

if __name__ == "__main__":
    test()
