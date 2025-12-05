export default {
  title: 'Day 12: _____',
  description: 'Coming soon',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 12: _____ ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/12" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>Puzzle description coming soon...</p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day12-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
          ></textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day12-visualize" class="btn" style="margin-right: 0.5rem;">[Visualize]</button>
            <button id="day12-reveal" class="btn" style="margin-right: 0.5rem;">[Reveal Solution]</button>
          </div>
        </div>

        <div id="day12-results" style="margin-top:1rem;"></div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day12-input');
    const visualizeBtn = document.getElementById('day12-visualize');
    const revealBtn = document.getElementById('day12-reveal');
    const resultsEl = document.getElementById('day12-results');

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
      resultsEl.innerHTML = '<p style="color:#cccccc;">Solution coming soon...</p>';
    });
  }
};
