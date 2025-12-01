import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.animation import FuncAnimation
import numpy as np
from pathlib import Path

def parse_input(filename):
    """Parse the input file and return list of rotations."""
    rotations = []
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                direction = line[0]
                distance = int(line[1:])
                rotations.append((direction, distance))
    return rotations

def simulate_dial_with_clicks(rotations, start_position=50):
    """Simulate the dial rotations counting ALL clicks through 0."""
    position = start_position
    positions = [position]
    zero_count = 0
    
    print(f"The dial starts by pointing at {position}.")
    
    for direction, distance in rotations:
        # Count zeros during rotation
        clicks_through_zero = 0
        
        if direction == 'L':
            # Moving left (toward lower numbers)
            for i in range(1, distance + 1):
                current_pos = (position - i) % 100
                if current_pos == 0:
                    clicks_through_zero += 1
            position = (position - distance) % 100
        else:  # direction == 'R'
            # Moving right (toward higher numbers)
            for i in range(1, distance + 1):
                current_pos = (position + i) % 100
                if current_pos == 0:
                    clicks_through_zero += 1
            position = (position + distance) % 100
        
        positions.append(position)
        zero_count += clicks_through_zero
        
        if clicks_through_zero > 0:
            print(f"The dial is rotated {direction}{distance} to point at {position}; during this rotation, it points at 0 {clicks_through_zero} time(s).")
        else:
            print(f"The dial is rotated {direction}{distance} to point at {position}.")
    
    print(f"\nThe dial points at 0 a total of {zero_count} times (including during rotations).")
    print(f"Password: {zero_count}")
    
    return positions, zero_count

def create_dial_visualization(positions, rotations, zero_count):
    """Create an animated visualization of the dial."""
    fig, (ax_dial, ax_info) = plt.subplots(1, 2, figsize=(14, 7))
    
    # Setup dial subplot
    ax_dial.set_xlim(-1.5, 1.5)
    ax_dial.set_ylim(-1.5, 1.5)
    ax_dial.set_aspect('equal')
    ax_dial.axis('off')
    ax_dial.set_title('Safe Dial - Part 2 (Method 0x434C49434B)', fontsize=16, fontweight='bold')
    
    # Draw dial circle
    circle = plt.Circle((0, 0), 1, fill=False, color='black', linewidth=3)
    ax_dial.add_patch(circle)
    
    # Draw tick marks and numbers
    for i in range(100):
        angle = np.pi/2 - (i / 100) * 2 * np.pi
        x1 = 0.95 * np.cos(angle)
        y1 = 0.95 * np.sin(angle)
        
        # Major tick every 10
        if i % 10 == 0:
            x2 = 1.05 * np.cos(angle)
            y2 = 1.05 * np.sin(angle)
            ax_dial.plot([x1, x2], [y1, y2], 'k-', linewidth=2)
            
            # Add number label
            x3 = 1.2 * np.cos(angle)
            y3 = 1.2 * np.sin(angle)
            ax_dial.text(x3, y3, str(i), ha='center', va='center', fontsize=10, fontweight='bold')
        # Minor tick every 5
        elif i % 5 == 0:
            x2 = 1.0 * np.cos(angle)
            y2 = 1.0 * np.sin(angle)
            ax_dial.plot([x1, x2], [y1, y2], 'k-', linewidth=1)
    
    # Highlight 0 position
    angle_0 = np.pi/2
    x0 = 1.2 * np.cos(angle_0)
    y0 = 1.2 * np.sin(angle_0)
    ax_dial.plot(x0, y0, 'ro', markersize=15, markeredgewidth=2, markerfacecolor='red')
    
    # Create arrow pointer (will be updated in animation)
    arrow_patch = None
    
    # Setup info subplot
    ax_info.axis('off')
    info_text = ax_info.text(0.1, 0.9, '', fontsize=12, verticalalignment='top', 
                             family='monospace', wrap=True)
    
    def update(frame):
        nonlocal arrow_patch
        
        position = positions[frame]
        
        # Remove old arrow if it exists
        if arrow_patch is not None:
            arrow_patch.remove()
        
        # Update arrow
        angle = np.pi/2 - (position / 100) * 2 * np.pi
        x = 0.8 * np.cos(angle)
        y = 0.8 * np.sin(angle)
        
        # Create new arrow
        arrow_patch = patches.FancyArrow(0, 0, x, y, width=0.05, head_width=0.15,
                                       head_length=0.1, fc='red', ec='red')
        ax_dial.add_patch(arrow_patch)
        
        # Update info text
        if frame == 0:
            info = f"Step {frame}: Start\n"
            info += f"Position: {position}\n"
            info += f"\nTotal zero count: {zero_count}"
        else:
            direction, distance = rotations[frame - 1]
            info = f"Step {frame}: {direction}{distance}\n"
            info += f"Position: {position}\n"
            info += f"\nTotal zero count: {zero_count}"
        
        info_text.set_text(info)
        
        return arrow_patch, info_text
    
    # Create animation
    anim = FuncAnimation(fig, update, frames=len(positions), 
                        interval=1000, repeat=True, blit=False)
    
    plt.tight_layout()
    return fig, anim

