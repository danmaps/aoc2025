export default {
  title: 'Day 9: Movie Theater',
  description: 'Largest rectangles anchored on red tiles.',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 9: Movie Theater ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/9" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>Paste your list of red tile coordinates (x,y per line) and explore the rectangles.</p>
        
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

        <div id="day09-viz-wrapper" style="margin-top:1rem;"></div>
        <div id="day09-results" style="margin-top:1rem;"></div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day09-input');
    const visualizeBtn = document.getElementById('day09-visualize');
    const revealBtn = document.getElementById('day09-reveal');
    const resultsEl = document.getElementById('day09-results');
    const vizWrapper = document.getElementById('day09-viz-wrapper');

    // Parse "x,y" lines into point objects, preserving order
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

    // Part 1: area of rectangle between two red tiles (axis-aligned, inclusive grid cells)
    function rectArea(a, b) {
      return (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1);
    }

    function solvePart1(tiles) {
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

    // Build the red+green region for part 2:
    // - Border: connect consecutive red tiles (wrapping) with straight segments
    // - Interior: everything inside the loop
    function buildRegion(tiles) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const t of tiles) {
        if (t.x < minX) minX = t.x;
        if (t.x > maxX) maxX = t.x;
        if (t.y < minY) minY = t.y;
        if (t.y > maxY) maxY = t.y;
      }

      const width = maxX - minX + 1;
      const height = maxY - minY + 1;

      const toGX = x => x - minX;
      const toGY = y => y - minY;

      // border[y][x] is true for tiles on the red+green loop
      const border = Array.from({ length: height }, () =>
        Array(width).fill(false)
      );

      const n = tiles.length;
      for (let i = 0; i < n; i++) {
        const a = tiles[i];
        const b = tiles[(i + 1) % n]; // wrap

        if (a.x === b.x) {
          const x = toGX(a.x);
          const y1 = Math.min(a.y, b.y);
          const y2 = Math.max(a.y, b.y);
          for (let y = y1; y <= y2; y++) {
            border[toGY(y)][x] = true;
          }
        } else if (a.y === b.y) {
          const y = toGY(a.y);
          const x1 = Math.min(a.x, b.x);
          const x2 = Math.max(a.x, b.x);
          for (let x = x1; x <= x2; x++) {
            border[y][toGX(x)] = true;
          }
        } else {
          throw new Error('Non axis aligned segment');
        }
      }

      // Flood fill outside to find exterior cells
      const H = height;
      const W = width;
      const visited = Array.from({ length: H + 2 }, () =>
        Array(W + 2).fill(false)
      );

      function isBlocked(ex, ey) {
        if (ex < 1 || ex > W || ey < 1 || ey > H) return false;
        const gx = ex - 1;
        const gy = ey - 1;
        return border[gy][gx];
      }

      const queue = [[0, 0]];
      visited[0][0] = true;
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ];

      while (queue.length) {
        const [cx, cy] = queue.shift();
        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (
            nx < 0 || nx > W + 1 ||
            ny < 0 || ny > H + 1 ||
            visited[ny][nx] ||
            isBlocked(nx, ny)
          ) continue;
          visited[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }

      // allowed[y][x] is true for red/green cells (border + interior)
      const allowed = Array.from({ length: H }, () =>
        Array(W).fill(false)
      );

      for (let gy = 0; gy < H; gy++) {
        for (let gx = 0; gx < W; gx++) {
          if (border[gy][gx]) {
            allowed[gy][gx] = true;
          } else {
            const ex = gx + 1;
            const ey = gy + 1;
            const outside = visited[ey][ex];
            if (!outside) {
              allowed[gy][gx] = true;
            }
          }
        }
      }

      // prefix sums over allowed
      const prefix = Array.from({ length: H + 1 }, () =>
        Array(W + 1).fill(0)
      );

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          prefix[y + 1][x + 1] =
            (allowed[y][x] ? 1 : 0) +
            prefix[y][x + 1] +
            prefix[y + 1][x] -
            prefix[y][x];
        }
      }

      function countAllowed(x1, y1, x2, y2) {
        const gx1 = x1 - minX;
        const gy1 = y1 - minY;
        const gx2 = x2 - minX;
        const gy2 = y2 - minY;
        const lx1 = Math.min(gx1, gx2);
        const lx2 = Math.max(gx1, gx2);
        const ly1 = Math.min(gy1, gy2);
        const ly2 = Math.max(gy1, gy2);

        return (
          prefix[ly2 + 1][lx2 + 1] -
          prefix[ly1][lx2 + 1] -
          prefix[ly2 + 1][lx1] +
          prefix[ly1][lx1]
        );
      }

      return {
        minX,
        minY,
        width,
        height,
        border,
        allowed,
        countAllowed
      };
    }

    function solvePart2(tiles) {
      if (tiles.length < 2) return { max: 0, a: null, b: null, rects: [] };

      const region = buildRegion(tiles);
      const { countAllowed } = region;

      let max = 0;
      let bestA = null;
      let bestB = null;
      const validRects = [];

      for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
          const a = tiles[i];
          const b = tiles[j];
          const x1 = Math.min(a.x, b.x);
          const x2 = Math.max(a.x, b.x);
          const y1 = Math.min(a.y, b.y);
          const y2 = Math.max(a.y, b.y);

          const rectAreaCells = (x2 - x1 + 1) * (y2 - y1 + 1);
          const allowedCells = countAllowed(x1, y1, x2, y2);

          if (allowedCells === rectAreaCells) {
            validRects.push({ a, b, area: rectAreaCells });
            if (rectAreaCells > max) {
              max = rectAreaCells;
              bestA = a;
              bestB = b;
            }
          }
        }
      }

      // sort valid rects by area descending
      validRects.sort((r1, r2) => r2.area - r1.area);

      return { max, a: bestA, b: bestB, rects: validRects, region };
    }

    function drawVisualization(region, tiles, rects, rectIndex) {
      vizWrapper.innerHTML = `
        <canvas id="day09-canvas" style="border:1px solid #333; background:#050505;"></canvas>
        <div style="margin-top:0.5rem; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <button id="day09-prev-rect" class="btn">[Prev Rectangle]</button>
          <button id="day09-next-rect" class="btn">[Next Rectangle]</button>
          <span id="day09-rect-info" style="color:#cccccc;"></span>
        </div>
      `;

      const canvas = document.getElementById('day09-canvas');
      const ctx = canvas.getContext('2d');

      const { minX, minY, width, height, border, allowed } = region;

      // pick a cell size that keeps things reasonably sized
      const maxCanvasSize = 500;
      const cellSize = Math.floor(
        Math.max(8, Math.min(maxCanvasSize / width, maxCanvasSize / height))
      );

      canvas.width = width * cellSize;
      canvas.height = height * cellSize;

      // quick lookup for red tiles
      const redSet = new Set(tiles.map(t => `${t.x},${t.y}`));

      // fill background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw grid cells
      for (let gy = 0; gy < height; gy++) {
        for (let gx = 0; gx < width; gx++) {
          const screenX = gx * cellSize;
          const screenY = gy * cellSize;
          const worldX = minX + gx;
          const worldY = minY + gy;
          const key = `${worldX},${worldY}`;
          const isRed = redSet.has(key);
          const isBorder = border[gy][gx];
          const isAllowed = allowed[gy][gx];

          if (!isAllowed) {
            ctx.fillStyle = '#111111'; // outside region
          } else if (isRed) {
            ctx.fillStyle = '#cc3333'; // red tile
          } else if (isBorder) {
            ctx.fillStyle = '#33ff66'; // loop border (green)
          } else {
            ctx.fillStyle = '#114422'; // interior green
          }

          ctx.fillRect(screenX, screenY, cellSize, cellSize);
        }
      }

      // highlight current rectangle if any
      if (rects.length > 0 && rectIndex >= 0 && rectIndex < rects.length) {
        const rect = rects[rectIndex];
        const { a, b } = rect;
        const x1 = Math.min(a.x, b.x);
        const x2 = Math.max(a.x, b.x);
        const y1 = Math.min(a.y, b.y);
        const y2 = Math.max(a.y, b.y);

        const gx1 = (x1 - minX) * cellSize;
        const gy1 = (y1 - minY) * cellSize;
        const gx2 = (x2 - minX + 1) * cellSize;
        const gy2 = (y2 - minY + 1) * cellSize;

        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(gx1, gy1, gx2 - gx1, gy2 - gy1);
        ctx.restore();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffff00';
        ctx.strokeRect(gx1 + 1, gy1 + 1, gx2 - gx1 - 2, gy2 - gy1 - 2);
      }

      // update rect info
      const info = document.getElementById('day09-rect-info');
      if (rects.length === 0) {
        info.textContent = 'No valid red/green rectangles found.';
      } else {
        const r = rects[rectIndex];
        info.textContent = `Rectangle ${rectIndex + 1} of ${rects.length} • area ${r.area} • corners (${r.a.x},${r.a.y}) to (${r.b.x},${r.b.y})`;
      }

      // hook up nav buttons
      const prevBtn = document.getElementById('day09-prev-rect');
      const nextBtn = document.getElementById('day09-next-rect');

      prevBtn.addEventListener('click', () => {
        if (rects.length === 0) return;
        const newIndex = (rectIndex - 1 + rects.length) % rects.length;
        drawVisualization(region, tiles, rects, newIndex);
      });

      nextBtn.addEventListener('click', () => {
        if (rects.length === 0) return;
        const newIndex = (rectIndex + 1) % rects.length;
        drawVisualization(region, tiles, rects, newIndex);
      });
    }

    visualizeBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        vizWrapper.innerHTML = '';
        return;
      }

      let tiles;
      try {
        tiles = parseTiles(input);
      } catch (e) {
        resultsEl.innerHTML = '<p style="color:#ff6666;">Error parsing input. Make sure each line is "x,y".</p>';
        vizWrapper.innerHTML = '';
        return;
      }

      const p2 = solvePart2(tiles);

      if (!p2.region) {
        vizWrapper.innerHTML = '<p style="color:#ff6666;">Could not build red/green region.</p>';
        return;
      }

      drawVisualization(p2.region, tiles, p2.rects, 0);
      resultsEl.innerHTML = '<p style="color:#cccccc;">Use the buttons to cycle through valid part 2 rectangles.</p>';
    });

    revealBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      let tiles;
      try {
        tiles = parseTiles(input);
      } catch (e) {
        resultsEl.innerHTML = '<p style="color:#ff6666;">Error parsing input. Make sure each line is "x,y".</p>';
        return;
      }

      if (tiles.length < 2) {
        resultsEl.innerHTML = '<p style="color:#ff6666;">Need at least two red tiles.</p>';
        return;
      }

      const p1 = solvePart1(tiles);
      const p2 = solvePart2(tiles);

      let html = '';

      // Part 1
      if (p1.max === 0 || !p1.a || !p1.b) {
        html += '<p style="color:#ff6666;">Part 1: No valid rectangles found.</p>';
      } else {
        html += `
          <p style="color:#cccccc;">
            <strong>Part 1:</strong> Largest rectangle (no restrictions) area:
            <span style="color:#00ff00;">${p1.max}</span><br/>
            Opposite corners at:
            (<span style="color:#00ccff;">${p1.a.x}</span>, <span style="color:#00ccff;">${p1.a.y}</span>) and
            (<span style="color:#00ccff;">${p1.b.x}</span>, <span style="color:#00ccff;">${p1.b.y}</span>)
          </p>
        `;
      }

      // Part 2
      if (p2.max === 0 || !p2.a || !p2.b) {
        html += '<p style="color:#ff6666;"><strong>Part 2:</strong> No rectangle fits entirely within red+green tiles.</p>';
      } else {
        html += `
          <p style="color:#cccccc;">
            <strong>Part 2:</strong> Largest rectangle using only red/green tiles area:
            <span style="color:#00ff00;">${p2.max}</span><br/>
            Opposite corners at:
            (<span style="color:#00ccff;">${p2.a.x}</span>, <span style="color:#00ccff;">${p2.a.y}</span>) and
            (<span style="color:#00ccff;">${p2.b.x}</span>, <span style="color:#00ccff;">${p2.b.y}</span>)
          </p>
        `;
      }

      resultsEl.innerHTML = html;
    });
  }
};