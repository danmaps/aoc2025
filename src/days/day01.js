export default {
  title: '--- Day 1: Secret Entrance ---',
  description: 'Simulate a circular dial and count events at or through 0.',
  stars: '★★',
  unlocked: true,
  solvePart1(input) {
    return 'See Python solution output';
  },
  solvePart2(input) {
    return 'See Python solution output';
  },
  render() {
    return `
      <div class="article">
        <h2>--- Day 1: Secret Entrance ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/1" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>You need to crack a safe to access the North Pole base. The safe has a <em>circular dial</em> with numbers <em>0-99</em>. Following a sequence of <em>left/right rotations</em>, the dial clicks as it passes each number. Starting at <em>50</em>, the password is the <em>number of times the dial points at 0</em> after any rotation in the sequence.</p>

        <h3 style="margin-top: 1rem;">Dial Visualization (Part 1)</h3>
        <div id="d1viz" style="display:flex; gap:1.5rem; align-items:flex-start; flex-wrap:wrap;">
          <div style="min-width:280px;">
            <div id="dial" style="position:relative; width:280px; height:280px; border:2px solid #00cc00; border-radius:50%; background: radial-gradient(closest-side, #0a0a0a 70%, #0f0f23 100%);"></div>
            <div id="dial-center" style="position:relative; margin-top:0.5rem; color:#cccccc;">
              <div>Pointer: <span id="pointer-val" style="color:#ffff00">50</span></div>
              <div>Zero hits: <span id="zero-count" style="color:#ffff00">0</span></div>
            </div>
            <div style="margin-top:0.75rem; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <button id="play-seq" class="btn">[Play Sequence]</button>
              <button id="reset-seq" class="btn" style="margin-left:0.5rem;">[Reset]</button>
              <label for="speed" style="color:#00cc00; margin-left:0.5rem;">Speed:</label>
              <input id="speed" type="range" min="1" max="100" value="100" style="accent-color:#00cc00; width:160px;" />
              <span id="speed-label" style="color:#cccccc;">Fast</span>
            </div>
          </div>
          <div style="flex:1; min-width:300px;">
            <div style="margin-top:0.5rem; color:#cccccc;">
              Sequence:
              <code id="seq-text" style="display:block; margin-top:0.25rem; color:#00cc00">L68, L30, R48, L5, R60, L55, L1, L99, R14, L82</code>
            </div>
            <div class="code-block" style="font-size: 12px; margin-top:0.75rem;">
              <pre id="rotation-log">Start at 50\n</pre>
            </div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #333;">
          <h3>&gt; How This Works</h3>
          <div style="margin: 1rem 0;">
            <strong>Part 1: Count Rotations Ending at 0</strong>
            <p style="margin: 0.5rem 0; color: #cccccc;">
              Apply each rotation from the starting position and count how many rotations <em>end</em> with the dial at position <em>0</em>.
            </p>
            <div class="code-block" style="font-size: 12px;">
              <pre>def simulate_dial(rotations):
    position = 0
    count = 0
    for rotation in rotations:
        position = (position + rotation) % 10
        if position == 0:
            count += 1
    return count</pre>
            </div>
          </div>
          <div style="margin: 1rem 0;">
            <strong>Part 2: Count All Clicks Through 0</strong>
            <p style="margin: 0.5rem 0; color: #cccccc;">
              Count <em>every single click</em> that passes through <em>position 0</em> during rotation, not just the ending position.
            </p>
            <div class="code-block" style="font-size: 12px;">
              <pre>def simulate_dial_with_clicks(rotations):
    position = 0
    clicks = 0
    for rotation in rotations:
        step = 1 if rotation > 0 else -1
        for _ in range(abs(rotation)):
            position = (position + step) % 10
            if position == 0:
                clicks += 1
    return clicks</pre>
            </div>
          </div>
        </div>

        <h3 style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #333;">Solutions (Python)</h3>
        <p style="font-size: 0.95rem;">
          <a href="https://github.com/danmaps/aoc2025/blob/053cd76e3bf6e14f175d747d9ca5bba05188ab73/src/legacy/day1/solution.py" target="_blank">Part 1 (solution.py)</a> | 
          <a href="https://github.com/danmaps/aoc2025/blob/38bb24c649c4cb6ba4426b45f39f3f056877477b/src/legacy/day1/solution2.py" target="_blank">Part 2 (solution2.py)</a>
        </p>
      </div>
    `;
  },
  attachHandlers() {
    const dial = document.getElementById('dial');
    if (!dial) return;
    const radius = 130; // inner pointer radius
    const center = { x: 140, y: 140 };

    // Draw tick marks 0..99
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width','280');
    svg.setAttribute('height','280');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    for (let n = 0; n < 100; n++) {
      const angle = (Math.PI * 2) * (n / 100) - Math.PI/2; // start at top
      const x1 = center.x + Math.cos(angle) * (radius + 8);
      const y1 = center.y + Math.sin(angle) * (radius + 8);
      const x2 = center.x + Math.cos(angle) * (radius + (n % 5 === 0 ? 20 : 14));
      const y2 = center.y + Math.sin(angle) * (radius + (n % 5 === 0 ? 20 : 14));
      const tick = document.createElementNS('http://www.w3.org/2000/svg','line');
      tick.setAttribute('x1', String(x1));
      tick.setAttribute('y1', String(y1));
      tick.setAttribute('x2', String(x2));
      tick.setAttribute('y2', String(y2));
      tick.setAttribute('stroke', n % 5 === 0 ? '#00cc00' : '#333');
      tick.setAttribute('stroke-width', n % 5 === 0 ? '2' : '1');
      svg.appendChild(tick);
      if (n % 25 === 0) {
        const tx = center.x + Math.cos(angle) * (radius + 32);
        const ty = center.y + Math.sin(angle) * (radius + 32);
        const text = document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute('x', String(tx));
        text.setAttribute('y', String(ty));
        text.setAttribute('fill', '#cccccc');
        text.setAttribute('font-size','10');
        text.setAttribute('text-anchor','middle');
        text.setAttribute('dominant-baseline','middle');
        text.textContent = String(n);
        svg.appendChild(text);
      }
    }

    dial.appendChild(svg);

    // Pointer element
    const pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.width = '0';
    pointer.style.height = '0';
    pointer.style.borderLeft = '6px solid transparent';
    pointer.style.borderRight = '6px solid transparent';
    pointer.style.borderBottom = '16px solid #ffff00';
    pointer.style.left = `${center.x - 6}px`;
    pointer.style.top = `${center.y - radius - 16}px`;
    pointer.style.transformOrigin = '6px 146px';
    pointer.style.filter = 'drop-shadow(0 0 6px #ffff00)';
    dial.appendChild(pointer);

    const pointerVal = document.getElementById('pointer-val');
    const zeroCountEl = document.getElementById('zero-count');
    const logEl = document.getElementById('rotation-log');

    const seq = [
      ['L',68],['L',30],['R',48],['L',5],['R',60],['L',55],['L',1],['L',99],['R',14],['L',82]
    ];

    let pos = 50;
    let zeros = 0;
    let speedMs = 4; // default per-click delay (fast)

    function setPointerTo(value) {
      const angle = (Math.PI * 2) * (value / 100);
      const deg = angle * (180/Math.PI);
      pointer.style.transform = `rotate(${deg}deg)`;
      pointerVal.textContent = String(value);
    }

    setPointerTo(pos);

    async function animateStep(dir, dist) {
      const sign = dir === 'L' ? -1 : 1;
      const clicks = dist;
      for (let i = 0; i < clicks; i++) {
        pos = (pos + sign + 100) % 100;
        setPointerTo(pos);
        await new Promise(r => setTimeout(r, speedMs));
      }
      if (pos === 0) {
        zeros++;
        zeroCountEl.textContent = String(zeros);
        pointer.style.borderBottom = '16px solid #ffff66';
        pointer.style.filter = 'drop-shadow(0 0 10px #ffff66)';
        await new Promise(r => setTimeout(r, Math.max(120, speedMs * 12)));
        pointer.style.borderBottom = '16px solid #ffff00';
        pointer.style.filter = 'drop-shadow(0 0 6px #ffff00)';
      }
    }

    async function playSequence() {
      // Reset visual log
      logEl.textContent = 'Start at 50\n';
      pos = 50; zeros = 0; setPointerTo(pos); zeroCountEl.textContent = '0';
      for (const [d, v] of seq) {
        await animateStep(d, v);
        logEl.textContent += `${d}${v} → ${pos}\n`;
      }
      logEl.textContent += `Password (zero hits): ${zeros}`;
    }

    const playBtn = document.getElementById('play-seq');
    const resetBtn = document.getElementById('reset-seq');
    const speedInput = document.getElementById('speed');
    const speedLabel = document.getElementById('speed-label');
    if (playBtn) playBtn.addEventListener('click', () => { playSequence(); });
    if (resetBtn) resetBtn.addEventListener('click', () => {
      pos = 50; zeros = 0; setPointerTo(pos); zeroCountEl.textContent = '0';
      logEl.textContent = `Start at 50\n`;
    });
    if (speedInput) {
      const updateSpeed = () => {
        const v = Number(speedInput.value); // 1..100
        // Map slider to delay: fast at high value
        // delay ms ~ 4 + (100 - v) * 0.6  => 64..4
        speedMs = Math.max(4, Math.round(4 + (100 - v) * 0.6));
        const label = v >= 80 ? 'Fast' : v >= 40 ? 'Medium' : 'Slow';
        speedLabel.textContent = label;
      };
      speedInput.addEventListener('input', updateSpeed);
      updateSpeed();
    }
  }
};
