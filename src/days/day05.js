export default {
  title: 'Day 5: Cafeteria',
  description: 'Ingredient freshness validation using range checking',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 5: Cafeteria ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/5" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>
          The cafeteria's new inventory management system needs help! Determine which ingredient IDs are fresh by checking if they fall within the fresh ID ranges.
        </p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day05-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
          >3-5
10-14
16-20
12-18

1
5
8
11
17
32</textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day05-visualize" class="btn" style="margin-right: 0.5rem;">[Visualize Part 1]</button>
            <button id="day05-part2" class="btn" style="margin-right: 0.5rem;">[Visualize Part 2]</button>
            <button id="day05-reveal" class="btn" style="margin-right: 0.5rem;">[Reveal Solutions]</button>
            <div style="display: inline-flex; align-items: center; margin-left: 1rem; gap: 0.5rem;">
              <label for="day05-speed" style="color: #00cc00; margin: 0;">Speed:</label>
              <input id="day05-speed" type="range" min="1" max="100" value="50" style="accent-color:#00cc00; width:120px;" />
              <span id="day05-speed-label" style="color:#cccccc;">5.0x</span>
            </div>
          </div>
        </div>

        <div id="day05-results" style="margin-top:1rem;"></div>
        <canvas id="day05-canvas" style="background:#0a0a0a; border:1px solid #333; margin-top:1rem; display:none; margin-left:auto; margin-right:auto;"></canvas>

        <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #333;">
          <h3>&gt; How This Works</h3>
          
          <div style="margin-top: 1.5rem;">
            <h4 style="color: #00cc00; margin-top: 1rem; margin-bottom: 0.5rem;">Part 1: Range Checking Algorithm</h4>
            <p>Each ingredient ID is validated against all fresh ranges. An ID is fresh if it falls within any range (inclusive).</p>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">for (const id of availableIds) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;const isFresh = ranges.some(r =></div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;id >= r.lower && id <= r.upper</div>
              <div style="color: #aaa;">&nbsp;&nbsp;);</div>
              <div style="color: #aaa;">&nbsp;&nbsp;if (isFresh) freshCount++;</div>
              <div style="color: #aaa;">}</div>
            </div>
            <p style="font-size: 12px; color: #bbb;"><strong>Complexity:</strong> O(n × m) where n = ingredient count, m = range count. For typical inputs (1000 IDs × 1000 ranges), this performs ~1M comparisons, which JavaScript handles efficiently.</p>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="color: #00cc00; margin-top: 1rem; margin-bottom: 0.5rem;">Part 2: Range Merging</h4>
            <p>Overlapping ranges are merged to count total coverage without double-counting. Sort ranges by start position, then merge adjacent/overlapping segments.</p>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">const sorted = [...ranges].sort((a, b) =></div>
              <div style="color: #aaa;">&nbsp;&nbsp;a.lower - b.lower);</div>
              <div style="color: #aaa;"></div>
              <div style="color: #aaa;">for (const range of sorted) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;const last = merged[merged.length - 1];</div>
              <div style="color: #aaa;">&nbsp;&nbsp;if (range.lower <= last.upper + 1) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;// Merge: extend last range</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;last.upper = Math.max(last.upper, range.upper);</div>
              <div style="color: #aaa;">&nbsp;&nbsp;} else {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;merged.push({ ...range });</div>
              <div style="color: #aaa;">&nbsp;&nbsp;}</div>
              <div style="color: #aaa;">}</div>
            </div>
            <p style="font-size: 12px; color: #bbb;"><strong>Complexity:</strong> O(m log m) for sorting + O(m) for merging = O(m log m) total. Much more efficient than checking every ID individually when coverage is needed.</p>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="color: #00cc00; margin-top: 1rem; margin-bottom: 0.5rem;">Visualization Scaling & Performance</h4>
            <p><strong>Challenge:</strong> Real puzzle input contains ~1000 ranges and ~1000 ingredient IDs, requiring careful optimization to maintain smooth 60fps animation.</p>
            
            <h5 style="color: #00aa00; margin-top: 0.75rem; margin-bottom: 0.25rem; font-size: 13px;">Batched Dropping</h5>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">// Drop ~50 waves instead of 1000 at once</div>
              <div style="color: #aaa;">const batchSize = Math.ceil(ingredients.length / 50);</div>
              <div style="color: #aaa;">const dropInterval = Math.floor(3 / speed);</div>
              <div style="color: #aaa;"></div>
              <div style="color: #aaa;">if (framesSinceLastDrop >= dropInterval) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;// Activate next batch</div>
              <div style="color: #aaa;">&nbsp;&nbsp;for (let i = dropIndex; i < endIndex; i++) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;&nbsp;&nbsp;ingredients[i].state = 'falling';</div>
              <div style="color: #aaa;">&nbsp;&nbsp;}</div>
              <div style="color: #aaa;">}</div>
            </div>
            <p style="font-size: 12px; color: #bbb;">Instead of rendering 1000 ingredients simultaneously (causing frame drops), items are activated in waves. This creates a cascading waterfall effect while keeping draw calls manageable.</p>

            <h5 style="color: #00aa00; margin-top: 0.75rem; margin-bottom: 0.25rem; font-size: 13px;">Pre-computed Freshness Checks</h5>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">// Check once during setup, not every frame</div>
              <div style="color: #aaa;">const ingredients = availableIds.map(id => ({</div>
              <div style="color: #aaa;">&nbsp;&nbsp;isFresh: ranges.some(r => id >= r.lower && id <= r.upper)</div>
              <div style="color: #aaa;">}));</div>
            </div>
            <p style="font-size: 12px; color: #bbb;">Freshness validation happens once during initialization, not during the animation loop. This avoids 1M+ comparisons per frame.</p>

            <h5 style="color: #00aa00; margin-top: 0.75rem; margin-bottom: 0.25rem; font-size: 13px;">Conditional Text Rendering</h5>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">// Skip text when too many items</div>
              <div style="color: #aaa;">if (ingredients.length <= 100) {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;ctx.fillText(ing.id.toString(), ing.x, ing.y);</div>
              <div style="color: #aaa;">}</div>
            </div>
            <p style="font-size: 12px; color: #bbb;">Text rendering is expensive. For large datasets, ID labels are omitted to reduce canvas operations from ~2000 to ~1000 per frame.</p>

            <h5 style="color: #00aa00; margin-top: 0.75rem; margin-bottom: 0.25rem; font-size: 13px;">Value-to-Pixel Mapping</h5>
            <div style="background: #1a1a1a; padding: 0.75rem; border-left: 3px solid #00cc00; margin: 0.75rem 0; font-family: 'Source Code Pro', monospace; font-size: 11px; overflow-x: auto;">
              <div style="color: #aaa;">const minVal = Math.min(...allValues);</div>
              <div style="color: #aaa;">const maxVal = Math.max(...allValues);</div>
              <div style="color: #aaa;"></div>
              <div style="color: #aaa;">const valueToX = (v) => {</div>
              <div style="color: #aaa;">&nbsp;&nbsp;const t = (v - minVal) / (maxVal - minVal || 1);</div>
              <div style="color: #aaa;">&nbsp;&nbsp;return shelfLeft + t * (shelfRight - shelfLeft);</div>
              <div style="color: #aaa;">};</div>
            </div>
            <p style="font-size: 12px; color: #bbb;">Normalizes any numeric range (1-100 or 1M-10M) to screen coordinates. Handles edge cases like single-value inputs gracefully.</p>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="color: #00cc00; margin-top: 1rem; margin-bottom: 0.5rem;">Animation Features</h4>
            <ul style="font-size: 12px; color: #bbb; margin-left: 1rem;">
              <li><strong>Part 1:</strong> Ingredients (food emojis) cascade down. Fresh items land in green buckets on the shelf with glow effect. Spoiled items fall into the brown trash bin below.</li>
              <li><strong>Part 2:</strong> Shows original overlapping ranges faintly, then animates through merged ranges with a sweeping highlight, counting IDs as it progresses.</li>
              <li><strong>Speed Control:</strong> Adjustable 0.1x-10x multiplier affects drop rate, physics speed, and animation timing.</li>
              <li><strong>Random Emojis:</strong> 30 different food emojis (🍎🍊🍋🍌🍉🍇🍓🥑🥕🌽...) randomly assigned to ingredients for visual variety.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day05-input');
    const visualizeBtn = document.getElementById('day05-visualize');
    const part2Btn = document.getElementById('day05-part2');
    const revealBtn = document.getElementById('day05-reveal');
    const resultsEl = document.getElementById('day05-results');
    const canvas = document.getElementById('day05-canvas');
    const speedSlider = document.getElementById('day05-speed');
    const speedLabel = document.getElementById('day05-speed-label');

    let animSpeed = 5;

    speedSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      animSpeed = val / 10;
      speedLabel.textContent = animSpeed.toFixed(1) + 'x';
    });

    visualizeBtn.addEventListener('click', async () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      try {
        const parsed = parseInput(input);
        canvas.style.display = 'block';
        await animatePart1(canvas, parsed, () => animSpeed);
        
        resultsEl.innerHTML = `
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px;">
            <h3>Part 1: Fresh Ingredients</h3>
            <p style="font-size:1.2rem;"><strong>${parsed.part1}</strong> ingredient IDs are fresh</p>
          </div>
        `;
      } catch (err) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      }
    });

    part2Btn.addEventListener('click', async () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      try {
        const parsed = parseInput(input);
        canvas.style.display = 'block';
        await animatePart2(canvas, parsed, () => animSpeed);
        
        resultsEl.innerHTML = `
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px;">
            <h3>Part 2: Total Fresh IDs</h3>
            <p style="font-size:1.2rem;"><strong>${parsed.part2}</strong> total IDs are fresh (merged ranges)</p>
          </div>
        `;
      } catch (err) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      }
    });

    revealBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      try {
        const parsed = parseInput(input);
        resultsEl.innerHTML = `
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px;">
            <h3>Part 1: Fresh Ingredients</h3>
            <p style="font-size:1.2rem;"><strong>${parsed.part1}</strong> ingredient IDs are fresh</p>
          </div>
          <div style="background:#1a1a1a; padding:1rem; border-radius:5px; margin-top:1rem;">
            <h3>Part 2: Total Fresh IDs</h3>
            <p style="font-size:1.2rem;"><strong>${parsed.part2}</strong> total IDs are fresh (merged ranges)</p>
          </div>
        `;
      } catch (err) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      }
    });
  }
};

