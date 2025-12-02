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
        <p>This puzzle involves simulating a safe dial.</p>
        <h3 style="margin-top: 1rem;">Solutions (python)</h3>
        <p style="font-size: 0.95rem;">
          <a href="https://github.com/danmaps/aoc2025/blob/053cd76e3bf6e14f175d747d9ca5bba05188ab73/day1/solution.py" target="_blank">Part 1 (solution.py)</a> | 
          <a href="https://github.com/danmaps/aoc2025/blob/38bb24c649c4cb6ba4426b45f39f3f056877477b/day1/solution2.py" target="_blank">Part 2 (solution2.py)</a>
        </p>
        <h3 style="margin-top: 1rem;">Dial visualizations:</h3>
        <img src="./assets/dial_static.png" alt="Static Dial" style="max-width: 100%; border: 1px solid #00cc00;" />
        <img src="./assets/dial_animation.gif" alt="Animated Dial" style="max-width: 100%; border: 1px solid #00cc00; margin-top: 0.5rem;" />
        
      </div>
    `;
  }
};
