function parseManifold(input) {
  return input.split('\n');
}

function simulateBeams(grid) {
  // Find starting position
  const startCol = grid[0].indexOf('S');
  if (startCol === -1) return 0;
  
  // Map of column position -> beam count at that position
  let beams = new Map([[startCol, 1]]);
  let splitCount = 0;
  
  for (let i = 0; i < grid.length; i++) {
    const nextBeams = new Map();
    
    for (const [col, count] of beams.entries()) {
      if (grid[i]?.charAt(col) === '.') {
        // Empty space: beam continues straight down
        nextBeams.set(col, (nextBeams.get(col) ?? 0) + count);
      } else {
        // Splitter ('^' or 'S'): beam splits left and right
        nextBeams.set(col - 1, (nextBeams.get(col - 1) ?? 0) + count);
        nextBeams.set(col + 1, (nextBeams.get(col + 1) ?? 0) + count);
        splitCount++;
      }
    }
    
    beams = nextBeams;
  }
  
  return splitCount;
}

function visualizeManifold(grid) {
  // Find starting position
  const startCol = grid[0].indexOf('S');
  if (startCol === -1) return [];
  
  const frames = [];
  let beams = new Map([[startCol, 1]]);
  
  for (let row = 0; row < grid.length; row++) {
    // Create frame showing current state
    const frameLines = grid.map((line, r) => {
      if (r < row) return line; // Past rows unchanged
      if (r === row) {
        // Show current beam positions
        const chars = line.split('');
        for (const [col] of beams.entries()) {
          if (col >= 0 && col < chars.length && (chars[col] === '.' || chars[col] === 'S')) {
            chars[col] = '|';
          }
        }
        return chars.join('');
      }
      return line; // Future rows unchanged
    });
    
    frames.push(frameLines.join('\n'));
    
    // Calculate next beam positions
    const nextBeams = new Map();
    for (const [col, count] of beams.entries()) {
      if (grid[row]?.charAt(col) === '.') {
        nextBeams.set(col, (nextBeams.get(col) ?? 0) + count);
      } else {
        nextBeams.set(col - 1, (nextBeams.get(col - 1) ?? 0) + count);
        nextBeams.set(col + 1, (nextBeams.get(col + 1) ?? 0) + count);
      }
    }
    beams = nextBeams;
  }
  
  return frames;
}

// Part 2: Quantum Tachyon Manifold (count unique timelines/paths)
function countQuantumTimelines(grid) {
  const startCol = grid[0].indexOf('S');
  if (startCol === -1) return 0;
  
  // Track number of unique paths to each column position
  let beams = new Map([[startCol, 1]]);
  
  for (let row = 0; row < grid.length; row++) {
    const nextBeams = new Map();
    
    for (const [col, pathCount] of beams.entries()) {
      if (grid[row]?.charAt(col) === '.') {
        // Continue straight - all paths continue
        nextBeams.set(col, (nextBeams.get(col) ?? 0) + pathCount);
      } else {
        // Split: each path splits into two (quantum superposition)
        nextBeams.set(col - 1, (nextBeams.get(col - 1) ?? 0) + pathCount);
        nextBeams.set(col + 1, (nextBeams.get(col + 1) ?? 0) + pathCount);
      }
    }
    
    beams = nextBeams;
  }
  
  // Sum all unique timelines (paths that reached each endpoint)
  let totalTimelines = 0;
  for (const count of beams.values()) {
    totalTimelines += count;
  }
  
  return totalTimelines;
}

