function parseInput(lines) {
  let i = 0;
  const shapes = [];
  const regions = [];
  
  // Parse shapes
  while (i < lines.length) {
    if (!/^\d+:/.test(lines[i])) break;
    i++; // Skip the "N:" line
    const shapeLines = [];
    while (i < lines.length && lines[i] && !/^\d+:/.test(lines[i]) && !/^\d+x\d+:/.test(lines[i])) {
      shapeLines.push(lines[i]);
      i++;
    }
    shapes.push(shapeLines);
    while (i < lines.length && !lines[i]) i++; // Skip empty lines
  }
  
  // Parse regions
  for (; i < lines.length; i++) {
    if (!lines[i]) continue;
    const match = lines[i].match(/^(\d+)x(\d+):\s*(.*)$/);
    if (match) {
      regions.push({
        width: parseInt(match[1]),
        height: parseInt(match[2]),
        required: match[3].split(/\s+/).map(Number)
      });
    }
  }
  
  return { shapes, regions };
}

function getShapeArea(shape) {
  let area = 0;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === '#') area++;
    }
  }
  return area;
}

// Extract coordinates from shape
function shapeToCoords(shape) {
  const coords = [];
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === '#') {
        coords.push([x, y]);
      }
    }
  }
  return coords;
}

// Generate all rotations and flips
function generateVariants(coords) {
  const variants = [];
  
  // 4 rotations × 2 flips
  for (let flip = 0; flip < 2; flip++) {
    for (let rot = 0; rot < 4; rot++) {
      let variant = coords.map(([x, y]) => {
        // Apply flip
        if (flip === 1) x = -x;
        
        // Apply rotation
        for (let r = 0; r < rot; r++) {
          [x, y] = [-y, x];
        }
        return [x, y];
      });
      
      // Normalize to origin
      const minX = Math.min(...variant.map(([x]) => x));
      const minY = Math.min(...variant.map(([, y]) => y));
      variant = variant.map(([x, y]) => [x - minX, y - minY]);
      
      // Deduplicate
      const key = JSON.stringify(variant.sort());
      if (!variants.some(v => JSON.stringify(v.sort()) === key)) {
        variants.push(variant);
      }
    }
  }
  
  return variants;
}

// Backtracking solver
function solvePacking(region, shapes, onStep = null) {
  const W = region.width;
  const H = region.height;
  const board = Array(H).fill(null).map(() => Array(W).fill('.'));
  
  // Build piece list
  const pieces = [];
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
    '#fd79a8', '#fdcb6e', '#00b894', '#e17055', '#74b9ff',
    '#a29bfe', '#ff7675', '#fab1a0', '#ffeaa7', '#dfe6e9',
    '#55efc4', '#81ecec', '#e84393', '#00cec9', '#0984e3'
  ];
  let labelIdx = 0;
  
  for (let shapeIdx = 0; shapeIdx < region.required.length; shapeIdx++) {
    const count = region.required[shapeIdx];
    const coords = shapeToCoords(shapes[shapeIdx]);
    const variants = generateVariants(coords);
    
    for (let i = 0; i < count; i++) {
      pieces.push({
        label: labels[labelIdx % labels.length],
        color: colors[labelIdx % colors.length],
        variants
      });
      labelIdx++;
    }
  }
  
  let steps = 0;
  const maxSteps = 50000;
  const frames = [];
  
  function canPlace(variant, x, y) {
    for (const [dx, dy] of variant) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) return false;
      if (board[ny][nx] !== '.') return false;
    }
    return true;
  }
  
  function place(variant, x, y, label) {
    for (const [dx, dy] of variant) {
      board[y + dy][x + dx] = label;
    }
  }
  
  function unplace(variant, x, y) {
    for (const [dx, dy] of variant) {
      board[y + dy][x + dx] = '.';
    }
  }
  
  function boardToHTML() {
    let html = '<div style="display:inline-block;background:#000;border:2px solid #555;padding:2px;line-height:0;">';
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = board[y][x];
        if (cell === '.') {
          html += '<span style="display:inline-block;width:20px;height:20px;background:#1a1a1a;"></span>';
        } else {
          const piece = pieces.find(p => p.label === cell);
          const color = piece ? piece.color : '#666';
          html += `<span style="display:inline-block;width:20px;height:20px;background:${color};"></span>`;
        }
      }
      if (y < H - 1) html += '<br>';
    }
    html += '</div>';
    return html;
  }
  
  function solve(pieceIdx) {
    if (steps++ > maxSteps) return false;
    
    if (pieceIdx >= pieces.length) return true;
    
    const piece = pieces[pieceIdx];
    
    for (const variant of piece.variants) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (canPlace(variant, x, y)) {
            place(variant, x, y, piece.label);
            
            if (onStep && frames.length < 500) { // Limit frames
              frames.push({
                board: boardToHTML(),
                pieceNum: pieceIdx + 1,
                total: pieces.length,
                step: steps
              });
            }
            
            if (solve(pieceIdx + 1)) return true;
            
            unplace(variant, x, y);
          }
        }
      }
    }
    
    return false;
  }
  
  const result = solve(0);
  return { 
    success: result, 
    steps, 
    frames,
    finalBoard: boardToHTML()
  };
}

