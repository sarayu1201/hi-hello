import sys
import os

def trace():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sys.path.append(os.path.join(root_dir, "QuestionBank", "python"))
    
    try:
        from import_all_papers import to_latex
        
        # Test input with newline or backslash-n
        test_str = "which may be misspelt\nor inappropriate in their usage"
        out_str = to_latex(test_str)
        print("TRACE OUTPUT 1 (newline):")
        print(f"  Input:  {repr(test_str)}")
        print(f"  Output: {repr(out_str)}")
        
        # Test input with literal backslash-n
        test_str2 = "which may be misspelt\\nor inappropriate in their usage"
        out_str2 = to_latex(test_str2)
        print("\nTRACE OUTPUT 2 (literal backslash-n):")
        print(f"  Input:  {repr(test_str2)}")
        print(f"  Output: {repr(out_str2)}")
        
    except Exception as e:
        print(f"Error tracing: {e}")

if __name__ == "__main__":
    trace()
