def clean_internal_dollars(text):
    parts = []
    idx = 0
    while idx < len(text):
        # Find next open delimiter
        open_idx = text.find("\\(", idx)
        open_bracket_idx = text.find("\\[", idx)
        
        # Determine which comes first
        first_open = -1
        close_delim = ""
        if open_idx != -1 and (open_bracket_idx == -1 or open_idx < open_bracket_idx):
            first_open = open_idx
            close_delim = "\\)"
        elif open_bracket_idx != -1:
            first_open = open_bracket_idx
            close_delim = "\\]"
            
        if first_open == -1:
            parts.append(text[idx:])
            break
            
        parts.append(text[idx:first_open])
        
        # Find corresponding close delimiter
        close_idx = text.find(close_delim, first_open + 2)
        if close_idx == -1:
            block_content = text[first_open:].replace('$', '')
            parts.append(block_content)
            break
            
        block_content = text[first_open:close_idx + 2].replace('$', '')
        parts.append(block_content)
        idx = close_idx + 2
        
    return "".join(parts)

def test():
    test_str = "What will come in the place of question mark (?) in the following question?\n\\(156 \\times$5 - 16$\\times 9 = ? \\times 318\\)"
    cleaned = clean_internal_dollars(test_str)
    print("BEFORE to_latex (cleaned internal dollars):")
    print(repr(cleaned))
    
if __name__ == "__main__":
    test()
