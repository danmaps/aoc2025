export default {
  title: 'Day 4: Printing Department',
  description: 'Neighbor heatmap for paper rolls',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 4: Printing Department ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/4" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>
          Find paper rolls (@) that can be accessed by forklifts - those with fewer than 4 neighbors in the 8 adjacent positions.
        </p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day04-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
          ></textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day04-solve" class="btn" style="margin-right: 0.5rem;">[Analyze & Visualize]</button>
            <button id="day04-reveal" class="btn" style="margin-right: 0.5rem;">[Reveal Solution]</button>
            <div style="display: inline-flex; align-items: center; margin-left: 1rem; gap: 0.5rem;">
              <label for="day04-scan-speed" style="color: #00cc00; margin: 0;">Scan Speed:</label>
              <input id="day04-scan-speed" type="range" min="1" max="500" value="100" style="accent-color:#00cc00; width:120px;" />
              <span id="day04-scan-speed-label" style="color:#cccccc;">10.0x</span>
            </div>
          </div>
        </div>

        <div id="day04-results" style="margin-top:1rem;"></div>
        <canvas id="day04-canvas" style="background:#000; border:1px solid #333; margin-top:1rem; display:block; margin-left:auto; margin-right:auto;"></canvas>
        <div id="day04-legend" style="margin-top:1rem; padding:1rem; background:#0a0a0a; border:1px solid #333; font-family:monospace; font-size:12px; color:#fff;"></div>

        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #333;">
          <h3>&gt; Part 2: Iterative Removal Simulation</h3>
          <p>Remove all accessible rolls (< 4 neighbors), then recalculate. Repeat until no more can be removed.</p>
          
          <div style="margin: 1rem 0;">
            <button id="day04-part2-start" class="btn" style="margin-right: 0.5rem;">[Start Part 2 Animation]</button>
            <button id="day04-part2-reveal" class="btn" style="margin-right: 0.5rem;">[Reveal Solution]</button>
            <button id="day04-part2-stop" class="btn" style="margin-right: 0.5rem; display:none;">[Stop]</button>
            <div style="display: inline-flex; align-items: center; margin-left: 1rem; gap: 0.5rem;">
              <label for="day04-speed" style="color: #00cc00; margin: 0;">Speed:</label>
              <input id="day04-speed" type="range" min="1" max="500" value="100" style="accent-color:#00cc00; width:120px;" />
              <span id="day04-speed-label" style="color:#cccccc;">10.0x</span>
            </div>
          </div>

          <div id="day04-part2-status" style="margin-top:1rem; padding:1rem; background:#0a0a0a; border:1px solid #00cc00; display:none;">
            <div>Round: <span id="day04-round" style="color:#ffff00; font-family:monospace;">0</span></div>
            <div>Removed this round: <span id="day04-removed-round" style="color:#ff6666; font-family:monospace;">0</span></div>
            <div>Total removed: <span id="day04-total-removed" style="color:#7cf6ff; font-size:1.2rem; font-family:monospace;">0</span></div>
          </div>
        </div>

        <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #333;">
          <h3>&gt; How This Works</h3>
          
          <div style="margin-top: 1.5rem;">
            <h4 style="color: #00cc00; margin-top: 1rem; margin-bottom: 0.5rem;">Part 1: Neighbor Counting</h4>
            <p>Each paper roll (@) is checked against its 8 adjacent neighbors (orthogonal + diagonal). Rolls with fewer than 4 neighbors are considered "accessible".</p>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">const directions = [</div>
              <div style="color: #aaa;">&nbsp;&nbsp;[-1, -1], [-1, 0], [-1, 1],</div>
              <div style="color: #aaa;">&nbsp;&nbsp;[0, -1],&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[0, 1],</div>
              <div style="color: #aaa;">&nbsp;&nbsp;[1, -1],&nbsp;&nbsp;[1, 0],&nbsp;&nbsp;[1, 1]</div>
              <div style="color: #aaa;">];</div>
              <div style="margin-top: 0.5rem; color: #aaa;">for (const [dr, dc] of directions) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;const nr = r + dr, nc = c + dc;</div>
              <div style="color: #aaa;">&nbsp;&nbsp;if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;if (grid[nr][nc] === '@') count++;</div>
              <div style="color: #aaa;">}</div>
            </div>
            <p style="font-size: 12px; color: #bbb;">The visualization colors each cell by neighbor count: green (0) → orange (3) → dark red (8). Cells marked with ✓ are accessible.</p>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="color: #00cc00; margin-top: 1rem; margin-bottom: 0.5rem;">Part 2: Iterative Removal</h4>
            <p>Accessible rolls are removed one round at a time. After each removal, neighbor counts recalculate only for adjacent cells. This process repeats until no accessible rolls remain.</p>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">while (true) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;const accessible = [];</div>
              <div style="color: #aaa;">&nbsp;&nbsp;for (const key of neighborMap.keys()) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;if (neighborMap.get(key) &lt; 4)</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;accessible.push(...);</div>
              <div style="color: #aaa;">&nbsp;&nbsp;}</div>
              <div style="color: #aaa;">&nbsp;&nbsp;if (accessible.length === 0) break;</div>
              <div style="color: #aaa;"></div>
              <div style="color: #aaa;">&nbsp;&nbsp;for (const {r, c} of accessible) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;grid[r][c] = '.';</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;for (const [dr, dc] of directions) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;const neighborKey = \`\${nr},\${nc}\`;</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;neighborMap.set(neighborKey,</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;neighborMap.get(neighborKey) - 1);</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;}</div>
              <div style="color: #aaa;">&nbsp;&nbsp;}</div>
              <div style="color: #aaa;">}</div>
            </div>
            <p style="font-size: 12px; color: #bbb;"><strong>Optimization:</strong> Neighbor counts are cached in a Map for O(1) lookup. When rolls are removed, only adjacent cells have their counts decremented—this avoids recalculating the entire grid each round.</p>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="color: #00cc00; margin-top: 1rem; margin-bottom: 0.5rem;">Visualization Features</h4>
            <ul style="font-size: 12px; color: #bbb; margin-left: 1rem;">
              <li><strong>Part 1 Animation:</strong> Scans each cell (white highlight) → checks neighbors (cyan) → applies color by count</li>
              <li><strong>Part 2 Animation:</strong> Highlights all accessible rolls (red) → fades them out → removes from grid → updates neighbor counts</li>
              <li><strong>Speed Sliders:</strong> Control animation playback from 0.1x (slow motion) to 50x (fast-forward)</li>
              <li><strong>Reveal Buttons:</strong> Skip animation and show instant results</li>
              <li><strong>Dynamic Scaling:</strong> Canvas automatically sizes to fit grids up to 200+ columns while keeping all cells visible</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day04-input');
    const solveBtn = document.getElementById('day04-solve');
    const revealBtn = document.getElementById('day04-reveal');
    const resultsEl = document.getElementById('day04-results');
    const part2StartBtn = document.getElementById('day04-part2-start');
    const part2RevealBtn = document.getElementById('day04-part2-reveal');
    const part2StopBtn = document.getElementById('day04-part2-stop');
    const speedSlider = document.getElementById('day04-speed');
    const speedLabel = document.getElementById('day04-speed-label');
    const scanSpeedSlider = document.getElementById('day04-scan-speed');
    const scanSpeedLabel = document.getElementById('day04-scan-speed-label');

    // Set default example input
    const defaultInput = `..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.`;
    inputEl.value = defaultInput;

    let globalSpeed = 10;
    let scanSpeed = 10;
    let animationState = null;
    
    // Create getter functions for dynamic speed
    const getScanSpeed = () => scanSpeed;
    const getGlobalSpeed = () => globalSpeed;

    // Scan speed slider
    scanSpeedSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      scanSpeed = val / 10;
      scanSpeedLabel.textContent = scanSpeed.toFixed(1) + 'x';
    });

    // Part 2 speed slider
    speedSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      globalSpeed = val / 10;
      speedLabel.textContent = globalSpeed.toFixed(1) + 'x';
    });
    speedLabel.textContent = '10.0x';

    const analyzeInput = async () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const result = solveDay04(input);
        
        // Initialize visualization with white blocks
        animationState = initDay04Visualization(result.grid, null);
        
        // Animate neighbor counting
        await animateNeighborCounting(result.grid, animationState, getScanSpeed);
        
        resultsEl.innerHTML = `
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px;">
            <h3>Part 1: Accessible Rolls</h3>
            <p style="font-size:1.2rem;"><strong>${result.part1}</strong> rolls can be accessed (fewer than 4 neighbors)</p>
          </div>
        `;
      } catch (err) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      }
    };

    part2StartBtn.addEventListener('click', async () => {
      const input = inputEl.value.trim();
      if (!input) return;
      
      if (!animationState) {
        resultsEl.innerHTML += '<p style="color:orange;">Please click "Analyze & Visualize" first.</p>';
        return;
      }
      
      // Wait for animation to be ready
      if (!animationState.ready) {
        resultsEl.innerHTML += '<p style="color:orange;">Please click "Analyze & Visualize" first.</p>';
        return;
      }

      part2StartBtn.style.display = 'none';
      part2StopBtn.style.display = 'inline-block';

      try {
        const result = await solveDay04Part2(input, animationState, getGlobalSpeed);
        
        // Update results
        const currentResults = resultsEl.innerHTML;
        resultsEl.innerHTML = currentResults + `
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px; margin-top:1rem;">
            <h3>Part 2: Total Removed</h3>
            <p style="font-size:1.2rem;"><strong>${result.totalRemoved}</strong> rolls removed in ${result.rounds} rounds</p>
          </div>
        `;
      } catch (err) {
        if (err.message !== 'STOPPED') {
          resultsEl.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
        }
      } finally {
        part2StartBtn.style.display = 'inline-block';
        part2StopBtn.style.display = 'none';
      }
    });

    part2StopBtn.addEventListener('click', () => {
      if (animationState && animationState.stopAnimation) {
        animationState.stopAnimation();
      }
      part2StartBtn.style.display = 'inline-block';
      part2StopBtn.style.display = 'none';
    });

    solveBtn.addEventListener('click', analyzeInput);

    revealBtn.addEventListener('click', async () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const result = solveDay04(input);
        animationState = initDay04Visualization(result.grid, result.neighborCounts);
        
        // Update the color counts and legend
        const colorCounts = {};
        for (let i = 0; i <= 8; i++) {
          colorCounts[i] = 0;
        }
        
        for (let r = 0; r < result.rows; r++) {
          for (let c = 0; c < result.cols; c++) {
            if (result.grid[r][c] === '@') {
              const neighbors = result.neighborCounts[r][c];
              colorCounts[neighbors] = (colorCounts[neighbors] || 0) + 1;
            }
          }
        }
        
        animationState.colorCounts = colorCounts;
        animationState.updateLegend();
        
        resultsEl.innerHTML = `
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px;">
            <h3>Part 1: Accessible Rolls</h3>
            <p style="font-size:1.2rem;"><strong>${result.part1}</strong> rolls can be accessed (fewer than 4 neighbors)</p>
          </div>
        `;
      } catch (err) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      }
    });

    part2RevealBtn.addEventListener('click', async () => {
      const input = inputEl.value.trim();
      if (!input) return;
      
      if (!animationState) {
        resultsEl.innerHTML += '<p style="color:orange;">Please click "Analyze & Visualize" or "Reveal Solution" first.</p>';
        return;
      }

      try {
        const result = await solveDay04Part2(input, animationState, () => Infinity);
        
        const currentResults = resultsEl.innerHTML;
        resultsEl.innerHTML = currentResults + `
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px; margin-top:1rem;">
            <h3>Part 2: Total Removed</h3>
            <p style="font-size:1.2rem;"><strong>${result.totalRemoved}</strong> rolls removed in ${result.rounds} rounds</p>
          </div>
        `;
      } catch (err) {
        if (err.message !== 'STOPPED') {
          resultsEl.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
        }
      }
    });

    // Auto-analyze on load
    analyzeInput();
  }
};

function solveDay04(input) {
  const lines = input.trim().split('\n');
  const grid = lines.map(line => line.split(''));
  const rows = grid.length;
  const cols = grid[0].length;

  // Count neighbors for each cell
  const neighborCounts = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '@') {
        let count = 0;
        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '@') {
            count++;
          }
        }
        neighborCounts[r][c] = count;
      }
    }
  }

  // Count accessible rolls (< 4 neighbors)
  let part1 = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '@' && neighborCounts[r][c] < 4) {
        part1++;
      }
    }
  }

  return { part1, grid, neighborCounts, rows, cols };
}

function initDay04Visualization(grid, neighborCounts) {
  const canvas = document.getElementById('day04-canvas');
  const legendEl = document.getElementById('day04-legend');
  const ctx = canvas.getContext('2d');
  
  // Calculate cell size to fit all cells in 1200px width, min 2px per cell
  const cols = grid[0].length;
  const rows = grid.length;
  const maxWidth = 1200;
  let cellSize = Math.max(2, Math.floor(maxWidth / cols));
  
  const state = {
    canvas,
    ctx,
    blocks: new Map(),
    colorMap: null,
    rows,
    cols,
    cellSize,
    ready: true,
    updateLegend: null,
    colorCounts: {}
  };

  // Color mapping for neighbor counts (0-8)
  const colorMap = {
    0: '#00ff00',  // Green
    1: '#7fff00',  // Chartreuse
    2: '#ffff00',  // Yellow
    3: '#ffaa00',  // Orange
    4: '#ff6600',  // Dark orange
    5: '#ff3300',  // Red-orange
    6: '#ff0000',  // Red
    7: '#cc0000',  // Dark red
    8: '#990000'   // Darkest red
  };
  state.colorMap = colorMap;
  
  const colorCounts = {};
  state.colorCounts = colorCounts;

  // Initialize blocks map
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (grid[r][c] === '@') {
        let color = '#cccccc'; // Gray/white
        if (neighborCounts) {
          const neighbors = neighborCounts[r][c];
          color = colorMap[neighbors];
          colorCounts[neighbors] = (colorCounts[neighbors] || 0) + 1;
        }
        state.blocks.set(`${r},${c}`, { row: r, col: c, color, neighbors: neighborCounts ? neighborCounts[r][c] : -1 });
      }
    }
  }

  // Update legend
  const updateLegend = () => {
    let legendHTML = '<div style="font-weight:bold; margin-bottom:0.5rem;">Neighbor Count</div>';
    for (let i = 0; i <= 8; i++) {
      const count = colorCounts[i] || 0;
      const color = colorMap[i];
      const accessible = i < 4 ? ' ✓' : '';
      legendHTML += `<div style="margin-bottom:0.25rem;"><span style="display:inline-block; width:15px; height:15px; background:${color}; border:1px solid #666; margin-right:0.5rem;"></span>${i} neighbors: ${count}${accessible}</div>`;
    }
    legendEl.innerHTML = legendHTML;
  };
  
  if (neighborCounts) {
    updateLegend();
  } else {
    legendEl.innerHTML = '<div style="font-weight:bold;">Analyzing...</div>';
  }
  
  state.updateLegend = updateLegend;

  // Set canvas size
  canvas.width = state.cols * state.cellSize;
  canvas.height = state.rows * state.cellSize;
  
  // Draw function
  const draw = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid and blocks
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (grid[r][c] !== '@') continue;
        
        const block = state.blocks.get(`${r},${c}`);
        if (!block) continue;
        
        const x = c * state.cellSize + state.cellSize / 2;
        const y = r * state.cellSize + state.cellSize / 2;
        const radius = (state.cellSize - 2) / 2;
        
        ctx.fillStyle = block.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  
  state.draw = draw;
  draw();
  
  return state;
}

async function animateNeighborCounting(grid, animationState, getSpeed) {
  const rows = grid.length;
  const cols = grid[0].length;
  
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  const colorMap = animationState.colorMap;
  const colorCounts = animationState.colorCounts;
  
  // Reset color counts
  for (let i = 0; i <= 8; i++) {
    colorCounts[i] = 0;
  }
  
  // Scan through each block
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '@') continue;
      
      const key = `${r},${c}`;
      const block = animationState.blocks.get(key);
      if (!block) continue;
      
      // Highlight current block being analyzed (white)
      const originalColor = block.color;
      block.color = '#ffffff';
      animationState.draw();
      
      await new Promise(resolve => setTimeout(resolve, 5 / getSpeed()));
      
      // Count neighbors
      let neighborCount = 0;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '@') {
          neighborCount++;
          // Highlight neighbor in cyan
          const neighborKey = `${nr},${nc}`;
          const neighborBlock = animationState.blocks.get(neighborKey);
          if (neighborBlock) {
            neighborBlock.color = '#00ffff';
          }
        }
      }
      
      animationState.draw();
      await new Promise(resolve => setTimeout(resolve, 10 / getSpeed()));
      
      // Set final color based on neighbor count
      block.color = colorMap[neighborCount];
      block.neighbors = neighborCount;
      colorCounts[neighborCount] = (colorCounts[neighborCount] || 0) + 1;
      animationState.updateLegend();
      
      // Reset neighbor highlights
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '@') {
          const neighborKey = `${nr},${nc}`;
          const neighborBlock = animationState.blocks.get(neighborKey);
          if (neighborBlock && neighborBlock.color === '#00ffff') {
            neighborBlock.color = colorMap[neighborBlock.neighbors];
          }
        }
      }
      
      animationState.draw();
      await new Promise(resolve => setTimeout(resolve, 2 / getSpeed()));
    }
  }
}

async function solveDay04Part2(input, animationState, getSpeed) {
  const lines = input.trim().split('\n');
  const grid = lines.map(line => line.split(''));
  const rows = grid.length;
  const cols = grid[0].length;
  
  const statusEl = document.getElementById('day04-part2-status');
  const roundEl = document.getElementById('day04-round');
  const removedRoundEl = document.getElementById('day04-removed-round');
  const totalRemovedEl = document.getElementById('day04-total-removed');
  
  statusEl.style.display = 'block';
  
  let stopped = false;
  animationState.stopAnimation = () => { stopped = true; };
  
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  const countNeighbors = (r, c) => {
    let count = 0;
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '@') {
        count++;
      }
    }
    return count;
  };
  
  // Pre-compute initial neighbor counts for faster lookups
  const neighborMap = new Map();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '@') {
        neighborMap.set(`${r},${c}`, countNeighbors(r, c));
      }
    }
  }
  
  let totalRemoved = 0;
  let round = 0;
  
  while (true) {
    if (stopped) throw new Error('STOPPED');
    
    round++;
    roundEl.textContent = round;
    
    // Find accessible rolls using cached neighbor counts
    const accessible = [];
    for (const key of neighborMap.keys()) {
      if (neighborMap.get(key) < 4) {
        const [r, c] = key.split(',').map(Number);
        accessible.push({ r, c });
      }
    }
    
    if (accessible.length === 0) break;
    
    removedRoundEl.textContent = accessible.length;
    totalRemoved += accessible.length;
    totalRemovedEl.textContent = totalRemoved;
    
    // Batch highlight all removals first
    for (const {r, c} of accessible) {
      const block = animationState.blocks.get(`${r},${c}`);
      if (block) {
        block.color = '#ff0000';
      }
    }
    animationState.draw();
    
    await new Promise(resolve => setTimeout(resolve, 10 / getSpeed()));
    
    // Batch fade out and remove
    const ctx = animationState.ctx;
    for (let i = 0; i <= 10; i++) {
      const alpha = 1 - (i / 10);
      ctx.globalAlpha = alpha;
      animationState.draw();
      await new Promise(resolve => setTimeout(resolve, 3 / getSpeed()));
    }
    ctx.globalAlpha = 1;
    
    // Remove from grid and update neighbor counts
    for (const {r, c} of accessible) {
      const key = `${r},${c}`;
      animationState.blocks.delete(key);
      grid[r][c] = '.';
      neighborMap.delete(key);
      
      // Update neighbor counts for adjacent cells
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        const neighborKey = `${nr},${nc}`;
        if (neighborMap.has(neighborKey)) {
          neighborMap.set(neighborKey, neighborMap.get(neighborKey) - 1);
        }
      }
    }
    
    animationState.draw();
    
    // Pause between rounds
    await new Promise(resolve => setTimeout(resolve, 50 / getSpeed()));
  }
  
  animationState.stopAnimation = null;
  return { totalRemoved, rounds: round - 1 };
}
