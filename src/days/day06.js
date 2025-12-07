function parseWorksheet(input, part2 = false) {
  const lines = input.split(/\r?\n/);
  const height = lines.length;
  const width = Math.max(...lines.map(l => l.length));

  // Pad lines to equal width
  const padded = lines.map(l => l.padEnd(width, " "));

  // Identify problem regions (column ranges)
  const nonEmptyCols = [];
  for (let c = 0; c < width; c++) {
    let hasChar = false;
    for (let r = 0; r < height; r++) {
      if (padded[r][c] !== " ") {
        hasChar = true;
        break;
      }
    }
    nonEmptyCols.push(hasChar);
  }

  const regions = [];
  let currentStart = null;
  for (let c = 0; c < width; c++) {
    if (nonEmptyCols[c]) {
      if (currentStart === null) currentStart = c;
    } else {
      if (currentStart !== null) {
        regions.push({ start: currentStart, end: c - 1 });
        currentStart = null;
      }
    }
  }
  if (currentStart !== null) {
    regions.push({ start: currentStart, end: width - 1 });
  }

  const problems = [];

  regions.forEach((region, idx) => {
    const { start, end } = region;

    const snippetLines = padded.map(l => l.slice(start, end + 1));
    const topLines = snippetLines.slice(0, height - 1);
    const opLine = snippetLines[height - 1].trim();

    const op = opLine.includes("*") ? "*" : "+";

    let numbers = [];
    
    if (part2) {
      // Part 2: Read right-to-left by column
      // Each column becomes a number, reading digits top-to-bottom
      for (let c = end - start; c >= 0; c--) {
        let digitStr = '';
        for (let r = 0; r < topLines.length; r++) {
          const char = snippetLines[r][c];
          if (char && char !== ' ') {
            digitStr += char;
          }
        }
        if (digitStr) {
          const n = Number(digitStr);
          if (!Number.isNaN(n)) {
            numbers.push(n);
          }
        }
      }
    } else {
      // Part 1: Read top-to-bottom by row
      topLines.forEach(line => {
        const token = line.trim();
        if (token) {
          const n = Number(token);
          if (!Number.isNaN(n)) {
            numbers.push(n);
          }
        }
      });
    }

    let result = null;
    if (numbers.length) {
      if (op === "+") {
        result = numbers.reduce((acc, val) => acc + val, 0);
      } else {
        result = numbers.reduce((acc, val) => acc * val, 1);
      }
    }

    problems.push({
      id: idx + 1,
      start,
      end,
      snippetLines,
      op,
      numbers,
      result
    });
  });

  return { lines: padded, problems, width, height, padded };
}

