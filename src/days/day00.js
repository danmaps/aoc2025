export default {
  title: 'Home',
  description: 'Welcome and overview',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>Welcome</h2>
        <p>
          <a href="https://adventofcode.com" target="_blank">Advent of Code</a> is an annual programming event with daily puzzles released each December. Each puzzle has two parts, often building on the same input, and invites creative solutions across any language.
        </p>
        <p>
          This site hosts Danny McVey's solutions, visualizations, and notes for <a href="https://adventofcode.com/2025" target="_blank">Advent of Code 2025</a>. The goal is clarity, reproducibility, and a bit of fun with lightweight visualizations.
        </p>
        <h3>Get Started</h3>
        <p>Use the calendar to select a day. Days 1 and 2 are currently unlocked.</p>
        <p style="margin-top:1rem; font-size: 0.95rem; color:#999">Source: <a href="https://github.com/danmaps/aoc2025" target="_blank">GitHub</a></p>
      </div>
    `;
  }
};
