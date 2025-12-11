function parseManifold(input) {
  return input.split('\n').map(line => line.split(''));
}

function findStart(grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 'S') {
        return { row, col };
      }
    }
  }
  return null;
}

function simulateBeams(grid) {
  const start = findStart(grid);
  if (!start) return 0;
  
  let splitCount = 0;
  const beams = [{ row: start.row, col: start.col, dir: 'down' }];
  const visited = new Set();
  
  while (beams.length > 0) {
    const beam = beams.shift();
    const key = `${beam.row},${beam.col},${beam.dir}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    if (beam.row < 0 || beam.row >= grid.length || 
        beam.col < 0 || beam.col >= grid[0].length) {
      continue;
    }
    
    const cell = grid[beam.row][beam.col];
    
    if (cell === '^') {
      splitCount++;
      beams.push({ row: beam.row + 1, col: beam.col - 1, dir: 'left' });
      beams.push({ row: beam.row + 1, col: beam.col + 1, dir: 'right' });
    } else {
      if (beam.dir === 'down') {
        beams.push({ row: beam.row + 1, col: beam.col, dir: 'down' });
      } else if (beam.dir === 'left') {
        beams.push({ row: beam.row + 1, col: beam.col - 1, dir: 'left' });
      } else if (beam.dir === 'right') {
        beams.push({ row: beam.row + 1, col: beam.col + 1, dir: 'right' });
      }
    }
  }
  
  return splitCount;
}

function visualizeManifold(grid, maxSteps = 50) {
  const start = findStart(grid);
  if (!start) return [];
  
  const frames = [];
  const beams = [{ row: start.row, col: start.col, dir: 'down' }];
  const allBeamPositions = new Set();
  const visited = new Set();
  
  for (let step = 0; step < maxSteps && beams.length > 0; step++) {
    const currentBeams = [...beams];
    const frame = grid.map(row => [...row]);
    
    for (const beam of currentBeams) {
      if (beam.row >= 0 && beam.row < grid.length && 
          beam.col >= 0 && beam.col < grid[0].length) {
        const cell = grid[beam.row][beam.col];
        if (cell === '.' || cell === 'S') {
          frame[beam.row][beam.col] = '|';
        }
        allBeamPositions.add(`${beam.row},${beam.col}`);
      }
    }
    
    frames.push(frame.map(row => row.join('')).join('\n'));
    
    const nextBeams = [];
    for (const beam of beams) {
      const key = `${beam.row},${beam.col},${beam.dir}`;
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (beam.row < 0 || beam.row >= grid.length || 
          beam.col < 0 || beam.col >= grid[0].length) {
        continue;
      }
      
      const cell = grid[beam.row][beam.col];
      
      if (cell === '^') {
        nextBeams.push({ row: beam.row + 1, col: beam.col - 1, dir: 'left' });
        nextBeams.push({ row: beam.row + 1, col: beam.col + 1, dir: 'right' });
      } else {
        if (beam.dir === 'down') {
          nextBeams.push({ row: beam.row + 1, col: beam.col, dir: 'down' });
        } else if (beam.dir === 'left') {
          nextBeams.push({ row: beam.row + 1, col: beam.col - 1, dir: 'left' });
        } else if (beam.dir === 'right') {
          nextBeams.push({ row: beam.row + 1, col: beam.col + 1, dir: 'right' });
        }
      }
    }
    
    beams.length = 0;
    beams.push(...nextBeams);
  }
  
  return frames;
}

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
            <button id="day07-visualize" class="btn" style="margin-right: 0.5rem;">[Visualize]</button>
            <button id="day07-reveal" class="btn" style="margin-right: 0.5rem;">[Reveal Solution]</button>
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
    const resultsEl = document.getElementById('day07-results');

    visualizeBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const grid = parseManifold(input);
      const frames = visualizeManifold(grid, 20);
      
      let currentFrame = 0;
      const displayFrame = () => {
        if (currentFrame < frames.length) {
          resultsEl.innerHTML = `
            <div style="margin-top: 1rem;">
              <p style="color: #00cc00;">Step ${currentFrame + 1}/${frames.length}</p>
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
      
      resultsEl.innerHTML = `
        <div style="margin-top: 1rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">
          <p style="color: #00cc00; font-size: 16px; margin-bottom: 0.5rem;">✨ Part 1 Solution:</p>
          <p style="color: #ffff00; font-size: 24px; font-weight: bold;">${splitCount}</p>
          <p style="color: #cccccc; font-size: 14px;">Total beam splits in the tachyon manifold</p>
        </div>
      `;
    });
  }
};
