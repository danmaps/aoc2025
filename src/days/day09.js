export default {
  title: 'Day 9: Movie Theater',
  description: 'Find the largest rectangle using two red tiles as opposite corners.',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 9: Movie Theater ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/9" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>Paste your list of red tile coordinates (x,y per line) and reveal the largest rectangle area.</p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day09-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
          ></textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day09-visualize" class="btn" style="margin-right: 0.5rem;">[Visualize]</button>
            <button id="day09-reveal" class="btn" style="margin-right: 0.5rem;">[Reveal Solution]</button>
          </div>
        </div>

        <div id="day09-results" style="margin-top:1rem;"></div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day09-input');
    const visualizeBtn = document.getElementById('day09-visualize');
    const revealBtn = document.getElementById('day09-reveal');
    const resultsEl = document.getElementById('day09-results');

    // Parse "x,y" lines into point objects
    function parseTiles(text) {
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const [x, y] = line.split(',').map(Number);
          return { x, y };
        });
    }

    // Area of the axis-aligned rectangle in grid cells
    function rectArea(a, b) {
      return (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1);
    }

    // Brute force all pairs, return max area and corners
    function solve(text) {
      const tiles = parseTiles(text);
      if (tiles.length < 2) return { max: 0, a: null, b: null };

      let max = 0;
      let bestA = null;
      let bestB = null;

      for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
          const area = rectArea(tiles[i], tiles[j]);
          if (area > max) {
            max = area;
            bestA = tiles[i];
            bestB = tiles[j];
          }
        }
      }
      return { max, a: bestA, b: bestB };
    }

    visualizeBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      resultsEl.innerHTML = '<p style="color:#cccccc;">Visualization coming soon...</p>';
    });

    revealBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      const { max, a, b } = solve(input);

      if (max === 0 || !a || !b) {
        resultsEl.innerHTML = '<p style="color:#ff6666;">No valid rectangles found.</p>';
        return;
      }

      resultsEl.innerHTML = `
        <p style="color:#cccccc;">
          Largest rectangle area: <span style="color:#00ff00;">${max}</span>
        </p>
        <p style="color:#888888;">
          Opposite corners at:
          (<span style="color:#00ccff;">${a.x}</span>, <span style="color:#00ccff;">${a.y}</span>) and
          (<span style="color:#00ccff;">${b.x}</span>, <span style="color:#00ccff;">${b.y}</span>)
        </p>
      `;
    });
  }
};