function parseInput(input) {
  const lines = input.trim().split('\n');
  const blankIndex = lines.findIndex(line => line.trim() === '');
  
  const rangeLines = lines.slice(0, blankIndex);
  const idLines = lines.slice(blankIndex + 1);
  
  const ranges = rangeLines.map(line => {
    const [lower, upper] = line.split('-').map(Number);
    return { lower, upper };
  });
  
  const availableIds = idLines.map(Number);
  
  // Part 1: check each ID
  let freshCount = 0;
  for (const id of availableIds) {
    const isFresh = ranges.some(r => id >= r.lower && id <= r.upper);
    if (isFresh) freshCount++;
  }
  
  // Part 2: merge ranges and count total
  const mergedRanges = mergeRanges(ranges);
  let totalFresh = 0;
  for (const r of mergedRanges) {
    totalFresh += r.upper - r.lower + 1;
  }
  
  return {
    ranges,
    availableIds,
    part1: freshCount,
    part2: totalFresh,
    mergedRanges
  };
}

function mergeRanges(ranges) {
  const sorted = [...ranges].sort((a, b) => a.lower - b.lower);
  const merged = [];
  
  for (const range of sorted) {
    if (merged.length === 0) {
      merged.push({ ...range });
    } else {
      const last = merged[merged.length - 1];
      if (range.lower <= last.upper + 1) {
        last.upper = Math.max(last.upper, range.upper);
      } else {
        merged.push({ ...range });
      }
    }
  }
  
  return merged;
}