function visualizeQuantumTimelines(grid) {
  const startCol = grid[0].indexOf('S');
  if (startCol === -1) return [];
  
  const frames = [];
  let beams = new Map([[startCol, 1]]);
  
  for (let row = 0; row < grid.length; row++) {
    // Calculate total timelines at this step
    let totalTimelines = 0;
    for (const count of beams.values()) {
      totalTimelines += count;
    }
    
    // Create frame showing all quantum beam positions with their counts
    const frameLines = grid.map((line, r) => {
      if (r === row) {
        const chars = line.split('');
        for (const [col, count] of beams.entries()) {
          if (col >= 0 && col < chars.length && (chars[col] === '.' || chars[col] === 'S')) {
            // Show the beam, and if count > 1, show a marker
            chars[col] = count > 9 ? '*' : (count > 1 ? String(count) : '|');
          }
        }
        return chars.join('');
      }
      return line;
    });
    
    frames.push({
      grid: frameLines.join('\n'),
      timelineCount: totalTimelines,
      positionCount: beams.size
    });
    
    // Calculate next positions (quantum split doubles the timelines)
    const nextBeams = new Map();
    for (const [col, pathCount] of beams.entries()) {
      if (grid[row]?.charAt(col) === '.') {
        nextBeams.set(col, (nextBeams.get(col) ?? 0) + pathCount);
      } else {
        nextBeams.set(col - 1, (nextBeams.get(col - 1) ?? 0) + pathCount);
        nextBeams.set(col + 1, (nextBeams.get(col + 1) ?? 0) + pathCount);
      }
    }
    beams = nextBeams;
  }
  
  return frames;
}

const EXAMPLE_INPUT = `.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`;

