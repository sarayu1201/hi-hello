import os
import sys
import subprocess

# Ensure pillow is installed
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not found, installing pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFont

def draw_arrow(draw, start, end, width=2, color=(0, 0, 0)):
    # Draw the main line
    draw.line([start, end], fill=color, width=width)
    
    # Calculate arrow head angle and points
    # Simple straight arrow heads based on direction
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    
    if dx > 0 and dy == 0: # pointing right
        draw.polygon([end, (end[0]-10, end[1]-6), (end[0]-10, end[1]+6)], fill=color)
    elif dx < 0 and dy == 0: # pointing left
        draw.polygon([end, (end[0]+10, end[1]-6), (end[0]+10, end[1]+6)], fill=color)
    elif dx == 0 and dy > 0: # pointing down
        draw.polygon([end, (end[0]-6, end[1]-10), (end[0]+6, end[1]-10)], fill=color)
    elif dx == 0 and dy < 0: # pointing up
        draw.polygon([end, (end[0]-6, end[1]+10), (end[0]+6, end[1]+10)], fill=color)

def generate_q78():
    print("Generating Q78 Venn Diagram...")
    # Width 550, Height 320
    img = Image.new("RGBA", (550, 320), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Circle properties
    # Set symmetric 3-set Venn
    r = 85
    cx_a, cy_a = 210, 140 # Employees
    cx_b, cy_b = 340, 140 # Male
    cx_c, cy_c = 275, 215 # German Speakers
    
    # Draw circle outlines
    draw.ellipse([cx_a-r, cy_a-r, cx_a+r, cy_a+r], outline=(0, 0, 0, 255), width=2)
    draw.ellipse([cx_b-r, cy_b-r, cx_b+r, cy_b+r], outline=(0, 0, 0, 255), width=2)
    draw.ellipse([cx_c-r, cy_c-r, cx_c+r, cy_c+r], outline=(0, 0, 0, 255), width=2)
    
    # Add numbers inside overlaps
    # A only = 54
    draw.text((150, 120), "54", fill=(0, 0, 0, 255), align="center")
    # B only = 43
    draw.text((380, 120), "43", fill=(0, 0, 0, 255), align="center")
    # C only = 15
    draw.text((270, 260), "15", fill=(0, 0, 0, 255), align="center")
    # A-B overlap = 25
    draw.text((270, 95), "25", fill=(0, 0, 0, 255), align="center")
    # A-C overlap = 28
    draw.text((215, 190), "28", fill=(0, 0, 0, 255), align="center")
    # B-C overlap = 26
    draw.text((320, 190), "26", fill=(0, 0, 0, 255), align="center")
    # A-B-C overlap = 17
    draw.text((270, 155), "17", fill=(0, 0, 0, 255), align="center")
    
    # Draw labels
    draw.text((45, 45), "Employees", fill=(0, 0, 0, 255))
    draw_arrow(draw, (125, 52), (180, 52))
    
    draw.text((285, 18), "Male", fill=(0, 0, 0, 255))
    draw_arrow(draw, (360, 20), (360, 50))
    
    draw.text((375, 275), "German Speakers", fill=(0, 0, 0, 255))
    draw_arrow(draw, (365, 283), (320, 283))
    
    return img

def generate_q71():
    print("Generating Q71 Venn Diagram...")
    # Width 550, Height 320
    img = Image.new("RGBA", (550, 320), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Circle properties
    r = 85
    cx_a, cy_a = 210, 130 # Teachers
    cx_b, cy_b = 340, 130 # Dentists
    cx_c, cy_c = 275, 205 # Surgeons
    
    # Draw circle outlines
    draw.ellipse([cx_a-r, cy_a-r, cx_a+r, cy_a+r], outline=(0, 0, 0, 255), width=2)
    draw.ellipse([cx_b-r, cy_b-r, cx_b+r, cy_b+r], outline=(0, 0, 0, 255), width=2)
    draw.ellipse([cx_c-r, cy_c-r, cx_c+r, cy_c+r], outline=(0, 0, 0, 255), width=2)
    
    # Add numbers inside overlaps
    # A only = 14
    draw.text((150, 110), "14", fill=(0, 0, 0, 255))
    # B only = 31
    draw.text((380, 110), "31", fill=(0, 0, 0, 255))
    # C only = 5
    draw.text((270, 250), "5", fill=(0, 0, 0, 255))
    # A-B overlap = 29
    draw.text((270, 85), "29", fill=(0, 0, 0, 255))
    # A-C overlap = 16
    draw.text((215, 180), "16", fill=(0, 0, 0, 255))
    # B-C overlap = 10
    draw.text((320, 180), "10", fill=(0, 0, 0, 255))
    # A-B-C overlap = 23
    draw.text((270, 145), "23", fill=(0, 0, 0, 255))
    
    # Draw labels (simple text labels on the outside sides)
    draw.text((45, 120), "Teachers", fill=(0, 0, 0, 255))
    draw.text((435, 120), "Dentists", fill=(0, 0, 0, 255))
    draw.text((245, 295), "Surgeons", fill=(0, 0, 0, 255))
    
    return img

def main():
    img78 = generate_q78()
    img71 = generate_q71()
    
    # Save target paths
    paths78 = [
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\backend\\uploads\\images\\rrb_ntpc_cbt1_test1_q78.png",
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\backend\\uploads\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test1_q78.png",
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images\\rrb_ntpc_cbt1_test1_q78.png",
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test1_q78.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\backend\\uploads\\images\\rrb_ntpc_cbt1_test1_q78.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\backend\\uploads\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test1_q78.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\images\\rrb_ntpc_cbt1_test1_q78.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test1_q78.png"
    ]
    
    paths71 = [
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\backend\\uploads\\images\\rrb_ntpc_cbt1_test2_q71.png",
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\backend\\uploads\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test2_q71.png",
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images\\rrb_ntpc_cbt1_test2_q71.png",
      "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test2_q71.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\backend\\uploads\\images\\rrb_ntpc_cbt1_test2_q71.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\backend\\uploads\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test2_q71.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\images\\rrb_ntpc_cbt1_test2_q71.png",
      "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\images\\sbi_po_prelims\\rrb_ntpc_cbt1_test2_q71.png"
    ]
    
    for p in paths78:
        # Create directories if they do not exist
        os.makedirs(os.path.dirname(p), exist_ok=True)
        img78.save(p)
        print(f"Saved: {p}")
        
    for p in paths71:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        img71.save(p)
        print(f"Saved: {p}")
        
    print("\nAll clean images generated and copied successfully!")

if __name__ == "__main__":
    main()
