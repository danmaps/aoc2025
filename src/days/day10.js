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
  
  return { patternString, target, buttons };
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

// Audio system for drum machine
const audioCache = new Map();
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
  
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  
  source.buffer = audioBuffer;
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.gain.value = volume;
  
  source.start(0);
}

// Default sounds for UI interactions
const sounds = {
  buttonPress: null,
  solved: null,
  transition: null
};

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
      .track-label {
        font-size: 0.75rem;
        color: #aaa;
        text-transform: uppercase;
        min-width: 50px;
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
    </style>
    
    <div class="machine-shell" data-machine="${machineIndex}">
      <header class="machine-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="play-machine-btn" title="Play this beat">▶</button>
          <div class="machine-title">Machine ${machineIndex + 1} / ${totalMachines}</div>
        </div>
        <div class="machine-meta">
          <div class="stat-pill">Presses: <span class="press-count">0</span></div>
          <div class="stat-pill">Min: <span>${minPresses !== null ? minPresses : '?'}</span></div>
        </div>
      </header>
      
      <section class="lights-panel">
        <div class="strip-block" style="grid-column: 1 / -1;">
          <div class="strip-label">
            <span>Drum Sequencer</span>
            <span style="font-size: 0.75rem; color: #aaa;">Pattern: ${patternString}</span>
          </div>
          <div class="sequencer-grid" style="display: grid; gap: 4px; margin-top: 8px;">
            <!-- Drum tracks will be inserted here -->
          </div>
          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span class="status-chip badge-warn">Not solved</span>
            <div style="display: flex; gap: 12px; align-items: center;">
              <div class="tempo-control" style="display: none;">
                <span class="tempo-label">Tempo</span>
                <div class="tempo-knob" title="Drag up/down to adjust tempo"></div>
                <span class="tempo-value">3</span>
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

function initMachine(container, machine, machineIndex, speedMultiplier = 1) {
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
  
  let currentState = Array(machine.target.length).fill(0);
  let pressCount = 0;
  const buttonPressCounts = Array(machine.buttons.length).fill(0);
  let isLooping = false;
  let loopInterval = null;
  let tempo = 3; // 1-10 scale, 3 is default
  
  // Determine sequencer dimensions (try to make it roughly 4 tracks × N steps)
  const numSteps = machine.target.length;
  const numTracks = Math.min(4, numSteps); // Max 4 drum tracks
  const stepsPerTrack = Math.ceil(numSteps / numTracks);
  
  // Track instrument selections
  const trackTypes = ['kick', 'snare', 'hat', 'perc'].slice(0, numTracks);
  const trackSounds = {};
  trackTypes.forEach((type, idx) => {
    trackSounds[idx] = { type, soundIdx: 0, audioBuffer: null };
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
  
  function createSequencer() {
    sequencerGrid.innerHTML = '';
    
    // Show 8 columns for patterns up to 8, otherwise 16 columns
    const totalColumns = numSteps > 8 ? 16 : 8;
    
    for (let trackIdx = 0; trackIdx < numTracks; trackIdx++) {
      const trackRow = document.createElement('div');
      trackRow.className = 'sequencer-track';
      
      // Track label
      const label = document.createElement('div');
      label.className = 'track-label';
      label.textContent = trackTypes[trackIdx].toUpperCase();
      trackRow.appendChild(label);
      
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
      trackRow.appendChild(selector);
      
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
        if (trackSounds[trackIdx] && trackSounds[trackIdx].audioBuffer && bit === 1) {
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
            if (trackSounds[trackIdx] && trackSounds[trackIdx].audioBuffer) {
              playSound(trackSounds[trackIdx].audioBuffer, 0.4);
            }
          }
        } else {
          led.classList.remove('playing');
        }
      });
      
      // Tempo affects loop speed: tempo 1 = slowest (500ms), tempo 10 = fastest (50ms)
      const tempoSpeed = 550 - (tempo * 50); // 500ms at tempo 1, 50ms at tempo 10
      await new Promise(resolve => setTimeout(resolve, tempoSpeed / speedMultiplier));
      
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
    
    const changedIndices = [];
    indices.forEach(i => {
      if (i >= 0 && i < currentState.length) {
        currentState[i] ^= 1;
        changedIndices.push(i);
      }
    });
    
    pressCountEl.textContent = String(pressCount);
    
    const padEl = padsGridEl.querySelector(`.pad:nth-child(${idx + 1})`);
    if (padEl && padEl._pressLabel) {
      padEl._pressLabel.textContent = '×' + buttonPressCounts[idx];
    }
    
    updateSequencer(changedIndices);
    updateStatus();
  }
  
  function resetMachine() {
    currentState = Array(machine.target.length).fill(0);
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
    updateSequencer();
    updateStatus();
  }
  
  function isSolved() {
    return currentState.every((v, i) => v === machine.target[i]);
  }
  
  function updateStatus() {
    const solved = isSolved();
    if (solved) {
      statusChipEl.textContent = 'Locked in · Beat ready';
      statusChipEl.classList.remove('badge-warn');
      statusChipEl.classList.add('badge-ok');
      solvedNoteEl.textContent = pressCount <= machine.minPresses
        ? 'Nice! You matched or beat the optimal press count.'
        : `Solved, but used ${pressCount - machine.minPresses} extra presses.`;
      loopBtn.style.display = 'inline-block';
      tempoControl.style.display = 'flex';
      playSolvedSound();
    } else {
      statusChipEl.textContent = 'Not solved';
      statusChipEl.classList.remove('badge-ok');
      statusChipEl.classList.add('badge-warn');
      solvedNoteEl.textContent = 'Try to match the target in as few presses as possible.';
      loopBtn.style.display = 'none';
    }
  }
  
  async function replayOptimal() {
    if (!machine.optimalCombo || machine.optimalCombo.length === 0) return;
    resetMachine();
    replayBtn.disabled = true;
    playMachineBtn.disabled = true;
    playMachineBtn.classList.add('playing');
    
    for (const idx of machine.optimalCombo) {
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
  let startTempo = 3;
  
  tempoKnob.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startTempo = tempo;
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY; // Inverted: drag up increases
    const sensitivity = 0.05;
    let newTempo = startTempo + deltaY * sensitivity;
    newTempo = Math.max(1, Math.min(10, newTempo));
    tempo = Math.round(newTempo);
    
    // Update knob rotation (270 degrees total range)
    const rotation = -135 + ((tempo - 1) / 9) * 270;
    tempoKnob.style.transform = `rotate(${rotation}deg)`;
    tempoValue.textContent = tempo;
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
  updateSequencer();
  updateStatus();
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
      });
      
      let currentMachineIndex = 0;
      let autoPlayInterval = null;
      
      function renderCurrentMachine() {
        resultsEl.innerHTML = `
          <div class="nav-controls">
            <button class="nav-btn" id="prev-machine">&larr; Previous</button>
            <button class="nav-btn auto-play" id="auto-play">▶ Auto Play All</button>
            <button class="nav-btn" id="next-machine">Next &rarr;</button>
          </div>
        ` + createMachineView(machines[currentMachineIndex], currentMachineIndex, machines.length);
        
        initMachine(resultsEl, machines[currentMachineIndex], currentMachineIndex, speedMultiplier);
        
        const prevBtn = document.getElementById('prev-machine');
        const nextBtn = document.getElementById('next-machine');
        const autoPlayBtn = document.getElementById('auto-play');
        
        prevBtn.disabled = currentMachineIndex === 0;
        nextBtn.disabled = currentMachineIndex === machines.length - 1;
        
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
      const results = machines.map((machine, idx) => {
        const result = solveGF2(machine.target, machine.buttons);
        if (result.minPresses !== null) {
          totalPresses += result.minPresses;
        }
        return { idx: idx + 1, machine, result };
      });
      
      let html = '<div style="background: #1a1a1a; padding: 1rem; border-radius: 8px; border: 1px solid #333;">';
      html += '<h3 style="color: #f4b43a; margin-top: 0;">Solution Results</h3>';
      
      results.forEach(({ idx, machine, result }) => {
        html += `<div style="margin-bottom: 0.5rem; color: #ccc;">`;
        html += `Machine ${idx}: ${machine.patternString} → `;
        if (result.minPresses !== null) {
          html += `<span style="color: #6fd37c; font-weight: 600;">${result.minPresses} presses</span>`;
          if (result.optimalCombo && result.optimalCombo.length > 0) {
            html += ` (buttons: ${result.optimalCombo.map(i => i + 1).join(', ')})`;
          }
        } else {
          html += `<span style="color: #ff6666;">No solution</span>`;
        }
        html += '</div>';
      });
      
      html += '<hr style="border: none; border-top: 1px solid #333; margin: 1rem 0;" />';
      html += `<div style="font-size: 1.2rem; color: #00cc00; font-weight: 600;">`;
      html += `Total minimum button presses: ${totalPresses}`;
      html += '</div>';
      html += '</div>';
      
      resultsEl.innerHTML = html;
    });
  }
};
