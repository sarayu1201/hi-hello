import sys
import os

def trace():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sys.path.append(os.path.join(root_dir, "QuestionBank", "python"))
    
    try:
        from import_all_papers import to_latex
        
        test_cases = [
            ("Q36 math block", 'What will come in the place of question mark (?) in the following question?\n$7 \\times 5-$ 8)$\\div 9 + 3 = ?$'),
            ("Q38 math block", 'What will come in the place of question mark (?) in the following question?\n$36 + 30$\\% \\text{ of }$750 - 136 = ?$^3$$'),
            ("Q32 math block", 'What will come in the place of question mark (?) in the following question?\n$254 + 312 - ? = 420$$$')
        ]
        
        print("TRACING PATCHED to_latex ON ACTUAL INPUTS:")
        for label, tc in test_cases:
            print(f"\n[{label}]:")
            print(f"  Input:  {repr(tc)}")
            print(f"  Output: {repr(to_latex(tc))}")
            
    except Exception as e:
        print(f"Error compiling/running importer: {e}")

if __name__ == "__main__":
    trace()
