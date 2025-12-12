// Parser
function parseMachine(line) {
  const lightMatch = line.match(/\[([.#]+)\]/);
  if (!lightMatch) return null;
  
  const patternString = lightMatch[0];
  const target = lightMatch[1].split('').map(c => c === '#' ? 1 : 0);
  
  const buttons = [];
  const buttonRegex = /\(([0-9,]+)\)/g;
  let match;
  while ((match = buttonRegex.exec(line)) !== null) {
    const indices = match[1].split(',').map(Number);
    buttons.push(indices);
  }
  
  // Parse joltage requirements for Part 2
  const joltageMatch = line.match(/\{([0-9,]+)\}/);
  const joltageRequirements = joltageMatch 
    ? joltageMatch[1].split(',').map(Number)
    : null;
  
  return { patternString, target, buttons, joltageRequirements };
}

// GF(2) Gaussian elimination solver
function solveGF2(target, buttons) {
  const n = target.length;
  const m = buttons.length;
  
  if (m === 0) return { minPresses: target.some(x => x === 1) ? null : 0, solution: [] };
  
  const matrix = Array(n).fill(0).map(() => Array(m + 1).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      matrix[i][j] = buttons[j].includes(i) ? 1 : 0;
    }
    matrix[i][m] = target[i];
  }
  
  let pivotRow = 0;
  const pivotCols = [];
  
  for (let col = 0; col < m && pivotRow < n; col++) {
    let foundPivot = false;
    for (let row = pivotRow; row < n; row++) {
      if (matrix[row][col] === 1) {
        [matrix[pivotRow], matrix[row]] = [matrix[row], matrix[pivotRow]];
        foundPivot = true;
        break;
      }
    }
    
    if (!foundPivot) continue;
    
    pivotCols.push(col);
    
    for (let row = 0; row < n; row++) {
      if (row !== pivotRow && matrix[row][col] === 1) {
        for (let c = 0; c <= m; c++) {
          matrix[row][c] ^= matrix[pivotRow][c];
        }
      }
    }
    pivotRow++;
  }
  
  for (let row = pivotRow; row < n; row++) {
    if (matrix[row][m] === 1) {
      return { minPresses: null, solution: null };
    }
  }
  
  // Identify free variables (columns not used as pivots)
  const freeVars = [];
  for (let col = 0; col < m; col++) {
    if (!pivotCols.includes(col)) {
      freeVars.push(col);
    }
  }
  
  // Try all combinations of free variables to find minimum
  let minPresses = Infinity;
  let bestSolution = null;
  
  const numCombinations = 1 << freeVars.length;
  
  for (let combo = 0; combo < numCombinations; combo++) {
    const solution = Array(m).fill(0);
    
    // Set free variables according to this combination
    for (let i = 0; i < freeVars.length; i++) {
      solution[freeVars[i]] = (combo >> i) & 1;
    }
    
    // Back-substitute to find dependent variables
    for (let i = pivotCols.length - 1; i >= 0; i--) {
      const col = pivotCols[i];
      let val = matrix[i][m];
      for (let j = col + 1; j < m; j++) {
        val ^= (matrix[i][j] * solution[j]);
      }
      solution[col] = val;
    }
    
    const presses = solution.reduce((sum, x) => sum + x, 0);
    if (presses < minPresses) {
      minPresses = presses;
      bestSolution = solution;
    }
  }
  
  const optimalCombo = bestSolution.map((v, i) => v === 1 ? i : -1).filter(i => i >= 0);
  
  return { minPresses, solution: bestSolution, optimalCombo };
}

// Part 2: Integer solver for joltage counters
// Solve Ax = b where A is button matrix, b is target, x is button presses
// Using Gaussian elimination + DFS over free variables with bounds
function solveJoltage(joltageRequirements, buttons) {
  const R = joltageRequirements.length; // rows (counters)
  const C = buttons.length; // columns (buttons)
  
  console.log('Solving joltage:', { R, C, targets: joltageRequirements });
  
  if (C === 0) return { minPresses: null, solution: null, optimalCombo: [] };
  
  // Build matrix A where A[r][c] = 1 if button c affects counter r
  const matrix = Array(R).fill(0).map(() => Array(C).fill(0));
  const bounds = Array(C).fill(Infinity);
  
  for (let c = 0; c < C; c++) {
    if (buttons[c].length > 0) {
      for (const r of buttons[c]) {
        if (r < R) {
          matrix[r][c] = 1;
          // Button c can't be pressed more than the smallest target it affects
          bounds[c] = Math.min(bounds[c], joltageRequirements[r]);
        }
      }
    } else {
      bounds[c] = 0; // Useless button
    }
  }
  
  // Set any remaining infinity bounds to 0
  for (let c = 0; c < C; c++) {
    if (bounds[c] === Infinity) bounds[c] = 0;
  }
  
  // Copy for Gaussian elimination
  const matrixCopy = matrix.map(row => [...row]);
  const rhs = [...joltageRequirements];
  
  // Gaussian elimination
  const pivotCols = [];
  let pivotRow = 0;
  const colToPivotRow = new Map();
  
  for (let col = 0; col < C && pivotRow < R; col++) {
    // Find pivot
    let sel = pivotRow;
    while (sel < R && Math.abs(matrixCopy[sel][col]) < 1e-9) sel++;
    
    if (sel === R) continue; // No pivot in this column
    
    // Swap rows
    [matrixCopy[pivotRow], matrixCopy[sel]] = [matrixCopy[sel], matrixCopy[pivotRow]];
    [rhs[pivotRow], rhs[sel]] = [rhs[sel], rhs[pivotRow]];
    
    // Normalize pivot row
    const pivotVal = matrixCopy[pivotRow][col];
    for (let j = col; j < C; j++) {
      matrixCopy[pivotRow][j] /= pivotVal;
    }
    rhs[pivotRow] /= pivotVal;
    
    // Eliminate column in other rows
    for (let i = 0; i < R; i++) {
      if (i === pivotRow) continue;
      const factor = matrixCopy[i][col];
      if (Math.abs(factor) > 1e-9) {
        for (let j = col; j < C; j++) {
          matrixCopy[i][j] -= factor * matrixCopy[pivotRow][j];
        }
        rhs[i] -= factor * rhs[pivotRow];
      }
    }
    
    pivotCols.push(col);
    colToPivotRow.set(col, pivotRow);
    pivotRow++;
  }
  
  // Check consistency
  for (let i = pivotRow; i < R; i++) {
    if (Math.abs(rhs[i]) > 1e-4) {
      console.log('Inconsistent system - no solution');
      return { minPresses: null, solution: null, optimalCombo: [] };
    }
  }
  
  // Identify free variables
  const isPivot = new Set(pivotCols);
  const freeVars = [];
  for (let j = 0; j < C; j++) {
    if (!isPivot.has(j)) freeVars.push(j);
  }
  
  console.log('System structure:', { pivots: pivotCols.length, freeVars: freeVars.length });
  
  // DFS over free variables to find minimum cost solution
  let best = Infinity;
  const curSol = Array(C).fill(0);
  
  function search(idx, cost) {
    if (cost >= best) return;
    
    if (idx === freeVars.length) {
      // All free vars assigned, now back-solve pivots
      let total = cost;
      let ok = true;
      
      for (let i = pivotCols.length - 1; i >= 0; i--) {
        const col = pivotCols[i];
        const row = colToPivotRow.get(col);
        
        let v = rhs[row];
        for (let j = col + 1; j < C; j++) {
          if (Math.abs(matrixCopy[row][j]) > 1e-9) {
            v -= matrixCopy[row][j] * curSol[j];
          }
        }
        
        // Check if v is integer
        if (Math.abs(v - Math.round(v)) > 1e-4) {
          ok = false;
          break;
        }
        v = Math.round(v);
        
        // Check bounds
        if (v < 0 || v > bounds[col]) {
          ok = false;
          break;
        }
        
        curSol[col] = v;
        total += v;
        
        if (total >= best) {
          ok = false;
          break;
        }
      }
      
      if (ok) {
        best = total;
        console.log('Found solution:', { total, solution: [...curSol] });
      }
      return;
    }
    
    const varIndex = freeVars[idx];
    const limit = bounds[varIndex];
    
    for (let v = 0; v <= limit; v++) {
      curSol[varIndex] = v;
      search(idx + 1, cost + v);
    }
  }
  
  search(0, 0);
  
  if (best === Infinity) {
    console.log('No valid solution found');
    return { minPresses: null, solution: null, optimalCombo: [] };
  }
  
  const optimalCombo = [];
  for (let j = 0; j < C; j++) {
    for (let k = 0; k < curSol[j]; k++) {
      optimalCombo.push(j);
    }
  }
  
  console.log('Solution complete:', { minPresses: best, solution: curSol });
  return { minPresses: best, solution: curSol, optimalCombo };
}

// Audio system for drum machine
const audioCache = new Map();
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioUnlockEvents = ['pointerdown', 'touchstart', 'keydown'];
let audioUnlockPending = false;

function handleAudioUnlock() {
  if (audioCtx.state !== 'suspended') {
    if (typeof window !== 'undefined') {
      audioUnlockEvents.forEach(evt => window.removeEventListener(evt, handleAudioUnlock));
    }
    return;
  }

  if (audioUnlockPending) return;
  audioUnlockPending = true;

  audioCtx.resume()
    .then(() => {
      audioUnlockPending = false;
      if (typeof window !== 'undefined') {
        audioUnlockEvents.forEach(evt => window.removeEventListener(evt, handleAudioUnlock));
      }
    })
    .catch(error => {
      audioUnlockPending = false;
      console.warn('Unable to resume audio context:', error);
    });
}

if (typeof window !== 'undefined' && audioCtx.state === 'suspended') {
  audioUnlockEvents.forEach(evt => window.addEventListener(evt, handleAudioUnlock));
}

// Available drum sounds
const drumSounds = {
  kick: [
    'Kick%20-%20Neato.wav',
    'Kick%20-%201985.wav',
    'Kick%20-%20Boiler.wav',
    'Kick%20-%20Devastate.wav',
    'Kick%20-%20Juicy.wav',
    'Kick%20-%20Hard.wav',
    'Kick%20-%20Thumpster.wav'
  ],
  snare: [
    'Snare%20-%20Eight%20Oh%20Eight!.wav',
    'Snare%20-%20Analog.wav',
    'Snare%20-%20Crushed.wav',
    'Snare%20-%20Slammer.wav',
    'Snare%20-%20OG.wav',
    'Snare%20-%20Tight.wav',
    'Snare%20-%20Urban.wav'
  ],
  hat: [
    'Hats%20-%20Sweet.wav',
    'Hats%20-%20Sizzle.wav',
    'Hats%20-%20Metal.wav',
    'Hats%20-%20Vinyl.wav',
    'Hats%20-%20Wonky.wav',
    'Hats%20-%20Zippo.wav',
    'Hats%20-%20Noise.wav'
  ],
  perc: [
    'Perc%20-%20Analog%201.wav',
    'Perc%20-%20Digital%20Noise.wav',
    'Perc%20-%20Kung%20Fu.wav',
    'Perc%20-%20Skipper.wav',
    'Perc%20-%20Springboard.wav',
    'Perc%20-%20Tambo.wav',
    'Perc%20-%20Wobble.wav'
  ],
  clap: [
    'Clap%20-%20Neat.wav',
    'Clap%20-%20Crackle%201.wav',
    'Clap%20-%20Giannis.wav',
    'Clap%20-%20Vinyl%201.wav',
    'Clap%20-%20Tape.wav',
    'Clap%20-%20Flange.wav',
    'Clap%20-%20Liquid.wav'
  ]
};

async function loadSound(url) {
  if (audioCache.has(url)) {
    return audioCache.get(url);
  }
  
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCache.set(url, audioBuffer);
    return audioBuffer;
  } catch (error) {
    console.warn('Failed to load sound:', url, error);
    return null;
  }
}

function playSound(audioBuffer, volume = 1) {
  if (!audioBuffer) return;
  
  const startPlayback = () => {
    const source = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();
    
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = volume;
    
    source.start(0);
  };
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(startPlayback).catch(error => {
      console.warn('Unable to start audio playback:', error);
    });
  } else {
    startPlayback();
  }
}

// Default sounds for UI interactions
const sounds = {
  buttonPress: null,
  solved: null,
  transition: null
};

const TEMPO_MIN_BPM = 60;
const TEMPO_MAX_BPM = 180;
const TEMPO_DEFAULT_BPM = 120;
const TEMPO_STEPS_PER_BEAT = 4; // 16th-note grid

(async () => {
  sounds.buttonPress = await loadSound('../src/assets/' + drumSounds.kick[0]);
  sounds.solved = await loadSound('../src/assets/' + drumSounds.snare[0]);
  sounds.transition = await loadSound('../src/assets/' + drumSounds.hat[0]);
})();

function playButtonPress() {
  // Pick a random sound from all drum categories
  const categories = ['kick', 'snare', 'hat', 'perc', 'clap'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const soundList = drumSounds[randomCategory];
  const randomSound = soundList[Math.floor(Math.random() * soundList.length)];
  
  loadSound('../src/assets/' + randomSound).then(buffer => {
    if (buffer) playSound(buffer, 0.3);
  });
}

function playSolvedSound() {
  playSound(sounds.solved, 0.5);
}

function playMachineTransition() {
  playSound(sounds.transition, 0.2);
}

// Machine Visualizer
function createMachineView(machine, machineIndex, totalMachines) {
  const { patternString, target, buttons, minPresses, optimalCombo } = machine;
  
  return `
    <style>
      .machine-shell {
        width: 100%;
        max-width: 900px;
        margin: 0 auto 2rem;
        background: #202020;
        border-radius: 12px;
        border: 1px solid #383838;
        padding: 16px;
      }
      .machine-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: linear-gradient(120deg, #2b2b2b, #222);
        border-radius: 8px;
      }
      .machine-title {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        color: #f4b43a;
      }
      .machine-meta {
        display: flex;
        gap: 12px;
        font-size: 0.8rem;
      }
      .stat-pill {
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid #383838;
        background: #1b1b1b;
        color: #aaa;
      }
      .stat-pill span {
        color: #f4b43a;
        font-weight: 600;
      }
      .lights-panel {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }
      .sequencer-track {
        display: grid;
        grid-template-columns: auto auto 1fr;
        gap: 8px;
        align-items: center;
        padding: 6px;
        background: #1a1a1a;
        border-radius: 6px;
      }
      .sequencer-track.track-disabled {
        opacity: 0.5;
      }
      .track-label {
        font-size: 0.75rem;
        color: #aaa;
        text-transform: uppercase;
        min-width: 50px;
      }
      .track-controls {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .track-toggle {
        background: #142a14;
        border: 1px solid #1f4c24;
        color: #7dff9b;
        font-size: 0.7rem;
        padding: 4px 8px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .track-toggle.off {
        background: #2b1a1a;
        border-color: #513030;
        color: #ff9b7d;
        opacity: 0.75;
      }
      .track-selector {
        background: #252525;
        border: 1px solid #383838;
        color: #f4b43a;
        font-size: 0.7rem;
        padding: 4px 6px;
        border-radius: 4px;
        cursor: pointer;
        min-width: 120px;
      }
      .track-selector:hover {
        background: #2a2a2a;
      }
      .track-solo-btn {
        background: #1a1a2b;
        border: 1px solid #2f2f60;
        color: #9fd1ff;
        font-size: 0.7rem;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .track-solo-btn.active {
        background: #2f4065;
        color: #fff;
        border-color: #4f7edb;
        box-shadow: 0 0 6px rgba(79,126,219,0.4);
      }
      .step-indicator {
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #00ff00;
        border-radius: 6px;
        opacity: 0;
        pointer-events: none;
      }
      .led.playing .step-indicator {
        opacity: 1;
      }
      .strip-block {
        background: #252525;
        border-radius: 10px;
        padding: 12px;
        border: 1px solid #383838;
      }
      .strip-label {
        font-size: 0.75rem;
        color: #aaa;
        text-transform: uppercase;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
      }
      .pattern-controls {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
      }
      .pattern-controls .btn-ghost {
        font-size: 0.72rem;
        padding: 4px 8px;
      }
      .strip-row {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;
      }
      .strip-row:last-child {
        margin-bottom: 0;
      }
      .strip-row-title {
        font-size: 0.8rem;
        color: #aaa;
        text-transform: uppercase;
        min-width: 70px;
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
        background: #353535;
        box-shadow: inset 0 0 0 1px #111;
        position: relative;
      }
      .led.puzzle-light {
        background: #2a2a3a;
        border: 1px solid #4a4a6a;
      }
      .led.extension-light {
        background: #252525;
        border: 1px solid #1a1a1a;
        opacity: 0.6;
      }
      .led.on {
        background: radial-gradient(circle at 30% 20%, #ffe7a0, #f4b43a 55%, #845a1a 100%);
        box-shadow: 0 0 10px rgba(244, 180, 58, 0.7), inset 0 0 0 1px rgba(0, 0, 0, 0.7);
      }
      .led.puzzle-light.on {
        background: radial-gradient(circle at 30% 20%, #ffe7a0, #f4b43a 55%, #845a1a 100%);
        box-shadow: 0 0 10px rgba(244, 180, 58, 0.7), inset 0 0 0 1px rgba(0, 0, 0, 0.7);
        border: 1px solid #f4b43a;
      }
      .led.extension-light.on {
        background: radial-gradient(circle at 30% 20%, #a0e7ff, #3ab4f4 55%, #1a5a84 100%);
        box-shadow: 0 0 10px rgba(58, 180, 244, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.7);
        opacity: 1;
        border: 1px solid #3ab4f4;
      }
      .led.flash {
        animation: ledFlash 0.18s ease-out;
      }
      @keyframes ledFlash {
        from { transform: scale(1.15); }
        to { transform: scale(1); }
      }
      .pads-panel {
        background: #252525;
        border-radius: 10px;
        padding: 12px;
        border: 1px solid #383838;
      }
      .pads-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .pads-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 10px;
        margin-bottom: 8px;
      }
      .pad {
        background: #2d2d2d;
        border-radius: 10px;
        padding: 8px;
        border: 1px solid #111;
        box-shadow: 0 3px 0 #050505;
        cursor: pointer;
        transform: translateY(0);
        transition: all 0.07s ease-out;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .pad:hover {
        background: #343434;
      }
      .pad:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 #050505;
      }
      .pad.active {
        background: #3d3d3d;
      }
      .pad-top {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
      }
      .pad-id {
        font-weight: 600;
        color: #f8f8f2;
      }
      .pad-presses {
        color: #aaa;
        font-variant-numeric: tabular-nums;
      }
      .pad-body {
        font-size: 0.7rem;
        color: #aaa;
        letter-spacing: 0.05em;
        line-height: 1.4;
        overflow: hidden;
        word-break: break-all;
      }
      .pad-body span {
        color: #f4b43a;
        font-size: 0.85rem;
      }
      .pads-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        color: #aaa;
      }
      .status-chip {
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid #383838;
        background: #1b1b1b;
      }
      .badge-ok {
        color: #6fd37c;
      }
      .badge-warn {
        color: #ff6666;
      }
      .btn-ghost {
        font-size: 0.75rem;
        border-radius: 999px;
        padding: 4px 10px;
        border: 1px solid #383838;
        background: #151515;
        color: #e0e0e0;
        cursor: pointer;
      }
      .btn-ghost:hover {
        background: #202020;
      }
      .nav-controls {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 1rem;
      }
      .nav-btn {
        font-size: 0.8rem;
        border-radius: 6px;
        padding: 6px 12px;
        border: 1px solid #383838;
        background: #202020;
        color: #e0e0e0;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .nav-btn:hover {
        background: #2a2a2a;
        border-color: #f4b43a;
      }
      .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .nav-btn.auto-play {
        background: #f4b43a;
        color: #000;
        font-weight: 600;
      }
      .nav-btn.auto-play:hover {
        background: #ffcd5a;
      }
      .play-machine-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #f4b43a;
        background: transparent;
        color: #f4b43a;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;
        padding-left: 2px;
      }
      .play-machine-btn:hover {
        background: #f4b43a;
        color: #000;
        transform: scale(1.1);
      }
      .play-machine-btn:active {
        transform: scale(0.95);
      }
      .play-machine-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        transform: scale(1);
      }
      .play-machine-btn.playing {
        background: #f4b43a;
        color: #000;
        animation: pulse 1s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .tempo-control {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tempo-knob {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #3a3a3a, #1a1a1a);
        border: 2px solid #383838;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1);
        position: relative;
        cursor: pointer;
        user-select: none;
        transition: transform 0.1s ease;
      }
      .tempo-knob:hover {
        border-color: #f4b43a;
      }
      .tempo-knob::after {
        content: '';
        position: absolute;
        top: 4px;
        left: 50%;
        transform: translateX(-50%);
        width: 3px;
        height: 12px;
        background: #f4b43a;
        border-radius: 2px;
      }
      .tempo-label {
        font-size: 0.7rem;
        color: #aaa;
        text-transform: uppercase;
      }
      .tempo-value {
        font-size: 0.75rem;
        color: #f4b43a;
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }
      .mode-switch {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 6px 10px;
        background: #1a1a1a;
        border-radius: 8px;
        border: 1px solid #383838;
      }
      .mode-switch-label {
        font-size: 0.7rem;
        color: #aaa;
        text-transform: uppercase;
      }
      .mode-toggle {
        position: relative;
        width: 50px;
        height: 24px;
        background: #2a2a2a;
        border-radius: 12px;
        border: 1px solid #383838;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .mode-toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: #f4b43a;
        border-radius: 50%;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      .mode-toggle.joltage {
        background: #1a2a3a;
      }
      .mode-toggle.joltage::after {
        left: 28px;
        background: #3ab4f4;
      }
      .mode-switch-text {
        font-size: 0.75rem;
        color: #f4b43a;
        font-weight: 600;
        min-width: 80px;
      }
      .mode-switch-text.joltage {
        color: #3ab4f4;
      }
      .meter-container {
        display: flex;
        gap: 12px;
        justify-content: center;
        padding: 16px;
        background: #1a1a1a;
        border-radius: 8px;
      }
      .meter {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .meter-label {
        font-size: 0.7rem;
        color: #aaa;
        text-transform: uppercase;
      }
      .meter-bar {
        width: 40px;
        height: 150px;
        background: #0a0a0a;
        border: 2px solid #383838;
        border-radius: 6px;
        position: relative;
        overflow: hidden;
      }
      .meter-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, #1a4a6a, #3ab4f4);
        transition: height 0.3s ease;
        border-radius: 4px;
      }
      .meter-fill.complete {
        background: linear-gradient(to top, #1a6a4a, #3af4b4);
      }
      .meter-value {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.9rem;
        font-weight: 600;
        color: #fff;
        text-shadow: 0 0 4px rgba(0,0,0,0.8);
        z-index: 2;
      }
      .meter-target {
        font-size: 0.75rem;
        color: #3ab4f4;
        font-weight: 600;
      }
    </style>
    
    <div class="machine-shell" data-machine="${machineIndex}">
      <header class="machine-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="play-machine-btn" title="Play this beat">▶</button>
          <div class="machine-title">Machine ${machineIndex + 1} / ${totalMachines}</div>
        </div>
        <div class="machine-meta">
          <div class="stat-pill">Presses: <span class="press-count">0</span></div>
          <div class="stat-pill">Min: <span class="min-presses-display">${minPresses !== null ? minPresses : '?'}</span></div>
        </div>
      </header>
      
      <section class="lights-panel">
        <div class="strip-block" style="grid-column: 1 / -1;">
          <div class="strip-label">
            <span class="mode-title">Drum Sequencer</span>
            <span style="font-size: 0.75rem; color: #aaa;" class="mode-subtitle">Pattern: ${patternString}</span>
          </div>
          <div class="sequencer-grid" style="display: grid; gap: 4px; margin-top: 8px;">
            <!-- Drum tracks will be inserted here -->
          </div>
          <div class="pattern-controls">
            <button class="btn-ghost pattern-clear-btn">Clear</button>
            <button class="btn-ghost pattern-random-btn">Randomize</button>
          </div>
          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span class="status-chip badge-warn">Not solved</span>
            <div style="display: flex; gap: 12px; align-items: center;">
              <div class="tempo-control" style="display: none;">
                <span class="tempo-label">Tempo</span>
                <div class="tempo-knob" title="Drag up/down to adjust tempo"></div>
                <span class="tempo-value">${TEMPO_DEFAULT_BPM} BPM</span>
              </div>
              <button class="btn-ghost loop-btn" style="display: none;">🔄 Loop</button>
            </div>
          </div>
        </div>
      </section>
      
      <section class="pads-panel">
        <div class="pads-header">
          <span class="strip-label">Buttons</span>
          <button class="btn-ghost replay-btn">Replay Optimal</button>
        </div>
        <div class="pads-grid"></div>
        <div class="pads-footer">
          <span class="solved-note">Try to match the target in as few presses as possible.</span>
        </div>
      </section>
    </div>
  `;
}

function initMachine(container, machine, machineIndex, speedMultiplier = 1, initialMode = 'lights') {
  const shell = container.querySelector(`[data-machine="${machineIndex}"]`);
  if (!shell) return;
  
  const sequencerGrid = shell.querySelector('.sequencer-grid');
  const padsGridEl = shell.querySelector('.pads-grid');
  const pressCountEl = shell.querySelector('.press-count');
  const statusChipEl = shell.querySelector('.status-chip');
  const solvedNoteEl = shell.querySelector('.solved-note');
  const replayBtn = shell.querySelector('.replay-btn');
  const playMachineBtn = shell.querySelector('.play-machine-btn');
  const loopBtn = shell.querySelector('.loop-btn');
  const tempoControl = shell.querySelector('.tempo-control');
  const tempoKnob = shell.querySelector('.tempo-knob');
  const tempoValue = shell.querySelector('.tempo-value');
  const modeTitle = shell.querySelector('.mode-title');
  const modeSubtitle = shell.querySelector('.mode-subtitle');
  const minPressesDisplay = shell.querySelector('.min-presses-display');
  const patternControlsEl = shell.querySelector('.pattern-controls');
  const clearPatternBtn = shell.querySelector('.pattern-clear-btn');
  const randomPatternBtn = shell.querySelector('.pattern-random-btn');
  
  let currentMode = initialMode; // 'lights' or 'joltage'
  let currentState = Array(machine.target.length).fill(0);
  let joltageCounters = machine.joltageRequirements ? Array(machine.joltageRequirements.length).fill(0) : [];
  let pressCount = 0;
  const buttonPressCounts = Array(machine.buttons.length).fill(0);
  let isLooping = false;
  let loopInterval = null;
  let tempoBpm = TEMPO_DEFAULT_BPM;
  
  // Store initial mode in dataset for external access
  shell.dataset.currentMode = currentMode;
  
  // Determine sequencer dimensions (try to make it roughly 4 tracks × N steps)
  const numSteps = machine.target.length;
  const numTracks = Math.min(4, numSteps); // Max 4 drum tracks
  const stepsPerTrack = Math.ceil(numSteps / numTracks);
  
  // Track instrument selections
  const trackTypes = ['kick', 'snare', 'hat', 'perc'].slice(0, numTracks);
  const trackSounds = {};
  const trackControls = {};
  let soloTrack = null;
  trackTypes.forEach((type, idx) => {
    trackSounds[idx] = { type, soundIdx: 0, audioBuffer: null, enabled: true };
  });
  
  // Load initial sounds
  async function loadTrackSounds() {
    for (let i = 0; i < numTracks; i++) {
      const track = trackSounds[i];
      const soundFile = drumSounds[track.type][track.soundIdx];
      track.audioBuffer = await loadSound('../src/assets/' + soundFile);
    }
  }
  loadTrackSounds();
  
  function shouldPlayTrack(trackIdx) {
    const track = trackSounds[trackIdx];
    if (!track || !track.enabled) return false;
    return soloTrack === null || soloTrack === trackIdx;
  }
  
  function refreshTrackControls() {
    Object.keys(trackControls).forEach(key => {
      const idx = parseInt(key, 10);
      const refs = trackControls[idx];
      const track = trackSounds[idx];
      if (!refs || !track) return;
      refs.row.classList.toggle('track-disabled', !track.enabled);
      refs.toggleBtn.textContent = track.enabled ? 'ON' : 'OFF';
      refs.toggleBtn.classList.toggle('off', !track.enabled);
      refs.toggleBtn.setAttribute('aria-pressed', track.enabled ? 'true' : 'false');
      refs.soloBtn.classList.toggle('active', soloTrack === idx);
    });
  }
  
  function setSoloTrack(idx) {
    soloTrack = soloTrack === idx ? null : idx;
    refreshTrackControls();
  }
  
  function clearSequencerPattern() {
    if (!sequencerGrid) return;
    currentState = Array(machine.target.length).fill(0);
    const leds = sequencerGrid.querySelectorAll('.led');
    leds.forEach(led => {
      led.classList.remove('on', 'flash', 'playing');
    });
    updateSequencer();
    updateStatus();
  }
  
  async function randomizeTrackInstruments() {
    const trackIndices = Object.keys(trackSounds);
    for (const key of trackIndices) {
      const trackIdx = parseInt(key, 10);
      const track = trackSounds[trackIdx];
      if (!track) continue;
      const soundList = drumSounds[track.type];
      if (!soundList || !soundList.length) continue;
      const randomIdx = Math.floor(Math.random() * soundList.length);
      track.soundIdx = randomIdx;
      const soundFile = soundList[randomIdx];
      const refs = trackControls[trackIdx];
      if (refs && refs.selector) {
        refs.selector.value = String(randomIdx);
      }
      track.audioBuffer = await loadSound('../src/assets/' + soundFile);
    }
  }
  
  function randomizeSequencerTracks(density = 0.4) {
    if (currentMode !== 'lights' || !sequencerGrid) return;
    const leds = Array.from(sequencerGrid.querySelectorAll('.led'));
    const puzzleState = currentState.slice();
    
    leds.forEach(led => {
      led.classList.remove('flash');
      const bitIndex = parseInt(led.dataset.bitIndex, 10);
      
      if (led.classList.contains('puzzle-light')) {
        if (!Number.isNaN(bitIndex) && bitIndex < puzzleState.length) {
          const active = puzzleState[bitIndex] === 1;
          led.classList.toggle('on', active);
        }
        return;
      }
      
      const active = Math.random() < density;
      led.classList.toggle('on', active);
    });
    
    updateStatus();
  }
  
  if (clearPatternBtn) {
    clearPatternBtn.addEventListener('click', () => {
      if (currentMode !== 'lights') return;
      clearSequencerPattern();
    });
  }
  
  if (randomPatternBtn) {
    randomPatternBtn.addEventListener('click', async () => {
      if (currentMode !== 'lights') return;
      randomizeSequencerTracks(0.5);
      await randomizeTrackInstruments();
    });
  }
  
  if (patternControlsEl) {
    patternControlsEl.style.display = currentMode === 'lights' ? 'flex' : 'none';
  }
  
  function syncTempoUI() {
    if (!tempoKnob || !tempoValue) return;
    const rotationRange = 270;
    const normalized = (tempoBpm - TEMPO_MIN_BPM) / (TEMPO_MAX_BPM - TEMPO_MIN_BPM);
    const rotation = -135 + normalized * rotationRange;
    tempoKnob.style.transform = `rotate(${rotation}deg)`;
    tempoValue.textContent = `${tempoBpm} BPM`;
  }
  
  function setTempoBpm(newBpm) {
    const clamped = Math.max(TEMPO_MIN_BPM, Math.min(TEMPO_MAX_BPM, newBpm));
    tempoBpm = Math.round(clamped);
    syncTempoUI();
  }
  
  syncTempoUI();
  
  // Mode switching
  function switchMode(newMode) {
    currentMode = newMode;
    
    if (patternControlsEl) {
      patternControlsEl.style.display = newMode === 'lights' ? 'flex' : 'none';
    }
    
    if (newMode === 'joltage') {
      modeTitle.textContent = 'Voltage Monitors';
      modeSubtitle.textContent = machine.joltageRequirements ? 
        `Requirements: {${machine.joltageRequirements.join(',')}}` : 
        'No joltage data';
      
      // Hide sequencer, show meters
      sequencerGrid.parentElement.style.display = 'none';
      
      // Create meters if they don't exist
      if (!shell.querySelector('.meter-container')) {
        const metersHtml = createMeters();
        const metersDiv = document.createElement('div');
        metersDiv.innerHTML = metersHtml;
        sequencerGrid.parentElement.parentElement.appendChild(metersDiv.firstElementChild);
      } else {
        shell.querySelector('.meter-container').style.display = 'flex';
      }
      
      // Recalculate min presses for joltage mode
      if (machine.joltageRequirements) {
        const joltageResult = solveJoltage(machine.joltageRequirements, machine.buttons);
        machine.minPressesJoltage = joltageResult.minPresses;
        machine.optimalComboJoltage = joltageResult.optimalCombo;
        minPressesDisplay.textContent = machine.minPressesJoltage !== null ? machine.minPressesJoltage : '?';
      }
      
      resetMachine();
      updateMeters();
      
    } else {
      modeTitle.textContent = 'Drum Sequencer';
      modeSubtitle.textContent = `Pattern: ${machine.patternString}`;
      
      // Show sequencer, hide meters
      sequencerGrid.parentElement.style.display = 'block';
      const meterContainer = shell.querySelector('.meter-container');
      if (meterContainer) {
        meterContainer.style.display = 'none';
      }
      
      minPressesDisplay.textContent = machine.minPresses !== null ? machine.minPresses : '?';
      resetMachine();
      updateSequencer();
    }
  }
  
  // Expose switchMode function for external control
  shell.switchToMode = switchMode;
  
  function createMeters() {
    if (!machine.joltageRequirements) return '';
    
    const meters = machine.joltageRequirements.map((target, idx) => `
      <div class="meter">
        <div class="meter-target">Target: ${target}</div>
        <div class="meter-bar">
          <div class="meter-fill" data-meter="${idx}"></div>
          <div class="meter-value" data-meter-value="${idx}">0</div>
        </div>
        <div class="meter-label">Counter ${idx}</div>
      </div>
    `).join('');
    
    return `<div class="meter-container">${meters}</div>`;
  }
  
  function updateMeters() {
    if (!machine.joltageRequirements) return;
    
    machine.joltageRequirements.forEach((target, idx) => {
      const fillEl = shell.querySelector(`.meter-fill[data-meter="${idx}"]`);
      const valueEl = shell.querySelector(`.meter-value[data-meter-value="${idx}"]`);
      
      if (fillEl && valueEl) {
        const current = joltageCounters[idx];
        const percentage = Math.min(100, (current / target) * 100);
        fillEl.style.height = percentage + '%';
        valueEl.textContent = current;
        
        if (current === target) {
          fillEl.classList.add('complete');
        } else {
          fillEl.classList.remove('complete');
        }
      }
    });
  }
  
  function createSequencer() {
    sequencerGrid.innerHTML = '';
    Object.keys(trackControls).forEach(key => delete trackControls[key]);
    
    // Show 8 columns for patterns up to 8, otherwise 16 columns
    const totalColumns = numSteps > 8 ? 16 : 8;
    
    for (let trackIdx = 0; trackIdx < numTracks; trackIdx++) {
      const trackRow = document.createElement('div');
      trackRow.className = 'sequencer-track';
      trackRow.dataset.trackIdx = trackIdx;
      
      // Track label
      const label = document.createElement('div');
      label.className = 'track-label';
      label.textContent = trackTypes[trackIdx].toUpperCase();
      trackRow.appendChild(label);
      
      const controlsCluster = document.createElement('div');
      controlsCluster.className = 'track-controls';
      
      const powerToggle = document.createElement('button');
      powerToggle.className = 'track-toggle';
      powerToggle.type = 'button';
      powerToggle.textContent = 'ON';
      powerToggle.setAttribute('aria-pressed', 'true');
      powerToggle.addEventListener('click', () => {
        trackSounds[trackIdx].enabled = !trackSounds[trackIdx].enabled;
        if (!trackSounds[trackIdx].enabled && soloTrack === trackIdx) {
          soloTrack = null;
        }
        refreshTrackControls();
      });
      controlsCluster.appendChild(powerToggle);
      
      // Instrument selector
      const selector = document.createElement('select');
      selector.className = 'track-selector';
      const soundList = drumSounds[trackTypes[trackIdx]];
      soundList.forEach((sound, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = sound.replace(/%20/g, ' ').replace('.wav', '').replace(trackTypes[trackIdx].charAt(0).toUpperCase() + trackTypes[trackIdx].slice(1) + ' - ', '');
        selector.appendChild(option);
      });
      selector.addEventListener('change', async (e) => {
        trackSounds[trackIdx].soundIdx = parseInt(e.target.value);
        const soundFile = soundList[trackSounds[trackIdx].soundIdx];
        trackSounds[trackIdx].audioBuffer = await loadSound('../src/assets/' + soundFile);
      });
      controlsCluster.appendChild(selector);
      
      const soloBtn = document.createElement('button');
      soloBtn.className = 'track-solo-btn';
      soloBtn.type = 'button';
      soloBtn.textContent = 'Solo';
      soloBtn.addEventListener('click', () => {
        setSoloTrack(trackIdx);
      });
      controlsCluster.appendChild(soloBtn);
      
      trackControls[trackIdx] = {
        row: trackRow,
        toggleBtn: powerToggle,
        soloBtn,
        selector
      };
      
      trackRow.appendChild(controlsCluster);
      
      // Step LEDs - always 8 columns
      const stepsContainer = document.createElement('div');
      stepsContainer.className = 'led-row';
      stepsContainer.style.flex = '1';
      
      for (let step = 0; step < totalColumns; step++) {
        const bitIndex = trackIdx * stepsPerTrack + step;
        
        const led = document.createElement('div');
        led.className = 'led';
        led.dataset.trackIdx = trackIdx;
        led.dataset.step = step;
        led.dataset.bitIndex = bitIndex;
        
        // Only mark first track (trackIdx === 0) lights as puzzle-relevant
        if (trackIdx === 0 && bitIndex < numSteps) {
          led.classList.add('puzzle-light');
        } else {
          led.classList.add('extension-light');
        }
        
        // Make lights clickable to toggle
        led.style.cursor = 'pointer';
        led.addEventListener('click', () => {
          const isOn = led.classList.contains('on');
          led.classList.toggle('on', !isOn);
          
          // Update currentState if this is a puzzle light (first track only)
          if (trackIdx === 0 && bitIndex < currentState.length) {
            currentState[bitIndex] = isOn ? 0 : 1;
            updateStatus();
          }
        });
        
        const indicator = document.createElement('div');
        indicator.className = 'step-indicator';
        led.appendChild(indicator);
        
        stepsContainer.appendChild(led);
      }
      
      trackRow.appendChild(stepsContainer);
      sequencerGrid.appendChild(trackRow);
    }
    
    refreshTrackControls();
  }
  
  function updateSequencer(flashIndices = []) {
    const leds = sequencerGrid.querySelectorAll('.led');
    currentState.forEach((bit, idx) => {
      const led = Array.from(leds).find(l => parseInt(l.dataset.bitIndex) === idx);
      if (!led) return;
      led.classList.toggle('on', bit === 1);
      if (flashIndices.includes(idx)) {
        led.classList.remove('flash');
        void led.offsetWidth;
        led.classList.add('flash');
        
        // Play sound for this track
        const trackIdx = parseInt(led.dataset.trackIdx);
        if (trackSounds[trackIdx] && trackSounds[trackIdx].audioBuffer && bit === 1 && shouldPlayTrack(trackIdx)) {
          playSound(trackSounds[trackIdx].audioBuffer, 0.4);
        }
      }
    });
  }
  
  async function playSequence() {
    const leds = sequencerGrid.querySelectorAll('.led');
    const maxSteps = Math.max(...Array.from(leds).map(l => parseInt(l.dataset.step))) + 1;
    
    for (let step = 0; step < maxSteps; step++) {
      // Highlight current step
      leds.forEach(led => {
        if (parseInt(led.dataset.step) === step) {
          led.classList.add('playing');
          // Play if active
          if (led.classList.contains('on')) {
            const trackIdx = parseInt(led.dataset.trackIdx);
            if (trackSounds[trackIdx] && trackSounds[trackIdx].audioBuffer && shouldPlayTrack(trackIdx)) {
              playSound(trackSounds[trackIdx].audioBuffer, 0.4);
            }
          }
        } else {
          led.classList.remove('playing');
        }
      });
      
      // Each grid step is a 16th note relative to the BPM
      const stepDurationMs = (60000 / tempoBpm) / TEMPO_STEPS_PER_BEAT;
      await new Promise(resolve => setTimeout(resolve, stepDurationMs));
      
      if (!isLooping) {
        leds.forEach(led => led.classList.remove('playing'));
        break;
      }
    }
    
    if (isLooping) {
      playSequence(); // Loop
    }
  }
  
  function padIdFromIndex(i) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const rowLetter = String.fromCharCode('A'.charCodeAt(0) + row);
    return rowLetter + (col + 1);
  }
  
  function renderPads() {
    padsGridEl.innerHTML = '';
    machine.buttons.forEach((btn, idx) => {
      const pad = document.createElement('button');
      pad.className = 'pad';
      
      const padTop = document.createElement('div');
      padTop.className = 'pad-top';
      
      const padId = document.createElement('span');
      padId.className = 'pad-id';
      padId.textContent = padIdFromIndex(idx);
      
      const padPresses = document.createElement('span');
      padPresses.className = 'pad-presses';
      padPresses.textContent = '×0';
      
      padTop.appendChild(padId);
      padTop.appendChild(padPresses);
      
      const padBody = document.createElement('div');
      padBody.className = 'pad-body';
      
      // Create visual representation with circles
      const circles = Array(machine.target.length).fill(0).map((_, i) => 
        btn.includes(i) ? '⏺' : '○'
      ).join('');
      
      padBody.innerHTML = '<span>' + circles + '</span>';
      
      pad.appendChild(padTop);
      pad.appendChild(padBody);
      
      pad.addEventListener('click', () => {
        pressButton(idx);
        pad.classList.add('active');
        setTimeout(() => pad.classList.remove('active'), 120);
      });
      
      pad._pressLabel = padPresses;
      padsGridEl.appendChild(pad);
    });
  }
  
  function pressButton(idx) {
    const indices = machine.buttons[idx];
    pressCount += 1;
    buttonPressCounts[idx] += 1;
    
    playButtonPress();
    
    if (currentMode === 'lights') {
      // Part 1: XOR toggle
      const changedIndices = [];
      indices.forEach(i => {
        if (i >= 0 && i < currentState.length) {
          currentState[i] ^= 1;
          changedIndices.push(i);
        }
      });
      updateSequencer(changedIndices);
    } else {
      // Part 2: Increment counters
      indices.forEach(i => {
        if (i >= 0 && i < joltageCounters.length) {
          joltageCounters[i] += 1;
        }
      });
      updateMeters();
    }
    
    pressCountEl.textContent = String(pressCount);
    
    const padEl = padsGridEl.querySelector(`.pad:nth-child(${idx + 1})`);
    if (padEl && padEl._pressLabel) {
      padEl._pressLabel.textContent = '×' + buttonPressCounts[idx];
    }
    
    updateStatus();
  }
  
  function resetMachine() {
    currentState = Array(machine.target.length).fill(0);
    joltageCounters = machine.joltageRequirements ? Array(machine.joltageRequirements.length).fill(0) : [];
    pressCount = 0;
    buttonPressCounts.fill(0);
    pressCountEl.textContent = '0';
    Array.from(padsGridEl.children).forEach(pad => {
      if (pad._pressLabel) pad._pressLabel.textContent = '×0';
    });
    isLooping = false;
    loopBtn.textContent = '🔄 Loop';
    loopBtn.style.display = 'none';
    tempoControl.style.display = 'none';
    
    if (currentMode === 'lights') {
      updateSequencer();
    } else {
      updateMeters();
    }
    updateStatus();
  }
  
  function isSolved() {
    if (currentMode === 'lights') {
      return currentState.every((v, i) => v === machine.target[i]);
    } else {
      return machine.joltageRequirements && 
        joltageCounters.every((v, i) => v === machine.joltageRequirements[i]);
    }
  }
  
  function updateStatus() {
    const solved = isSolved();
    const minPresses = currentMode === 'lights' ? machine.minPresses : machine.minPressesJoltage;
    
    if (solved) {
      statusChipEl.textContent = currentMode === 'lights' ? 'Locked in · Beat ready' : 'Voltage configured ⚡';
      statusChipEl.classList.remove('badge-warn');
      statusChipEl.classList.add('badge-ok');
      
      if (minPresses !== null && pressCount <= minPresses) {
        solvedNoteEl.textContent = 'Nice! You matched or beat the optimal press count.';
      } else if (minPresses !== null) {
        solvedNoteEl.textContent = `Solved, but used ${pressCount - minPresses} extra presses.`;
      } else {
        solvedNoteEl.textContent = 'Solved!';
      }
      
      loopBtn.style.display = currentMode === 'lights' ? 'inline-block' : 'none';
      tempoControl.style.display = currentMode === 'lights' ? 'flex' : 'none';
      playSolvedSound();
    } else {
      statusChipEl.textContent = currentMode === 'lights' ? 'Not solved' : 'Adjusting voltage...';
      statusChipEl.classList.remove('badge-ok');
      statusChipEl.classList.add('badge-warn');
      solvedNoteEl.textContent = currentMode === 'lights' 
        ? 'Try to match the target in as few presses as possible.'
        : 'Press buttons to increment counters to target values.';
      loopBtn.style.display = 'none';
    }
  }
  
  async function replayOptimal() {
    const combo = currentMode === 'lights' ? machine.optimalCombo : machine.optimalComboJoltage;
    if (!combo || combo.length === 0) return;
    
    resetMachine();
    replayBtn.disabled = true;
    playMachineBtn.disabled = true;
    playMachineBtn.classList.add('playing');
    
    for (const idx of combo) {
      await new Promise(resolve => setTimeout(resolve, 260 / speedMultiplier));
      
      // Visually press the pad
      const padEl = padsGridEl.querySelector(`.pad:nth-child(${idx + 1})`);
      if (padEl) {
        padEl.classList.add('active');
        setTimeout(() => padEl.classList.remove('active'), 120 / speedMultiplier);
      }
      
      pressButton(idx);
    }
    
    replayBtn.disabled = false;
    playMachineBtn.disabled = false;
    playMachineBtn.classList.remove('playing');
  }
  
  replayBtn.addEventListener('click', replayOptimal);
  playMachineBtn.addEventListener('click', replayOptimal);
  
  // Tempo knob drag control
  let isDragging = false;
  let startY = 0;
  let startTempoBpm = tempoBpm;
  const tempoDragSensitivity = 0.6;
  
  if (tempoKnob) {
    tempoKnob.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startTempoBpm = tempoBpm;
      e.preventDefault();
    });
  }
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY; // drag up increases tempo
    const newTempo = startTempoBpm + deltaY * tempoDragSensitivity;
    setTempoBpm(newTempo);
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    loopBtn.textContent = isLooping ? '⏸ Stop' : '🔄 Loop';
    if (isLooping) {
      playSequence();
    }
  });
  
  createSequencer();
  renderPads();
  
  // Apply initial mode if not lights
  if (initialMode === 'joltage' && machine.joltageRequirements) {
    switchMode('joltage');
  } else {
    updateSequencer();
    updateStatus();
  }
}

