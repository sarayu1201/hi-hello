import sys
import os

def trace():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sys.path.append(os.path.join(root_dir, "QuestionBank", "python"))
    
    try:
        from import_all_papers import to_latex
        test_str = "What will come in the place of question mark (?) in the following question?\n\\(156 \\times$5 - 16$\\times 9 = ? \\times 318\\)"
        out_str = to_latex(test_str)
        print("MATH BLOCK TRACE OUTPUT:")
        print(f"  Input:  {repr(test_str)}")
        print(f"  Output: {repr(out_str)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trace()
