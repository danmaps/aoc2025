day10_plan.md

Alright, here’s a small, self-contained skeleton you can drop into an `index.html` and start hacking on.

It’s focused on **one machine** for now, but structured so you can later swap in different machines and wire it to your solver.

---

## 1. Full minimal HTML file

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>MPC Factory – Machine View</title>
  <style>
    :root {
      --bg: #151515;
      --panel: #202020;
      --panel-alt: #252525;
      --accent: #f4b43a;
      --accent-off: #353535;
      --pad: #2d2d2d;
      --pad-active: #3d3d3d;
      --pad-text: #f8f8f2;
      --text-sub: #aaaaaa;
      --success: #6fd37c;
      --danger: #ff6666;
      --border-soft: #383838;
      --font-main: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 24px;
      background: radial-gradient(circle at top, #252525 0, #050505 60%);
      color: #f0f0f0;
      font-family: var(--font-main);
      display: flex;
      justify-content: center;
    }

    .machine-shell {
      width: 900px;
      max-width: 100%;
      background: var(--panel);
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
      padding: 20px 20px 24px;
      display: grid;
      grid-template-rows: auto auto 1fr;
      gap: 16px;
      position: relative;
      overflow: hidden;
    }

    /* fake tape wobble band */
    .machine-shell::before {
      content: "";
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        -45deg,
        rgba(255, 255, 255, 0.03) 0,
        rgba(255, 255, 255, 0.03) 2px,
        transparent 2px,
        transparent 4px
      );
      mix-blend-mode: soft-light;
      pointer-events: none;
      opacity: 0.5;
    }

    .machine-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-radius: 10px;
      background: linear-gradient(120deg, #2b2b2b, #222);
      position: relative;
      z-index: 1;
    }

    .machine-title {
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.85rem;
    }

    .machine-meta {
      font-size: 0.8rem;
      color: var(--text-sub);
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .stat-pill {
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid var(--border-soft);
      background: #1b1b1b;
    }

    .stat-pill span {
      color: var(--accent);
      font-weight: 600;
      margin-left: 4px;
    }

    /* lights area */

    .lights-panel {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .strip-block {
      background: var(--panel-alt);
      border-radius: 12px;
      padding: 12px 14px 14px;
      border: 1px solid var(--border-soft);
    }

    .strip-label {
      font-size: 0.75rem;
      color: var(--text-sub);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .strip-rows {
      display: grid;
      gap: 6px;
    }

    .strip-row {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px;
      align-items: center;
    }

    .strip-row-title {
      font-size: 0.8rem;
      color: var(--text-sub);
      text-transform: uppercase;
    }

    .led-row {
      display: flex;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 999px;
      background: #181818;
    }

    .led {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      background: var(--accent-off);
      box-shadow: inset 0 0 0 1px #111;
      position: relative;
      transform: translateZ(0);
    }

    .led::after {
      content: "";
      position: absolute;
      inset: 3px;
      border-radius: 3px;
      background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15), transparent 60%);
      opacity: 0;
      transition: opacity 0.15s ease-out;
    }

    .led.on {
      background: radial-gradient(circle at 30% 20%, #ffe7a0, #f4b43a 55%, #845a1a 100%);
      box-shadow:
        0 0 10px rgba(244, 180, 58, 0.7),
        inset 0 0 0 1px rgba(0, 0, 0, 0.7);
    }

    .led.on::after {
      opacity: 1;
    }

    .led.flash {
      animation: ledFlash 0.18s ease-out;
    }

    @keyframes ledFlash {
      from { transform: scale(1.15); }
      to   { transform: scale(1); }
    }

    .info-chip {
      font-size: 0.75rem;
      color: var(--text-sub);
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid var(--border-soft);
      background: #171717;
    }

    /* pads */

    .pads-panel {
      background: var(--panel-alt);
      border-radius: 12px;
      padding: 12px 14px 16px;
      border: 1px solid var(--border-soft);
      position: relative;
      z-index: 1;
    }

    .pads-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .pads-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 10px;
    }

    .pad {
      background: var(--pad);
      border-radius: 10px;
      padding: 8px 8px 10px;
      border: 1px solid #111;
      box-shadow:
        0 3px 0 #050505,
        0 0 16px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      transform: translateY(0);
      transition: transform 0.07s ease-out, box-shadow 0.07s ease-out, background 0.07s ease-out;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 4px;
    }

    .pad:hover {
      background: #343434;
    }

    .pad:active {
      transform: translateY(2px);
      box-shadow:
        0 1px 0 #050505,
        0 0 10px rgba(0, 0, 0, 0.6);
    }

    .pad.active {
      background: var(--pad-active);
    }

    .pad-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
    }

    .pad-id {
      font-weight: 600;
      color: var(--pad-text);
    }

    .pad-presses {
      color: var(--text-sub);
      font-variant-numeric: tabular-nums;
    }

    .pad-body {
      font-size: 0.7rem;
      color: var(--text-sub);
      line-height: 1.3;
    }

    .pad-body span {
      color: var(--accent);
    }

    .pads-footer {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-sub);
    }

    .badge-ok {
      color: var(--success);
    }

    .badge-warn {
      color: var(--danger);
    }

    .btn-ghost {
      font-size: 0.75rem;
      border-radius: 999px;
      padding: 4px 10px;
      border: 1px solid var(--border-soft);
      background: #151515;
      color: #e0e0e0;
      cursor: pointer;
    }

    .btn-ghost:hover {
      background: #202020;
    }

    @media (max-width: 720px) {
      body {
        padding: 12px;
      }
      .machine-shell {
        padding: 14px;
      }
      .lights-panel {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="machine-shell">
    <!-- header -->
    <header class="machine-header">
      <div class="machine-title">Machine 01 · Beat Cartridge</div>
      <div class="machine-meta">
        <div class="stat-pill">
          Presses: <span id="press-count">0</span>
        </div>
        <div class="stat-pill">
          Min presses: <span id="min-presses">?</span>
        </div>
      </div>
    </header>

    <!-- lights -->
    <section class="lights-panel">
      <div class="strip-block">
        <div class="strip-label">
          <span>Light Pattern</span>
          <span class="info-chip" id="pattern-label">Target: [.##.]</span>
        </div>
        <div class="strip-rows">
          <div class="strip-row">
            <div class="strip-row-title">Target</div>
            <div class="led-row" id="target-row"></div>
          </div>
          <div class="strip-row">
            <div class="strip-row-title">Current</div>
            <div class="led-row" id="current-row"></div>
          </div>
        </div>
      </div>

      <div class="strip-block">
        <div class="strip-label">
          <span>Status</span>
          <span class="info-chip" id="status-chip">Not solved</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-sub); margin:0 0 6px;">
          Tap pads to toggle indicator lanes. Two hits cancel out
          just like running a sample twice out of phase.
        </p>
        <p style="font-size:0.8rem; color:var(--text-sub); margin:0;">
          When the current strip matches the target, this machine’s beat is locked in.
        </p>
      </div>
    </section>

    <!-- pads -->
    <section class="pads-panel">
      <div class="pads-header">
        <span class="strip-label">Pads / Buttons</span>
        <button class="btn-ghost" id="replay-opt">Replay optimal</button>
      </div>
      <div class="pads-grid" id="pads-grid"></div>
      <div class="pads-footer">
        <span id="solved-note">Try to match the target in as few presses as possible.</span>
        <span>Double toggles are just noise.</span>
      </div>
    </section>
  </div>

  <script>
    // ---------------------------
    // Example machine data
    // ---------------------------
    // This corresponds to:
    // [.##.] (3) (1,3) (2) (2,3) (0,2) (0,1)
    const machine = {
      id: 1,
      patternString: "[.##.]",
      target: [0, 1, 1, 0],
      buttons: [
        [3],
        [1, 3],
        [2],
        [2, 3],
        [0, 2],
        [0, 1],
      ],
      // for now, hard-code min presses for the example
      minPresses: 2,
      optimalCombo: [4, 5], // indices of buttons: (0,2) and (0,1)
    };

    let currentState = Array.from(machine.target, () => 0);
    let pressCount = 0;
    const buttonPressCounts = new Array(machine.buttons.length).fill(0);

    const targetRowEl = document.getElementById("target-row");
    const currentRowEl = document.getElementById("current-row");
    const padsGridEl = document.getElementById("pads-grid");
    const pressCountEl = document.getElementById("press-count");
    const minPressesEl = document.getElementById("min-presses");
    const statusChipEl = document.getElementById("status-chip");
    const solvedNoteEl = document.getElementById("solved-note");
    const patternLabelEl = document.getElementById("pattern-label");
    const replayBtn = document.getElementById("replay-opt");

    // ---------------------------
    // Render lights
    // ---------------------------
    function createLedRow(container, bits) {
      container.innerHTML = "";
      bits.forEach((bit, idx) => {
        const led = document.createElement("div");
        led.className = "led" + (bit ? " on" : "");
        led.dataset.index = idx;
        container.appendChild(led);
      });
    }

    function updateCurrentRow(flashIndices = []) {
      const leds = Array.from(currentRowEl.children);
      currentState.forEach((bit, idx) => {
        const led = leds[idx];
        if (!led) return;
        led.classList.toggle("on", bit === 1);
        if (flashIndices.includes(idx)) {
          led.classList.remove("flash");
          void led.offsetWidth; // reflow to restart animation
          led.classList.add("flash");
        }
      });
    }

    // ---------------------------
    // Pad rendering
    // ---------------------------
    function padIdFromIndex(i) {
      // A1, A2, A3... B1, B2...
      const row = Math.floor(i / 4);
      const col = i % 4;
      const rowLetter = String.fromCharCode("A".charCodeAt(0) + row);
      return rowLetter + (col + 1);
    }

    function renderPads() {
      padsGridEl.innerHTML = "";
      machine.buttons.forEach((btn, idx) => {
        const pad = document.createElement("button");
        pad.className = "pad";
        pad.dataset.index = idx;

        const padTop = document.createElement("div");
        padTop.className = "pad-top";

        const padId = document.createElement("span");
        padId.className = "pad-id";
        padId.textContent = padIdFromIndex(idx);

        const padPresses = document.createElement("span");
        padPresses.className = "pad-presses";
        padPresses.textContent = "×0";

        padTop.appendChild(padId);
        padTop.appendChild(padPresses);

        const padBody = document.createElement("div");
        padBody.className = "pad-body";
        padBody.innerHTML =
          "Toggles <span>" + btn.join(", ") + "</span>";

        pad.appendChild(padTop);
        pad.appendChild(padBody);

        pad.addEventListener("click", () => {
          pressButton(idx);
          pad.classList.add("active");
          setTimeout(() => pad.classList.remove("active"), 120);
        });

        // store element refs
        pad._pressLabel = padPresses;

        padsGridEl.appendChild(pad);
      });
    }

    // ---------------------------
    // Logic
    // ---------------------------
    function pressButton(idx) {
      const indices = machine.buttons[idx];
      pressCount += 1;
      buttonPressCounts[idx] += 1;

      // XOR toggle for each light index
      const changedIndices = [];
      indices.forEach((i) => {
        if (i < 0 || i >= currentState.length) return;
        currentState[i] ^= 1;
        changedIndices.push(i);
      });

      // update UI
      pressCountEl.textContent = String(pressCount);

      // update per-pad press display
      const padEl = padsGridEl.querySelector(`.pad[data-index="${idx}"]`);
      if (padEl && padEl._pressLabel) {
        padEl._pressLabel.textContent = "×" + buttonPressCounts[idx];
      }

      updateCurrentRow(changedIndices);
      updateStatus();
    }

    function resetMachine() {
      currentState = new Array(machine.target.length).fill(0);
      pressCount = 0;
      buttonPressCounts.fill(0);
      pressCountEl.textContent = "0";
      Array.from(padsGridEl.children).forEach((pad) => {
        if (pad._pressLabel) pad._pressLabel.textContent = "×0";
      });
      updateCurrentRow();
      updateStatus();
    }

    function isSolved() {
      return currentState.every((v, i) => v === machine.target[i]);
    }

    function updateStatus() {
      const solved = isSolved();
      if (solved) {
        statusChipEl.textContent = "Locked in · Beat ready";
        statusChipEl.classList.remove("badge-warn");
        statusChipEl.classList.add("badge-ok");
        solvedNoteEl.textContent =
          pressCount <= machine.minPresses
            ? "Nice. You matched or beat the optimal press count."
            : `Solved, but you used ${pressCount - machine.minPresses} extra presses.`;
      } else {
        statusChipEl.textContent = "Not solved";
        statusChipEl.classList.remove("badge-ok");
        statusChipEl.classList.add("badge-warn");
        solvedNoteEl.textContent =
          "Try to match the target in as few presses as possible.";
      }
    }

    // simple replay of optimal sequence
    async function replayOptimal() {
      if (!machine.optimalCombo || machine.optimalCombo.length === 0) return;
      resetMachine();
      replayBtn.disabled = true;

      for (const idx of machine.optimalCombo) {
        await new Promise((resolve) => setTimeout(resolve, 260));
        pressButton(idx);
      }

      replayBtn.disabled = false;
    }

    replayBtn.addEventListener("click", replayOptimal);

    // ---------------------------
    // Init
    // ---------------------------
    function initMachineView() {
      patternLabelEl.textContent = "Target: " + machine.patternString;
      minPressesEl.textContent = machine.minPresses ?? "?";

      createLedRow(targetRowEl, machine.target);
      createLedRow(currentRowEl, currentState);
      renderPads();
      updateCurrentRow();
      updateStatus();
    }

    initMachineView();
  </script>
</body>
</html>
```

---

## 2. How to extend this

Once this is running, your next steps can be:

1. **Hook in real parsed input**
   Replace the hard-coded `machine` object with one built from your AoC input lines.

2. **Integrate the solver**

   * Given `target` and `buttons`, compute:

     * `minPresses`
     * `optimalCombo` (array of button indices)
   * Feed those into the view so `replayOptimal` works for any machine.

3. **Add navigation**

   * Wrap multiple `machine` objects in an array.
   * Add Next / Prev buttons to swap the active machine and call `initMachineView()` with new data.

If you want, I can next help with:

* A parser from your raw line format to `{ target, buttons, ... }`
* Or a small GF(2) solver in JS that plugs straight into this UI.