async function animatePart1(canvas, data, getSpeed) {
  const ctx = canvas.getContext('2d');
  canvas.width = 1000;
  canvas.height = 500;
  
  const { ranges, availableIds } = data;
  
  // Calculate value to X mapping
  const allValues = [
    ...ranges.flatMap(r => [r.lower, r.upper]),
    ...availableIds
  ];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  
  const shelfLeft = 80;
  const shelfRight = canvas.width - 80;
  const shelfY = 250;
  
  const valueToX = (v) => {
    const t = (v - minVal) / (maxVal - minVal || 1);
    return shelfLeft + t * (shelfRight - shelfLeft);
  };
  
  // Animate ranges appearing
  const displayRanges = ranges.map(r => ({ ...r, alpha: 0 }));
  
  for (let i = 0; i < 20; i++) {
    displayRanges.forEach(r => r.alpha = Math.min(1, r.alpha + 0.05 * getSpeed()));
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw shelf
    ctx.fillStyle = '#3c472f';
    ctx.fillRect(shelfLeft, shelfY, shelfRight - shelfLeft, 8);
    
    // Draw ranges as buckets
    displayRanges.forEach(r => {
      const x1 = valueToX(r.lower);
      const x2 = valueToX(r.upper);
      ctx.globalAlpha = r.alpha;
      ctx.fillStyle = '#50c878';
      ctx.fillRect(x1, shelfY - 16, x2 - x1, 24);
      ctx.strokeStyle = '#2a6f4a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, shelfY - 16, x2 - x1, 24);
    });
    ctx.globalAlpha = 1;
    
    await new Promise(resolve => setTimeout(resolve, 16));
  }
  
  // Food emojis for ingredients
  const foodEmojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', 
                      '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥕', '🌽', '🥒', '🥬',
                      '🥦', '🧄', '🧅', '🍄', '🥜', '🫘', '🌰', '🍞', '🥐', '🥖'];
  
  // Create falling ingredients (initially inactive)
  const ingredients = availableIds.map(id => ({
    id,
    x: valueToX(id),
    y: -20,
    vy: 0,
    state: 'waiting',
    isFresh: ranges.some(r => id >= r.lower && id <= r.upper),
    emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)]
  }));
  
  const trashY = canvas.height - 60;
  let freshCount = 0;
  let spoiledCount = 0;
  
  // Drop ingredients in batches
  let dropIndex = 0;
  const batchSize = Math.max(1, Math.ceil(ingredients.length / 50)); // Drop in ~50 waves
  let framesSinceLastDrop = 0;
  const dropInterval = Math.max(1, Math.floor(3 / getSpeed())); // Frames between drops
  
  // Animate ingredients falling
  let running = true;
  while (running) {
    let allDone = true;
    
    // Activate next batch
    framesSinceLastDrop++;
    if (dropIndex < ingredients.length && framesSinceLastDrop >= dropInterval) {
      const endIndex = Math.min(dropIndex + batchSize, ingredients.length);
      for (let i = dropIndex; i < endIndex; i++) {
        ingredients[i].state = 'falling';
      }
      dropIndex = endIndex;
      framesSinceLastDrop = 0;
    }
    
    if (dropIndex < ingredients.length) allDone = false;
    
    for (const ing of ingredients) {
      if (ing.state === 'falling') {
        allDone = false;
        ing.vy += 0.5 * getSpeed();
        ing.y += ing.vy;
        
        if (ing.y >= shelfY - 20) {
          if (ing.isFresh) {
            ing.y = shelfY - 24;
            ing.vy = 0;
            ing.state = 'landed';
            freshCount++;
          } else {
            ing.state = 'falling-to-trash';
          }
        }
      } else if (ing.state === 'falling-to-trash') {
        allDone = false;
        ing.y += ing.vy;
        if (ing.y >= trashY) {
          ing.state = 'trash';
          spoiledCount++;
        }
      }
    }
    
    // Draw
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw shelf
    ctx.fillStyle = '#3c472f';
    ctx.fillRect(shelfLeft, shelfY, shelfRight - shelfLeft, 8);
    
    // Draw trash bin
    ctx.fillStyle = '#4a3c2a';
    ctx.fillRect(shelfLeft, trashY, shelfRight - shelfLeft, 40);
    ctx.fillStyle = '#8b7355';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPOILED', canvas.width / 2, trashY + 25);
    
    // Draw ranges
    displayRanges.forEach(r => {
      const x1 = valueToX(r.lower);
      const x2 = valueToX(r.upper);
      ctx.fillStyle = '#50c878';
      ctx.fillRect(x1, shelfY - 16, x2 - x1, 24);
      ctx.strokeStyle = '#2a6f4a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, shelfY - 16, x2 - x1, 24);
    });
    
    // Draw ingredients (only visible ones)
    ingredients.forEach(ing => {
      if (ing.state === 'waiting') return; // Don't draw until activated
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add glow effect for fresh vs spoiled
      if (ing.state === 'landed') {
        ctx.shadowColor = '#3fbf3f';
        ctx.shadowBlur = 8;
      } else if (ing.state === 'trash' || ing.state === 'falling-to-trash') {
        ctx.shadowColor = '#7a4b2b';
        ctx.shadowBlur = 8;
      }
      
      // Draw emoji
      ctx.font = '20px Arial';
      ctx.fillText(ing.emoji, ing.x, ing.y);
      
      ctx.restore();
    });
    
    // Draw counts
    ctx.fillStyle = '#00cc00';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Fresh: ${freshCount}`, 20, 30);
    ctx.fillStyle = '#cc6600';
    ctx.fillText(`Spoiled: ${spoiledCount}`, 20, 55);
    
    if (allDone) running = false;
    await new Promise(resolve => setTimeout(resolve, 16));
  }
}

async function animatePart2(canvas, data, getSpeed) {
  const ctx = canvas.getContext('2d');
  canvas.width = 1000;
  canvas.height = 400;
  
  const { ranges, mergedRanges } = data;
  
  const allValues = ranges.flatMap(r => [r.lower, r.upper]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  
  const shelfLeft = 80;
  const shelfRight = canvas.width - 80;
  const shelfY = 200;
  
  const valueToX = (v) => {
    const t = (v - minVal) / (maxVal - minVal || 1);
    return shelfLeft + t * (shelfRight - shelfLeft);
  };
  
  // Show original ranges
  const displayRanges = ranges.map(r => ({ ...r, alpha: 0 }));
  
  for (let i = 0; i < 20; i++) {
    displayRanges.forEach(r => r.alpha = Math.min(1, r.alpha + 0.05 * getSpeed()));
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#3c472f';
    ctx.fillRect(shelfLeft, shelfY, shelfRight - shelfLeft, 8);
    
    displayRanges.forEach(r => {
      const x1 = valueToX(r.lower);
      const x2 = valueToX(r.upper);
      ctx.globalAlpha = r.alpha;
      ctx.fillStyle = 'rgba(80, 200, 120, 0.4)';
      ctx.fillRect(x1, shelfY - 24, x2 - x1, 36);
    });
    ctx.globalAlpha = 1;
    
    await new Promise(resolve => setTimeout(resolve, 16));
  }
  
  // Animate merged ranges
  const mergedAnim = mergedRanges.map(r => ({ ...r, progress: 0 }));
  let currentIndex = 0;
  let totalCounted = 0;
  
  while (currentIndex < mergedAnim.length) {
    const seg = mergedAnim[currentIndex];
    seg.progress = Math.min(1, seg.progress + 0.02 * getSpeed());
    
    if (seg.progress >= 1) {
      totalCounted += seg.upper - seg.lower + 1;
      currentIndex++;
    }
    
    // Draw
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#3c472f';
    ctx.fillRect(shelfLeft, shelfY, shelfRight - shelfLeft, 8);
    
    // Original ranges faint
    ctx.globalAlpha = 0.2;
    displayRanges.forEach(r => {
      const x1 = valueToX(r.lower);
      const x2 = valueToX(r.upper);
      ctx.fillStyle = 'rgba(80, 200, 120, 0.4)';
      ctx.fillRect(x1, shelfY - 24, x2 - x1, 36);
    });
    ctx.globalAlpha = 1;
    
    // Merged ranges
    mergedAnim.forEach((seg, idx) => {
      const x1 = valueToX(seg.lower);
      const x2 = valueToX(seg.upper);
      
      if (idx < currentIndex) {
        ctx.fillStyle = 'rgba(0, 180, 100, 0.7)';
        ctx.fillRect(x1, shelfY - 24, x2 - x1, 36);
      } else if (idx === currentIndex) {
        ctx.fillStyle = 'rgba(0, 180, 100, 0.5)';
        ctx.fillRect(x1, shelfY - 24, x2 - x1, 36);
        
        const sweepX = x1 + (x2 - x1) * seg.progress;
        ctx.fillStyle = 'rgba(220, 255, 220, 0.9)';
        ctx.fillRect(x1, shelfY - 24, sweepX - x1, 36);
      }
    });
    
    // Draw count
    ctx.fillStyle = '#00cc00';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Total Fresh IDs: ${totalCounted}`, 20, 40);
    
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px monospace';
    ctx.fillText(`Merged Ranges: ${currentIndex} / ${mergedRanges.length}`, 20, 70);
    
    await new Promise(resolve => setTimeout(resolve, 16));
  }
}
