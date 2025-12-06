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

  return { lines: padded, problems };
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
