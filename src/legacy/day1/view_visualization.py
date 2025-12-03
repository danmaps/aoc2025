"""
Simple viewer to display the generated visualizations.
"""
from PIL import Image
import os

def view_images():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # View static image
    static_path = os.path.join(script_dir, 'dial_static.png')
    if os.path.exists(static_path):
        print("Opening static visualization...")
        img = Image.open(static_path)
        img.show()
    
    # View animation
    anim_path = os.path.join(script_dir, 'dial_animation.gif')
    if os.path.exists(anim_path):
        print("Opening animation...")
        img = Image.open(anim_path)
        img.show()

if __name__ == '__main__':
    view_images()
