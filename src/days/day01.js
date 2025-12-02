export default {
  title: '--- Day 1: Secret Entrance ---',
  description: 'Simulate a circular dial and count events at or through 0.',
  stars: '★★',
  unlocked: true,
  solvePart1(input) {
    return 'See Python solution output';
  },
  solvePart2(input) {
    return 'See Python solution output';
  },
  render() {
    return `
      <div class="article">
        <h2>--- Day 1: Secret Entrance ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/1" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>This puzzle involves simulating a <em>circular dial</em> with <em>10 positions</em> (0-9) and tracking when it passes through <em>position 0</em>.</p>
        
        <h3 style="margin-top: 1rem;">Dial Visualization</h3>
        <img src="./assets/dial_animation.gif" alt="Animated Dial" style="max-width: 100%; border: 1px solid #00cc00;" />
        
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #333;">
          <h3>&gt; How This Works</h3>
          <div style="margin: 1rem 0;">
            <strong>Part 1: Count Rotations Ending at 0</strong>
            <p style="margin: 0.5rem 0; color: #cccccc;">
              Starting at <em>position 0</em>, apply each rotation. Count how many rotations <em>end with the dial at position 0</em>.
            </p>
            <div class="code-block" style="font-size: 12px;">
<pre>def simulate_dial(rotations):
    position = 0
    count = 0
    for rotation in rotations:
        position = (position + rotation) % 10
        if position == 0:
            count += 1
    return count

# Example: rotations = [3, -2, 7]
# Start: 0 → +3 → 3 (not 0)
#        3 → -2 → 1 (not 0)
#        1 → +7 → 8 (not 0)
# Answer: 0 rotations ended at 0</pre>
            </div>
          </div>
          <div style="margin: 1rem 0;">
            <strong>Part 2: Count All Clicks Through 0</strong>
            <p style="margin: 0.5rem 0; color: #cccccc;">
              Count <em>every single click</em> that passes through <em>position 0</em> during rotation, not just the ending position.
            </p>
            <div class="code-block" style="font-size: 12px;">
<pre>def simulate_dial_with_clicks(rotations):
    position = 0
    clicks = 0
    for rotation in rotations:
        # Step through each click
        step = 1 if rotation > 0 else -1
        for _ in range(abs(rotation)):
            position = (position + step) % 10
            if position == 0:
                clicks += 1
    return clicks

# Example: rotations = [3, -2, 7]
# Start: 0 → +1 → 1, +1 → 2, +1 → 3 (0 clicks)
#        3 → -1 → 2, -1 → 1 (0 clicks)
#        1 → +1 → 2,...,+1 → 8 (0 clicks)
# Answer: 0 total clicks through 0</pre>
            </div>
          </div>
        </div>

        <h3 style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #333;">Solutions (Python)</h3>
        <p style="font-size: 0.95rem;">
          <a href="https://github.com/danmaps/aoc2025/blob/053cd76e3bf6e14f175d747d9ca5bba05188ab73/day1/solution.py" target="_blank">Part 1 (solution.py)</a> | 
          <a href="https://github.com/danmaps/aoc2025/blob/38bb24c649c4cb6ba4426b45f39f3f056877477b/day1/solution2.py" target="_blank">Part 2 (solution2.py)</a>
        </p>
      </div>
    `;
  }
};