def create_static_visualization(positions, rotations, zero_count):
    """Create a static step-by-step visualization."""
    num_steps = len(positions)
    cols = 5
    rows = (num_steps + cols - 1) // cols
    
    fig, axes = plt.subplots(rows, cols, figsize=(3*cols, 3*rows))
    if rows == 1:
        axes = axes.reshape(1, -1)
    
    for idx, (ax, position) in enumerate(zip(axes.flat, positions)):
        ax.set_xlim(-1.3, 1.3)
        ax.set_ylim(-1.3, 1.3)
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Draw dial
        circle = plt.Circle((0, 0), 1, fill=False, color='black', linewidth=2)
        ax.add_patch(circle)
        
        # Draw key numbers
        for i in [0, 25, 50, 75]:
            angle = np.pi/2 - (i / 100) * 2 * np.pi
            x = 1.15 * np.cos(angle)
            y = 1.15 * np.sin(angle)
            ax.text(x, y, str(i), ha='center', va='center', fontsize=8)
        
        # Highlight 0
        angle_0 = np.pi/2
        x0 = 1.15 * np.cos(angle_0)
        y0 = 1.15 * np.sin(angle_0)
        ax.plot(x0, y0, 'ro', markersize=8)
        
        # Draw arrow
        angle = np.pi/2 - (position / 100) * 2 * np.pi
        x = 0.7 * np.cos(angle)
        y = 0.7 * np.sin(angle)
        ax.arrow(0, 0, x, y, width=0.03, head_width=0.12, 
                head_length=0.08, fc='red', ec='red')
        
        # Title
        if idx == 0:
            title = f"Start: {position}"
        else:
            direction, distance = rotations[idx - 1]
            title = f"{direction}{distance} → {position}"
        
        ax.set_title(title, fontsize=10, fontweight='bold')
    
    # Hide unused subplots
    for idx in range(len(positions), len(axes.flat)):
        axes.flat[idx].axis('off')
    
    plt.suptitle(f'Safe Dial Simulation - Part 2 - Password: {zero_count}', 
                fontsize=16, fontweight='bold', y=0.995)
    plt.tight_layout()
    
    return fig

def main():
    # Parse input
    input_file = Path(__file__).parent / 'input.txt'
    rotations = parse_input(input_file)
    
    print("="*60)
    print("ADVENT OF CODE 2025 - DAY 1 PART 2: SECRET ENTRANCE")
    print("Password Method 0x434C49434B")
    print("="*60)
    print()
    
    # Simulate
    positions, zero_count = simulate_dial_with_clicks(rotations)
    
    print("\n" + "="*60)
    
    # Note: Visualization disabled for Part 2 due to large number of steps
    # The example had only 10 rotations, but the actual input has 800+ rotations
    # which makes visualization impractical
    print("\n(Visualization skipped due to large number of steps)")

if __name__ == '__main__':
    main()