export default {
  title: 'Day 6: Trash Compactor',
  description: 'Cephalopod math worksheet parsing',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 6: Trash Compactor ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/6" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>
          After jumping into a garbage chute, you find yourself in a trash compactor. While waiting for a family of cephalopods to help you escape, 
          the youngest asks for help with math homework. The worksheet contains vertically-arranged problems separated by columns of spaces.
        </p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day06-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
          >123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  </textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day06-part1" class="btn" style="margin-right: 0.5rem;">[Part 1: Top-to-Bottom]</button>
            <button id="day06-part2" class="btn" style="margin-right: 0.5rem;">[Part 2: Right-to-Left]</button>
            <button id="day06-reveal" class="btn" style="margin-right: 0.5rem;">[Reveal Both Solutions]</button>
            <button id="day06-wheel" class="btn" style="margin-right: 0.5rem;">[Spin the Wheel]</button>
          </div>
        </div>

        <div id="day06-results" style="margin-top:1rem;"></div>
        <div id="day06-visualization" style="margin-top:1rem; display:none;"></div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day06-input');
    const part1Btn = document.getElementById('day06-part1');
    const part2Btn = document.getElementById('day06-part2');
    const revealBtn = document.getElementById('day06-reveal');
    const wheelBtn = document.getElementById('day06-wheel');
    const resultsEl = document.getElementById('day06-results');
    const vizEl = document.getElementById('day06-visualization');

    function visualizePart(isPart2) {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      const parsed = parseWorksheet(input, isPart2);
      const grandTotal = parsed.problems.reduce((acc, p) => acc + (p.result ?? 0), 0);
      const partLabel = isPart2 ? 'Part 2 (Right-to-Left)' : 'Part 1 (Top-to-Bottom)';
      const readingDir = isPart2 ? 'right-to-left by column' : 'top-to-bottom by row';

      resultsEl.innerHTML = `
        <div style="padding: 1rem; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; margin-bottom: 1rem;">
          <p style="color: #00cc00; margin: 0 0 0.5rem 0; font-weight: bold;">✓ ${partLabel}</p>
          <p style="margin: 0.5rem 0; color: #ccc;">Found ${parsed.problems.length} problems (reading ${readingDir}).</p>
          <p style="margin: 0.5rem 0; color: #ffd700; font-size: 1.2rem; font-family: 'Source Code Pro', monospace;">
            <strong>Grand Total:</strong> ${grandTotal}
          </p>
        </div>
      `;

      // Create text transformation visualization
      vizEl.style.display = 'block';
      vizEl.innerHTML = `
        <style>
          .transform-container {
            max-height: 600px;
            overflow-y: auto;
            padding: 1rem;
            background: #0a0a0a;
            border: 1px solid #333;
            border-radius: 8px;
          }

          .problem-transform {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #1a1a1a;
            border-radius: 8px;
            border: 1px solid #333;
            opacity: 1;
          }

          .problem-header {
            color: #00cc00;
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
            font-family: 'Source Code Pro', monospace;
            letter-spacing: 0.05em;
          }

          .raw-text {
            background: #0a0a0a;
            border: 1px solid #555;
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            margin-bottom: 0.75rem;
            font-family: 'Source Code Pro', monospace;
            font-size: 0.9rem;
            color: #00cc00;
            font-weight: bold;
            white-space: pre;
            text-align: center;
            opacity: 1;
          }

          /* Part 1 specific: vertical layout with centered lines */
          .raw-text.part1 {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .raw-text-line {
            padding: 0.25rem 0;
            display: block;
            position: relative;
          }

          .raw-text.part1 .raw-text-line:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 1px;
            background: #444;
          }

          /* No line before the operator (nth-last-child(2) is second to last) */
          .raw-text.part1 .raw-text-line:nth-last-child(2)::after {
            display: none;
          }

          /* Part 2 specific: horizontal layout with columns */
          .raw-text.part2 {
            display: flex;
            justify-content: center;
            gap: 0;
          }

          .raw-text.part2 .raw-text-char {
            padding: 0 0.25rem;
            border-right: 1px solid #444;
          }

          .raw-text.part2 .raw-text-char:last-child {
            border-right: none;
          }

          .raw-text-char-line {
            display: block;
            min-height: 1.2em;
          }



          .arrow {
            text-align: center;
            color: #00cc00;
            font-size: 1.2rem;
            margin: 0.5rem 0;
            opacity: 1;
            font-weight: bold;
          }

          .equation {
            background: #0a0a0a;
            border: 1px solid #00cc00;
            border-radius: 6px;
            padding: 0.75rem;
            font-family: 'Source Code Pro', monospace;
            font-size: 1rem;
            color: #00cc00;
            text-align: center;
            opacity: 1;
            transform: translateY(0);
          }

          .result {
            color: #ffd700;
            font-weight: bold;
          }
        </style>

        <div class="transform-container" id="transform-container"></div>
      `;

      // Render problems with text-to-equation transformation
      const containerEl = vizEl.querySelector('#transform-container');
      
      // Show a subset for large datasets
      const maxProblems = 20;
      const problemsToShow = parsed.problems.length > maxProblems 
        ? [...parsed.problems.slice(0, 10), ...parsed.problems.slice(-10)]
        : parsed.problems;
      
      const showEllipsis = parsed.problems.length > maxProblems;
      
      // Render each problem transformation
      problemsToShow.forEach((problem, idx) => {
        if (showEllipsis && idx === 10) {
          const ellipsis = document.createElement('div');
          ellipsis.style.cssText = 'text-align: center; color: #666; padding: 1rem; font-style: italic;';
          ellipsis.textContent = `... ${parsed.problems.length - 20} more problems ...`;
          containerEl.appendChild(ellipsis);
        }

        const div = document.createElement('div');
        div.className = 'problem-transform';

        const header = document.createElement('div');
        header.className = 'problem-header';
        header.textContent = `Problem ${problem.id}`;
        div.appendChild(header);

        // Raw text snippet with separators
        const rawText = document.createElement('div');
        rawText.className = `raw-text ${isPart2 ? 'part2' : 'part1'}`;
        
        if (isPart2) {
          // Part 2: Show columns with vertical separators
          const maxCols = Math.max(...problem.snippetLines.map(line => line.length));
          for (let col = 0; col < maxCols; col++) {
            const colDiv = document.createElement('div');
            colDiv.className = 'raw-text-char';
            for (let row = 0; row < problem.snippetLines.length; row++) {
              const charSpan = document.createElement('span');
              charSpan.className = 'raw-text-char-line';
              charSpan.textContent = problem.snippetLines[row][col] || ' ';
              colDiv.appendChild(charSpan);
            }
            rawText.appendChild(colDiv);
          }
        } else {
          // Part 1: Show rows with horizontal separators (except before operator)
          problem.snippetLines.forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'raw-text-line';
            lineDiv.textContent = line;
            rawText.appendChild(lineDiv);
          });
        }
        
        div.appendChild(rawText);

        // Arrow
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.textContent = '↓';
        div.appendChild(arrow);

        // Equation - just use plain text with nice symbols
        const equation = document.createElement('div');
        equation.className = 'equation';
        const opSymbol = problem.op === '*' ? '×' : '+';
        const parts = problem.numbers.map(n => `<span style="color: #fff;">${n}</span>`);
        const opSpans = `<span style="color: #00cc00; margin: 0 0.5rem;">${opSymbol}</span>`;
        equation.innerHTML = `${parts.join(opSpans)} <span style="color: #00cc00; margin: 0 0.5rem;">=</span> <span class="result">${problem.result}</span>`;
        div.appendChild(equation);

        containerEl.appendChild(div);
      });
    }

    part1Btn.addEventListener('click', () => visualizePart(false));
    part2Btn.addEventListener('click', () => visualizePart(true));

    wheelBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      const parsed = parseWorksheet(input, true);
      vizEl.style.display = 'block';
      vizEl.innerHTML = '';
      wheelView.render(vizEl, parsed, true);
    });

    revealBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      const parsed1 = parseWorksheet(input, false);
      const grandTotal1 = parsed1.problems.reduce((acc, p) => acc + (p.result ?? 0), 0);
      
      const parsed2 = parseWorksheet(input, true);
      const grandTotal2 = parsed2.problems.reduce((acc, p) => acc + (p.result ?? 0), 0);

      // For large datasets, only show first/last 5 problems
      const showAll = parsed1.problems.length <= 20;
      const problemsToShow = showAll 
        ? parsed1.problems 
        : [...parsed1.problems.slice(0, 5), ...parsed1.problems.slice(-5)];

      resultsEl.innerHTML = `
        <div style="padding: 1rem; background: #1a1a1a; border: 1px solid #333; border-radius: 8px;">
          <p style="color: #00cc00; margin: 0 0 1rem 0; font-weight: bold; font-size: 1.1rem;">Solutions</p>
          <p style="margin: 0.5rem 0; color: #ccc;">Parsed ${parsed1.problems.length} problems from the worksheet.</p>
          
          <div style="margin: 1.5rem 0; padding: 1rem; background: #0a0a0a; border-left: 3px solid #00cc00;">
            <p style="color: #00cc00; margin: 0 0 0.5rem 0; font-weight: bold;">Part 1: Top-to-Bottom Reading</p>
            <p style="margin: 0.5rem 0; color: #ffd700; font-size: 1.2rem; font-family: 'Source Code Pro', monospace;">
              <strong>Grand Total:</strong> ${grandTotal1}
            </p>
          </div>
          
          <div style="margin: 1.5rem 0; padding: 1rem; background: #0a0a0a; border-left: 3px solid #ff6600;">
            <p style="color: #ff9933; margin: 0 0 0.5rem 0; font-weight: bold;">Part 2: Right-to-Left Reading</p>
            <p style="margin: 0.5rem 0; color: #ffd700; font-size: 1.2rem; font-family: 'Source Code Pro', monospace;">
              <strong>Grand Total:</strong> ${grandTotal2}
            </p>
          </div>
          
          <details style="margin-top: 1rem;">
            <summary style="color: #00cc00; cursor: pointer; margin-bottom: 0.5rem;">Show Part 1 problem details</summary>
            ${problemsToShow.slice(0, 5).map(p => `
              <div style="margin: 0.75rem 0; padding: 0.5rem; background: #0a0a0a; border-left: 3px solid #00cc00; font-family: 'Source Code Pro', monospace; font-size: 0.85rem;">
                Problem ${p.id}: ${p.numbers.join(` ${p.op} `)} = <span style="color: #ffd700;">${p.result}</span>
              </div>
            `).join('')}
            ${!showAll ? `
              <div style="margin: 0.75rem 0; padding: 0.5rem; color: #888; text-align: center; font-style: italic;">
                ... ${parsed1.problems.length - 10} more problems ...
              </div>
            ` : ''}
            ${!showAll ? problemsToShow.slice(-5).map(p => `
              <div style="margin: 0.75rem 0; padding: 0.5rem; background: #0a0a0a; border-left: 3px solid #00cc00; font-family: 'Source Code Pro', monospace; font-size: 0.85rem;">
                Problem ${p.id}: ${p.numbers.join(` ${p.op} `)} = <span style="color: #ffd700;">${p.result}</span>
              </div>
            `).join('') : ''}
          </details>
        </div>
      `;
      vizEl.style.display = 'none';
    });
  }
};