export default {
  title: 'Day 10: Factory',
  description: 'Configure indicator lights with minimum button presses',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 10: Factory ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/10" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        
        <p style="color: #cccccc; line-height: 1.6;">
          Configure factory machines by toggling indicator lights with buttons. 
          Each button toggles specific lights. Find the minimum button presses needed 
          to match the target pattern for all machines.
        </p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day10-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
            placeholder="[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}"
          ></textarea>
          <div style="margin-top: 0.5rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <button id="day10-visualize" class="btn">[Visualize Machines]</button>
            <button id="day10-solve" class="btn">[Solve All]</button>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
              <label for="day10-speed" style="color: #aaa; font-size: 0.85rem;">Speed:</label>
              <input 
                type="range" 
                id="day10-speed" 
                min="0.5" 
                max="10" 
                step="0.5" 
                value="1" 
                style="width: 120px; cursor: pointer;"
              />
              <span id="day10-speed-label" style="color: #f4b43a; font-size: 0.85rem; min-width: 40px;">1x</span>
            </div>
          </div>
        </div>

        <div id="day10-results" style="margin-top:1rem;"></div>

        <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #333;">
          <h3 style="color: #f4b43a;">&gt; How This Works</h3>
          
          <div style="color: #cccccc; line-height: 1.7; margin-top: 1rem;">
            <h4 style="color: #00cc00; margin-top: 1.5rem; margin-bottom: 0.5rem;">Part 1: Indicator Lights (XOR)</h4>
            <p style="margin-bottom: 0.75rem;">
              The indicator lights problem is modeled over <strong>GF(2)</strong> (the Galois field with 2 elements), 
              where each light is either ON or OFF, and each button press <em>toggles</em> (XOR) specific lights.
            </p>
            <p style="margin-bottom: 0.75rem;">
              We build a system of linear equations: <code>A × x = b</code> where:
            </p>
            <ul style="margin-left: 1.5rem; margin-bottom: 0.75rem;">
              <li><code>A[i][j] = 1</code> if button j affects light i (XOR toggle)</li>
              <li><code>b[i]</code> = target state for light i (1 if target is ON, 0 if OFF)</li>
              <li><code>x[j]</code> = number of presses for button j (mod 2, so 0 or 1)</li>
            </ul>
            <p style="margin-bottom: 0.75rem;">
              Using Gaussian elimination over GF(2), we identify <strong>pivot variables</strong> (uniquely determined) 
              and <strong>free variables</strong> (can be 0 or 1). We try all combinations of free variables and find 
              the solution that minimizes total button presses.
            </p>

            <h4 style="color: #3af4b4; margin-top: 1.5rem; margin-bottom: 0.5rem;">Part 2: Joltage Counters (Addition)</h4>
            <p style="margin-bottom: 0.75rem;">
              The joltage counters problem is an <strong>integer linear programming</strong> (ILP) problem where 
              each button press <em>increments</em> specific counters by 1.
            </p>
            <p style="margin-bottom: 0.75rem;">
              We solve: <code>A × x = b</code> with <code>x[j] ≥ 0</code> (non-negative integers), minimizing <code>Σx[j]</code>:
            </p>
            <ul style="margin-left: 1.5rem; margin-bottom: 0.75rem;">
              <li><code>A[i][j] = 1</code> if button j increments counter i</li>
              <li><code>b[i]</code> = target value for counter i</li>
              <li><code>x[j]</code> = number of times to press button j</li>
            </ul>
            <p style="margin-bottom: 0.75rem;">
              <strong>Key insight:</strong> For each button j, we compute an upper bound 
              <code>bounds[j] = min(b[i])</code> for all counters i that button j affects. 
              Since pressing a button more than the smallest target it affects would inevitably overshoot, 
              this bound is mathematically sound.
            </p>
            <p style="margin-bottom: 0.75rem;">
              Using Gaussian elimination over ℝ (real numbers), we identify pivot and free variables, 
              then perform <strong>depth-first search</strong> over all integer assignments to free variables 
              within their bounds. For each assignment, we back-substitute to solve for pivot variables and 
              check if they're non-negative integers within bounds. The solution with minimum total presses wins.
            </p>

            <div style="margin-top: 1.5rem; padding: 0.75rem; background: #1a1a1a; border-left: 3px solid #f4b43a;">
              <p style="margin: 0; color: #aaa;">
                <strong style="color: #f4b43a;">Credit:</strong> The Part 2 solution algorithm is adapted from 
                <a href="https://github.com/Cinnamonsroll/AdventOfCode2025/blob/main/day10/part2.ts" 
                   target="_blank" 
                   style="color: #3af4b4; text-decoration: underline;">
                  Cinnamonsroll's TypeScript solution
                </a>, 
                which elegantly demonstrates the "Gaussian elimination + bounded DFS" approach for solving 
                restricted integer linear systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day10-input');
    const visualizeBtn = document.getElementById('day10-visualize');
    const solveBtn = document.getElementById('day10-solve');
    const resultsEl = document.getElementById('day10-results');
    const speedSlider = document.getElementById('day10-speed');
    const speedLabel = document.getElementById('day10-speed-label');
    
    let speedMultiplier = 1;
    let globalMode = 'lights'; // Global mode for all machines
    
    speedSlider.addEventListener('input', (e) => {
      speedMultiplier = parseFloat(e.target.value);
      speedLabel.textContent = speedMultiplier + 'x';
    });
    
    const exampleInput = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`;
    
    if (!inputEl.value.trim()) {
      inputEl.value = exampleInput;
    }

    visualizeBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const lines = input.split('\n').filter(l => l.trim());
      const machines = lines.map(parseMachine).filter(m => m !== null);
      
      if (machines.length === 0) {
        resultsEl.innerHTML = '<p style="color:orange;">No valid machines found in input.</p>';
        return;
      }
      
      machines.forEach(machine => {
        const result = solveGF2(machine.target, machine.buttons);
        machine.minPresses = result.minPresses;
        machine.optimalCombo = result.optimalCombo || [];
        
        // Also solve Part 2 if joltage requirements exist
        if (machine.joltageRequirements) {
          const joltageResult = solveJoltage(machine.joltageRequirements, machine.buttons);
          machine.minPressesJoltage = joltageResult.minPresses;
          machine.optimalComboJoltage = joltageResult.optimalCombo || [];
        }
      });
      
      let currentMachineIndex = 0;
      let autoPlayInterval = null;
      
      function renderCurrentMachine() {
        resultsEl.innerHTML = `
          <div class="nav-controls">
            <button class="nav-btn" id="prev-machine">&larr; Previous</button>
            <button class="nav-btn auto-play" id="auto-play">▶ Auto Play All</button>
            <button class="nav-btn" id="next-machine">Next &rarr;</button>
            <div class="mode-switch" style="margin-left: auto;">
              <span class="mode-switch-label">Mode:</span>
              <div class="mode-toggle" id="global-mode-toggle" title="Switch between Lights and Joltage mode"></div>
              <span class="mode-switch-text" id="mode-switch-text">${globalMode === 'lights' ? 'Lights' : 'Joltage'}</span>
            </div>
          </div>
        ` + createMachineView(machines[currentMachineIndex], currentMachineIndex, machines.length);
        
        initMachine(resultsEl, machines[currentMachineIndex], currentMachineIndex, speedMultiplier, globalMode);
        
        // Update global mode toggle appearance
        const modeToggle = document.getElementById('global-mode-toggle');
        const modeSwitchText = document.getElementById('mode-switch-text');
        if (globalMode === 'joltage') {
          modeToggle.classList.add('joltage');
          modeSwitchText.classList.add('joltage');
        }
        
        const prevBtn = document.getElementById('prev-machine');
        const nextBtn = document.getElementById('next-machine');
        const autoPlayBtn = document.getElementById('auto-play');
        const globalModeToggle = document.getElementById('global-mode-toggle');
        const globalModeSwitchText = document.getElementById('mode-switch-text');
        
        prevBtn.disabled = currentMachineIndex === 0;
        nextBtn.disabled = currentMachineIndex === machines.length - 1;
        
        // Global mode toggle handler
        globalModeToggle.addEventListener('click', () => {
          const currentMachine = machines[currentMachineIndex];
          if (globalMode === 'lights' && !currentMachine.joltageRequirements) {
            alert('No joltage requirements available for this machine');
            return;
          }
          
          globalMode = globalMode === 'lights' ? 'joltage' : 'lights';
          globalModeToggle.classList.toggle('joltage');
          globalModeSwitchText.classList.toggle('joltage');
          globalModeSwitchText.textContent = globalMode === 'lights' ? 'Lights' : 'Joltage';
          
          // Switch current machine's mode
          const shell = resultsEl.querySelector('.machine-shell');
          if (shell && shell.switchToMode) {
            shell.switchToMode(globalMode);
          }
        });
        
        prevBtn.addEventListener('click', () => {
          if (currentMachineIndex > 0) {
            currentMachineIndex--;
            renderCurrentMachine();
            playMachineTransition();
          }
        });
        
        nextBtn.addEventListener('click', () => {
          if (currentMachineIndex < machines.length - 1) {
            currentMachineIndex++;
            renderCurrentMachine();
            playMachineTransition();
          }
        });
        
        autoPlayBtn.addEventListener('click', async () => {
          if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            autoPlayBtn.textContent = '▶ Auto Play All';
            return;
          }
          
          autoPlayBtn.textContent = '⏸ Pause';
          
          // Start from first machine
          if (currentMachineIndex !== 0) {
            currentMachineIndex = 0;
            renderCurrentMachine();
          }
          
          // Auto-play through all machines
          async function playNextMachine() {
            const shell = resultsEl.querySelector('.machine-shell');
            const replayBtn = shell?.querySelector('.replay-btn');
            
            if (replayBtn) {
              replayBtn.click();
              await new Promise(resolve => setTimeout(resolve, (machines[currentMachineIndex].optimalCombo.length * 300 + 500) / speedMultiplier));
            }
            
            if (currentMachineIndex < machines.length - 1) {
              currentMachineIndex++;
              renderCurrentMachine();
              playMachineTransition();
              await new Promise(resolve => setTimeout(resolve, 500 / speedMultiplier));
              
              if (autoPlayInterval) {
                playNextMachine();
              }
            } else {
              autoPlayInterval = null;
              const autoPlayBtnNew = document.getElementById('auto-play');
              if (autoPlayBtnNew) {
                autoPlayBtnNew.textContent = '▶ Auto Play All';
              }
            }
          }
          
          autoPlayInterval = true;
          playNextMachine();
        });
      }
      
      function fadeOutAndTransition(callback) {
        callback();
      }
      
      renderCurrentMachine();
    });

    solveBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }
      
      const lines = input.split('\n').filter(l => l.trim());
      const machines = lines.map(parseMachine).filter(m => m !== null);
      
      if (machines.length === 0) {
        resultsEl.innerHTML = '<p style="color:orange;">No valid machines found in input.</p>';
        return;
      }
      
      let totalPresses = 0;
      let totalJoltagePresses = 0;
      const results = machines.map((machine, idx) => {
        const result = solveGF2(machine.target, machine.buttons);
        if (result.minPresses !== null) {
          totalPresses += result.minPresses;
        }
        
        let joltageResult = null;
        if (machine.joltageRequirements) {
          joltageResult = solveJoltage(machine.joltageRequirements, machine.buttons);
          if (joltageResult.minPresses !== null) {
            totalJoltagePresses += joltageResult.minPresses;
          }
        }
        
        return { idx: idx + 1, machine, result, joltageResult };
      });
      
      let html = '<div style="background: #1a1a1a; padding: 1rem; border-radius: 8px; border: 1px solid #333;">';
      html += '<h3 style="color: #f4b43a; margin-top: 0;">Solution Results</h3>';
      
      html += '<h4 style="color: #f4b43a; margin-top: 1rem;">Part 1: Indicator Lights (XOR)</h4>';
      results.forEach(({ idx, machine, result }) => {
        html += `<div style="margin-bottom: 0.5rem; color: #ccc;">`;
        html += `Machine ${idx}: ${machine.patternString} → `;
        if (result.minPresses !== null) {
          html += `<span style="color: #6fd37c; font-weight: 600;">${result.minPresses} presses</span>`;
        } else {
          html += `<span style="color: #ff6666;">No solution</span>`;
        }
        html += '</div>';
      });
      
      html += '<div style="margin-top: 1rem; font-size: 1.1rem; color: #00cc00; font-weight: 600;">';
      html += `Part 1 Total: ${totalPresses} presses`;
      html += '</div>';
      
      // Part 2 results
      const hasJoltage = results.some(r => r.joltageResult !== null);
      if (hasJoltage) {
        html += '<h4 style="color: #3ab4f4; margin-top: 1.5rem;">Part 2: Joltage Counters (Addition)</h4>';
        results.forEach(({ idx, machine, joltageResult }) => {
          if (joltageResult) {
            html += `<div style="margin-bottom: 0.5rem; color: #ccc;">`;
            html += `Machine ${idx}: {${machine.joltageRequirements.join(',')}} → `;
            if (joltageResult.minPresses !== null) {
              html += `<span style="color: #3af4b4; font-weight: 600;">${joltageResult.minPresses} presses</span>`;
            } else {
              html += `<span style="color: #ff6666;">No solution</span>`;
            }
            html += '</div>';
          }
        });
        
        html += '<div style="margin-top: 1rem; font-size: 1.1rem; color: #3af4b4; font-weight: 600;">';
        html += `Part 2 Total: ${totalJoltagePresses} presses`;
        html += '</div>';
      }
      
      html += '</div>';
      resultsEl.innerHTML = html;
    });
  }
};