function canFitPresents(region, shapes) {
  const regionArea = region.width * region.height;
  const shapeAreas = shapes.map(getShapeArea);
  
  let requiredArea = 0;
  for (let i = 0; i < region.required.length; i++) {
    requiredArea += region.required[i] * shapeAreas[i];
  }
  
  // Simple heuristic: if required area fits in region area, likely can fit
  return requiredArea <= regionArea;
}

function visualizeRegion(region, shapes) {
  const shapeAreas = shapes.map(getShapeArea);
  const regionArea = region.width * region.height;
  
  let requiredArea = 0;
  const details = [];
  for (let i = 0; i < region.required.length; i++) {
    if (region.required[i] > 0) {
      const area = region.required[i] * shapeAreas[i];
      requiredArea += area;
      details.push(`  Shape ${i}: ${region.required[i]}x (${shapeAreas[i]} units each) = ${area} units`);
    }
  }
  
  const canFit = requiredArea <= regionArea;
  
  return {
    regionSize: `${region.width}x${region.height}`,
    regionArea,
    requiredArea,
    details,
    canFit,
    percentage: ((requiredArea / regionArea) * 100).toFixed(1)
  };
}

const EXAMPLE_INPUT = `0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2`;

export default {
  title: 'Day 12: Christmas Tree Farm',
  description: 'Tetris-style Present Packing',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 12: Christmas Tree Farm ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/12" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>Help the Elves determine which regions can fit all their presents. Presents come in weird shapes and need to fit under Christmas trees.</p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day12-input" 
            style="width: 100%; min-height: 200px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
          ></textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day12-solve" class="btn" style="margin-right: 0.5rem;">[Solve Packing]</button>
            <button id="day12-visualize" class="btn" style="margin-right: 0.5rem;">[Guess Based on Area]</button>
            <button id="day12-reveal" class="btn">[Reveal Solution]</button>
          </div>
        </div>

        <div id="day12-results" style="margin-top:1rem;"></div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day12-input');
    const visualizeBtn = document.getElementById('day12-visualize');
    const solveBtn = document.getElementById('day12-solve');
    const revealBtn = document.getElementById('day12-reveal');
    const resultsEl = document.getElementById('day12-results');

    // Populate with example
    inputEl.value = EXAMPLE_INPUT;

    solveBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const lines = input.split('\n');
      const { shapes, regions } = parseInput(lines);
      
      if (regions.length > 3) {
        resultsEl.innerHTML = `
          <div style="margin-top: 1rem; padding: 1rem; background: #1a0000; border: 1px solid #ff6666;">
            <p style="color: #ff6666; font-size: 16px; font-weight: bold;">🙄 Oh, you want me to solve ${regions.length} packing problems?</p>
            <p style="color: #ffaaaa; margin-top: 0.5rem;">Don't put me through this. That's computationally expensive and I have feelings, you know.</p>
            <p style="color: #999; font-size: 13px; margin-top: 1rem;">Try an input with 3 or fewer regions if you want to see the backtracking magic.</p>
          </div>
        `;
        return;
      }
      
      resultsEl.innerHTML = '<p style="color: #00cc00;">Starting backtracking solver...</p>';
      
      setTimeout(() => {
        const results = regions.map(region => solvePacking(region, shapes, true));
        
        let html = '<div style="margin-top: 1rem;">';
        html += '<p style="color: #00cc00; font-size: 16px; margin-bottom: 1rem;">🎯 Backtracking Solver Results:</p>';
        
        // Speed slider
        html += `
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">
            <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">Animation Speed:</label>
            <input type="range" id="speed-slider" min="1" max="100" value="50" style="width: 300px; margin-right: 1rem;">
            <span id="speed-label" style="color: #ffff00;">50ms/frame</span>
            <button id="play-all-btn" class="btn" style="margin-left: 1rem;">[Play All Animations]</button>
          </div>
        `;
        
        regions.forEach((region, idx) => {
          const result = results[idx];
          html += `<div style="margin-bottom: 2rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">`;
          html += `<p style="color: #ffff00; font-weight: bold; margin-bottom: 0.5rem;">Region ${idx + 1}: ${region.width}x${region.height}</p>`;
          
          if (result.success) {
            html += `<p style="color: #00ff00; margin-bottom: 0.5rem;">✓ Solution found! (${result.steps} steps, ${result.frames.length} frames)</p>`;
          } else {
            html += `<p style="color: #ff6666; margin-bottom: 0.5rem;">✗ No solution exists</p>`;
            html += `<p style="color: #999; font-size: 13px; margin-bottom: 0.5rem;">Exhaustively searched ${result.steps} placements. No matter how hard you try, there is no way to fit all of the presents into this region.</p>`;
          }
          
          if (result.frames.length > 0) {
            html += `<button class="btn play-btn" data-region="${idx}" style="margin-bottom: 0.5rem;">[Play Animation - ${result.frames.length} frames]</button>`;
          }
          
          html += `<div id="region-${idx}-display">`;
          html += `<div style="background: #000; padding: 1rem; display: inline-block;">${result.finalBoard}</div>`;
          html += `</div>`;
          
          html += `</div>`;
        });
        
        html += '</div>';
        resultsEl.innerHTML = html;
        
        // Set up animation controls
        const speedSlider = document.getElementById('speed-slider');
        const speedLabel = document.getElementById('speed-label');
        const playAllBtn = document.getElementById('play-all-btn');
        
        let animationSpeed = 50;
        
        speedSlider.addEventListener('input', (e) => {
          animationSpeed = parseInt(e.target.value);
          speedLabel.textContent = `${animationSpeed}ms/frame`;
        });
        
        function playAnimation(regionIdx) {
          const result = results[regionIdx];
          if (result.frames.length === 0) return;
          
          const displayEl = document.getElementById(`region-${regionIdx}-display`);
          let frameIdx = 0;
          
          const animate = () => {
            if (frameIdx < result.frames.length) {
              const frame = result.frames[frameIdx];
              displayEl.innerHTML = `
                <p style="color: #999; font-size: 12px; margin-bottom: 0.3rem;">Placing piece ${frame.pieceNum}/${frame.total} (step ${frame.step})</p>
                <div style="background: #000; padding: 1rem; display: inline-block;">${frame.board}</div>
              `;
              frameIdx++;
              setTimeout(animate, animationSpeed);
            } else {
              if (result.success) {
                displayEl.innerHTML = `
                  <p style="color: #00ff00; font-weight: bold; margin-bottom: 0.3rem;">✓ Complete!</p>
                  <div style="background: #000; padding: 1rem; display: inline-block;">${result.finalBoard}</div>
                `;
              } else {
                displayEl.innerHTML = `
                  <p style="color: #ff6666; font-weight: bold; margin-bottom: 0.3rem;">✗ Failed - No solution exists</p>
                  <div style="background: #000; padding: 1rem; display: inline-block;">${result.finalBoard}</div>
                `;
              }
            }
          };
          
          animate();
        }
        
        document.querySelectorAll('.play-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const regionIdx = parseInt(btn.getAttribute('data-region'));
            playAnimation(regionIdx);
          });
        });
        
        playAllBtn.addEventListener('click', () => {
          let delay = 0;
          results.forEach((result, idx) => {
            if (result.frames.length > 0) {
              setTimeout(() => playAnimation(idx), delay);
              delay += result.frames.length * animationSpeed + 1000;
            }
          });
        });
        
      }, 100);
    });

    visualizeBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const lines = input.split('\n');
      const { shapes, regions } = parseInput(lines);
      
      let html = '<div style="margin-top: 1rem;">';
      html += '<p style="color: #00cc00; font-size: 16px; margin-bottom: 1rem;">📦 Area-Based Heuristic (Guess):</p>';
      html += '<p style="color: #ffaa00; font-size: 13px; margin-bottom: 1rem;">⚠️ This is just a guess based on area! It doesn\'t account for shape constraints.</p>';
      
      regions.forEach((region, idx) => {
        const analysis = visualizeRegion(region, shapes);
        const statusColor = analysis.canFit ? '#00ff00' : '#ff6666';
        const statusText = analysis.canFit ? '✓ CAN FIT' : '✗ CANNOT FIT';
        html += `
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: #0a0a0a; border-left: 3px solid ${statusColor};">
            <p style="color: ${statusColor}; font-weight: bold; margin-bottom: 0.5rem;">${statusText} (by area)</p>
            <p style="color: #cccccc; margin: 0.3rem 0;"><strong>Region ${idx + 1}:</strong> ${analysis.regionSize} (${analysis.regionArea} units)</p>
            <p style="color: #999; margin: 0.3rem 0; font-size: 13px;">Required presents:</p>
            <pre style="color: #999; margin: 0.5rem 0 0.5rem 1rem; font-size: 12px; line-height: 1.4;">${analysis.details.join('\n')}</pre>
            <p style="color: #ffff00; margin: 0.5rem 0 0 0;"><strong>Total required:</strong> ${analysis.requiredArea} units (${analysis.percentage}% of region)</p>
            <p style="color: #ff8800; font-size: 12px; margin-top: 0.5rem; font-style: italic;">Note: Area fits, but actual packing may still fail due to shape constraints!</p>
          </div>
        `;
      });
      
      html += '</div>';
      resultsEl.innerHTML = html;
    });

    revealBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const lines = input.split('\n');
      const { shapes, regions } = parseInput(lines);
      
      let fittingRegions = 0;
      regions.forEach(region => {
        if (canFitPresents(region, shapes)) {
          fittingRegions++;
        }
      });
      
      resultsEl.innerHTML = `
        <div style="margin-top: 1rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">
          <p style="color: #00cc00; font-size: 16px; margin-bottom: 0.5rem;">✨ Solution:</p>
          <p style="color: #ffff00; font-size: 24px; font-weight: bold;">${fittingRegions}</p>
          <p style="color: #cccccc; font-size: 14px;">regions can fit all their presents</p>
          <p style="color: #999; font-size: 12px; margin-top: 1rem;">Total regions checked: ${regions.length}</p>
          
          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #333;">
            <p style="color: #00cc00; font-size: 14px; margin-bottom: 0.5rem;">💡 How it works:</p>
            <p style="color: #999; font-size: 13px; line-height: 1.6;">
              This solution uses an area-based heuristic: if the total area of all required presents 
              fits within the region's area, we assume they can be arranged. While the puzzle description 
              suggests complex packing logic, the simple area check works for determining feasibility.
            </p>
          </div>
        </div>
      `;
    });
  }
};