// ===== KINETIC WHEEL VISUALIZATION =====
export const wheelView = {
  render(container, parsed, isPart2 = false) {
    const data = isPart2 ? parsed : parsed;
    
    container.innerHTML = `
      <style>
        .wheel-container {
          padding: 1.5rem;
          background: #000;
          border-radius: 8px;
          margin-top: 1.5rem;
        }
        .wheel-header {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #999;
          font-family: 'Source Code Pro', monospace;
          font-size: 0.9rem;
          letter-spacing: 0.08em;
        }
        .wheel-panel {
          border-radius: 12px;
          background: radial-gradient(circle at top, #111 0, #000 70%);
          border: 1px solid #333;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8);
        }
        .wheel-canvas-wrap {
          position: relative;
          background: #000;
          cursor: grab;
          touch-action: none;
          width: 100%;
          height: 380px;
          display: block;
        }
        .wheel-canvas-wrap.dragging {
          cursor: grabbing;
        }
        #wheel-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        .wheel-hint {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: rgba(150, 160, 180, 0.8);
          font-family: 'Source Code Pro', monospace;
          background: rgba(10, 15, 30, 0.9);
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(150, 160, 180, 0.3);
          pointer-events: none;
          white-space: nowrap;
        }
        .wheel-hud {
          border-top: 1px solid #333;
          background: #050a15;
          padding: 10px 16px;
          display: grid;
          grid-template-columns: 1.25fr 1.1fr;
          gap: 12px;
          font-family: 'Source Code Pro', monospace;
          font-size: 12px;
        }
        .wheel-hud-left {
          min-width: 0;
        }
        .wheel-hud-right {
          min-width: 0;
          text-align: right;
        }
        .wheel-label {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #777;
          margin-bottom: 2px;
        }
        .wheel-equation {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #333;
          background: #0a0f1a;
          color: #ddd;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
          transition: all 140ms ease;
        }
        .wheel-equation.active {
          border-color: #00cc00;
          background: rgba(0, 204, 0, 0.1);
          color: #00ff00;
        }
        .wheel-total {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #333;
          background: #0a0f1a;
          color: #ddd;
          display: inline-block;
          margin-bottom: 2px;
        }
        .wheel-progress {
          font-size: 10px;
          margin-top: 4px;
          color: #777;
        }
        .wheel-progress span {
          color: #00ff00;
        }
        .wheel-checklist {
          margin-top: 6px;
          font-size: 10px;
          max-height: 60px;
          overflow-y: auto;
          max-width: 100%;
        }
        .wheel-check-item {
          white-space: nowrap;
          color: #888;
          margin: 2px 0;
        }
        .wheel-check-item.done {
          color: #00ff00;
        }
        .wheel-check-item span {
          margin-right: 3px;
        }
      </style>
      
      <div class="wheel-container">
        <div class="wheel-header">
          ${isPart2 ? 'Part 2: Kinetic Math Wheel' : 'Kinetic Math Wheel'}
        </div>
        
        <div class="wheel-panel">
          <div class="wheel-canvas-wrap" id="wheel-canvas-wrap">
            <canvas id="wheel-canvas"></canvas>
            <div class="wheel-hint">drag to spin · collect all sums</div>
          </div>
          
          <div class="wheel-hud">
            <div class="wheel-hud-left">
              <div class="wheel-label">Active problem</div>
              <div id="wheel-equation" class="wheel-equation">spin the wheel to start</div>
              <div id="wheel-meta" style="font-size: 10px; color: #666; margin-top: 2px;"></div>
            </div>
            <div class="wheel-hud-right">
              <div class="wheel-label">Grand total</div>
              <div id="wheel-grand-total" class="wheel-total">0</div>
              <div id="wheel-progress" class="wheel-progress"></div>
              <div id="wheel-checklist" class="wheel-checklist"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize Three.js wheel
    console.log('Wheel HTML rendered, initializing...');
    initializeWheel(container, data, isPart2);
  }
};

function initializeWheel(container, parsed, isPart2) {
  // Load Three.js if not already loaded
  if (typeof THREE === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      console.log('Three.js loaded successfully');
      initializeWheelScene(container, parsed, isPart2);
    };
    script.onerror = () => {
      console.error('Failed to load Three.js from CDN');
      // Try fallback URL
      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/three@r128/build/three.min.js';
      script2.onload = () => {
        console.log('Three.js loaded from fallback CDN');
        initializeWheelScene(container, parsed, isPart2);
      };
      script2.onerror = () => {
        console.error('All Three.js CDN attempts failed');
      };
      document.head.appendChild(script2);
    };
    document.head.appendChild(script);
    return;
  }
  
  initializeWheelScene(container, parsed, isPart2);
}

function initializeWheelScene(container, parsed, isPart2) {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  const wrapper = document.getElementById('wheel-canvas-wrap');
  if (!wrapper) {
    console.error('Wrapper element not found');
    return;
  }
  
  const eqEl = document.getElementById('wheel-equation');
  const metaEl = document.getElementById('wheel-meta');
  const totalEl = document.getElementById('wheel-grand-total');
  const progressEl = document.getElementById('wheel-progress');
  const checklistEl = document.getElementById('wheel-checklist');

  const grandTotal = parsed.problems.reduce((acc, p) => acc + (p.result ?? 0), 0);
  totalEl.textContent = grandTotal.toString();

  // Ensure canvas has proper dimensions
  const rect = wrapper.getBoundingClientRect();
  let canvasWidth = rect.width;
  let canvasHeight = rect.height;
  
  // Fallback if rect dimensions are 0
  if (canvasWidth <= 0) canvasWidth = 800;
  if (canvasHeight <= 0) canvasHeight = 380;

  console.log('Canvas dimensions:', { canvasWidth, canvasHeight, rect });

  // Three.js setup
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, precision: 'highp' });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasWidth, canvasHeight, false);
  renderer.setClearColor(0x000000);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, canvasWidth / canvasHeight, 0.1, 50);
  camera.position.set(0, 0.4, 8);
  scene.add(camera);
  
  console.log('Scene created, adding light');

  
  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);

  // Grid texture
  function makeGridTexture(padded, width, height) {
    const charW = 14;
    const charH = 20;
    const marginX = 16;
    const marginY = 16;
    const tex = document.createElement('canvas');
    tex.width = marginX * 2 + width * charW;
    tex.height = marginY * 2 + height * charH;
    
    console.log('Created texture canvas:', { width: tex.width, height: tex.height });
    
    const ctx = tex.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('Failed to get 2D context');
      return null;
    }
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, tex.width, tex.height);
    ctx.font = '16px JetBrains Mono, Fira Code, monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#777777';
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const ch = padded[r][c];
        const x = marginX + c * charW;
        const y = marginY + r * charH;
        ctx.fillText(ch, x, y);
      }
    }
    
    console.log('Texture canvas drawn, creating THREE.CanvasTexture');
    
    const texture = new THREE.CanvasTexture(tex);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    console.log('THREE.CanvasTexture created:', texture);
    return texture;
  }

  const gridTexture = makeGridTexture(parsed.padded, parsed.width, parsed.height);
  if (!gridTexture) {
    console.error('Failed to create grid texture');
    return;
  }
  console.log('Grid texture created:', gridTexture);

  // Wheel geometry
  const radius = 3.5;
  const cylHeight = 2.2;
  const radialSegments = parsed.width;
  const geometry = new THREE.CylinderGeometry(radius, radius, cylHeight, radialSegments, 1, true);
  const material = new THREE.MeshBasicMaterial({ map: gridTexture, side: THREE.DoubleSide, color: 0xffffff });
  console.log('Material created:', material);
  const wheel = new THREE.Mesh(geometry, material);
  scene.add(wheel);
  wheel.rotation.y = Math.PI;
  
  console.log('Wheel mesh created and added to scene');

  // State
  let rotation = 0;
  let velocity = 0;
  let lastX = 0;
  let isDragging = false;
  const problems = parsed.problems.map(p => ({ ...p, solved: false }));

  // Calculate which problem is at front
  function getActiveProblem() {
    const anglePerProblem = (2 * Math.PI) / parsed.width;
    let normalized = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let idx = Math.round(normalized / anglePerProblem) % parsed.width;
    for (let p of problems) {
      if (p.startCol <= idx && idx <= p.endCol) {
        return p;
      }
    }
    return null;
  }

  // Update HUD
  function updateHUD() {
    const active = getActiveProblem();
    if (active) {
      eqEl.className = 'wheel-equation active';
      eqEl.textContent = `${active.numbers.join(` ${active.op} `)} = ${active.result}`;
      metaEl.textContent = `Problem ${active.id}`;
      
      if (!active.solved) {
        active.solved = true;
      }
    } else {
      eqEl.className = 'wheel-equation';
      eqEl.textContent = 'spin to reveal';
    }

    checklistEl.innerHTML = '';
    problems.forEach(p => {
      const row = document.createElement('div');
      row.className = 'wheel-check-item' + (p.solved ? ' done' : '');
      row.innerHTML = `<span>${p.solved ? '■' : '□'}</span> P${p.id}`;
      checklistEl.appendChild(row);
    });

    const solvedCount = problems.filter(p => p.solved).length;
    progressEl.innerHTML = `Solved <span>${solvedCount}</span> / ${problems.length}`;
  }

  // Interaction
  function onMouseDown(e) {
    isDragging = true;
    lastX = e.clientX || e.touches?.[0].clientX || 0;
    wrapper.classList.add('dragging');
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const x = e.clientX || e.touches?.[0].clientX || 0;
    const delta = x - lastX;
    velocity = delta * 0.05;
    rotation += velocity;
    wheel.rotation.y = Math.PI + rotation;
    lastX = x;
    updateHUD();
  }

  function onMouseUp() {
    isDragging = false;
    wrapper.classList.remove('dragging');
  }

  wrapper.addEventListener('mousedown', onMouseDown);
  wrapper.addEventListener('touchstart', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchend', onMouseUp);

  // Physics loop
  function animate() {
    requestAnimationFrame(animate);
    
    if (!isDragging && Math.abs(velocity) > 0.001) {
      velocity *= 0.96;
      rotation += velocity;
      wheel.rotation.y = Math.PI + rotation;
      updateHUD();
    }

    renderer.render(scene, camera);
  }    console.log('Starting animation loop');
    animate();
    updateHUD();

    // Handle resize
    function onWindowResize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }

    window.addEventListener('resize', onWindowResize);
}