export default {
  title: 'Day 7: Laboratories',
  description: 'Tachyon Manifold Beam Splitting',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 7: Laboratories ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/7" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>Analyze the tachyon manifold to count beam splits. Beams move downward from S, and split left/right when hitting ^.</p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day07-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
          ></textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day07-visualize" class="btn" style="margin-right: 0.5rem;">[Visualize Part 1]</button>
            <button id="day07-part2" class="btn" style="margin-right: 0.5rem;">[Visualize Part 2 - Quantum]</button>
            <button id="day07-reveal" class="btn">[Reveal Solutions]</button>
          </div>
        </div>

        <div id="day07-results" style="margin-top:1rem;"></div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day07-input');
    const visualizeBtn = document.getElementById('day07-visualize');
    const revealBtn = document.getElementById('day07-reveal');
    const part2Btn = document.getElementById('day07-part2');
    const resultsEl = document.getElementById('day07-results');

    // Populate input with example
    inputEl.value = EXAMPLE_INPUT;

    // Auto-visualize example on load
    const exampleGrid = parseManifold(EXAMPLE_INPUT);
    const exampleFrames = visualizeManifold(exampleGrid);
    const exampleSplitCount = simulateBeams(exampleGrid);
    
    let currentFrame = 0;
    const displayFrame = () => {
      if (currentFrame < exampleFrames.length) {
        resultsEl.innerHTML = `
          <div style="margin-top: 1rem;">
            <p style="color: #00cc00;">Part 1: Step ${currentFrame + 1}/${exampleFrames.length}</p>
            <pre style="background: #0a0a0a; color: #00cc00; padding: 1rem; font-size: 14px; overflow-x: auto;">${exampleFrames[currentFrame]}</pre>
          </div>
        `;
        currentFrame++;
        setTimeout(displayFrame, 300);
      } else {
        resultsEl.innerHTML += `
          <div style="margin-top: 1rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">
            <p style="color: #00cc00;">Part 1 Animation complete!</p>
            <p style="color: #ffff00; font-size: 20px; font-weight: bold;">Solution: ${exampleSplitCount}</p>
            <p style="color: #999;">total splits</p>
          </div>
        `;
      }
    };
    displayFrame();

    part2Btn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const grid = parseManifold(input);
      const frames = visualizeQuantumTimelines(grid);
      const totalTimelines = countQuantumTimelines(grid);
      
      let currentFrame = 0;
      const displayFrame = () => {
        if (currentFrame < frames.length) {
          const frame = frames[currentFrame];
          resultsEl.innerHTML = `
            <div style="margin-top: 1rem;">
              <p style="color: #00cc00;">Part 2 - Quantum Manifold: Step ${currentFrame + 1}/${frames.length}</p>
              <p style="color: #ffff00;">Active Timelines: ${frame.timelineCount} | Positions: ${frame.positionCount}</p>
              <pre style="background: #0a0a0a; color: #00cc00; padding: 1rem; font-size: 14px; overflow-x: auto; line-height: 1.4;">${frame.grid}</pre>
              <p style="color: #999; font-size: 12px; margin-top: 0.5rem;">Numbers show timeline counts at each position (>9 shown as *)</p>
            </div>
          `;
          currentFrame++;
          setTimeout(displayFrame, 300);
        } else {
          resultsEl.innerHTML += `
            <div style="margin-top: 1rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">
              <p style="color: #00cc00;">✨ Part 2 Solution:</p>
              <p style="color: #ffff00; font-size: 24px; font-weight: bold;">${totalTimelines}</p>
              <p style="color: #cccccc; font-size: 14px;">Total timelines (many-worlds interpretation)</p>
              
              <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #333;">
                <p style="color: #00cc00; font-size: 14px; margin-bottom: 0.5rem;">💡 How it works:</p>
                <p style="color: #999; font-size: 13px; line-height: 1.6;">
                  In the quantum manifold, a single particle takes <em>both</em> paths at each splitter.
                  We track all unique positions the particle can reach (quantum superposition).
                  Each unique endpoint represents a different timeline in the many-worlds interpretation.
                </p>
              </div>
            </div>
          `;
        }
      };
      displayFrame();
    });

    visualizeBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const grid = parseManifold(input);
      const frames = visualizeManifold(grid);
      
      let currentFrame = 0;
      const displayFrame = () => {
        if (currentFrame < frames.length) {
          resultsEl.innerHTML = `
            <div style="margin-top: 1rem;">
              <p style="color: #00cc00;">Part 1: Step ${currentFrame + 1}/${frames.length}</p>
              <pre style="background: #0a0a0a; color: #00cc00; padding: 1rem; font-size: 14px; overflow-x: auto;">${frames[currentFrame]}</pre>
            </div>
          `;
          currentFrame++;
          setTimeout(displayFrame, 300);
        }
      };
      displayFrame();
    });

    revealBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const grid = parseManifold(input);
      const splitCount = simulateBeams(grid);
      const timelineCount = countQuantumTimelines(grid);
      
      resultsEl.innerHTML = `
        <div style="margin-top: 1rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">
          <p style="color: #00cc00; font-size: 16px; margin-bottom: 1rem;">✨ Solutions:</p>
          
          <div style="margin-bottom: 1.5rem;">
            <p style="color: #cccccc; font-size: 14px; margin-bottom: 0.3rem;">Part 1:</p>
            <p style="color: #ffff00; font-size: 24px; font-weight: bold; margin: 0;">${splitCount}</p>
            <p style="color: #999; font-size: 12px;">Total beam splits in the tachyon manifold</p>
          </div>
          
          <div>
            <p style="color: #cccccc; font-size: 14px; margin-bottom: 0.3rem;">Part 2:</p>
            <p style="color: #ffff00; font-size: 24px; font-weight: bold; margin: 0;">${timelineCount}</p>
            <p style="color: #999; font-size: 12px;">Total timelines (many-worlds interpretation)</p>
          </div>
          
          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #333;">
            <p style="color: #00cc00; font-size: 14px; margin-bottom: 0.5rem;">💡 How it works:</p>
            <p style="color: #999; font-size: 13px; line-height: 1.6;">
              <strong>Part 1:</strong> Tracks beam <em>counts</em> at each position. Each splitter increments the split counter.<br>
              <strong>Part 2:</strong> Each quantum split doubles the timelines. Tracks total paths through the manifold.
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 0.5rem;">
              Solution approach inspired by <a href="https://github.com/Cinnamonsroll/AdventOfCode2025/blob/main/day7/part1.ts" target="_blank" style="color: #009900;">@Cinnamonsroll</a>
            </p>
          </div>
        </div>
      `;
    });
  }
};
