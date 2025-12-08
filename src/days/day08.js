// Union-Find (Disjoint Set Union) data structure
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = Array(n).fill(1);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a, b) {
    a = this.find(a);
    b = this.find(b);
    if (a === b) return false;
    if (this.size[a] < this.size[b]) [a, b] = [b, a];
    this.parent[b] = a;
    this.size[a] += this.size[b];
    return true;
  }

  getSize(x) {
    return this.size[this.find(x)];
  }
}

// Parse input and create nodes
function parseInput(input) {
  const lines = input.trim().split(/\r?\n/);
  const nodes = lines.map((line, id) => {
    const [x, y, z] = line.split(',').map(Number);
    return { id, x, y, z };
  });
  return nodes;
}

// Compute all pairwise distances and sort
function computeLinks(nodes, limit = null) {
  const allPairs = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      const dist2 = dx * dx + dy * dy + dz * dz;
      allPairs.push({ 
        source: a.id, 
        target: b.id, 
        dist2,
        dist: Math.sqrt(dist2)
      });
    }
  }
  allPairs.sort((a, b) => a.dist2 - b.dist2);
  return limit ? allPairs.slice(0, limit) : allPairs;
}

// Precompute state for each step
function precomputeStates(nodes, links) {
  const dsu = new DSU(nodes.length);
  const stepStates = [];

  for (let k = 0; k <= links.length; k++) {
    let lastConnection = null;
    if (k > 0) {
      const link = links[k - 1];
      const { source, target } = link;
      dsu.union(source, target);
      lastConnection = {
        sourceId: source,
        targetId: target,
        sourceX: nodes[source].x,
        targetX: nodes[target].x,
        product: nodes[source].x * nodes[target].x
      };
    }

    // Compute components at this step
    const roots = new Map();
    nodes.forEach(n => {
      const root = dsu.find(n.id);
      if (!roots.has(root)) roots.set(root, []);
      roots.get(root).push(n.id);
    });

    const components = Array.from(roots.values())
      .map(arr => ({ ids: arr, size: arr.length }))
      .sort((a, b) => b.size - a.size);

    const [c1, c2, c3] = components;
    const product = (c1?.size ?? 1) * (c2?.size ?? 1) * (c3?.size ?? 1);

    stepStates.push({ 
      k, 
      components, 
      product, 
      numCircuits: components.length,
      lastConnection
    });
  }

  return stepStates;
}

// Find when all boxes form a single circuit (Part 2)
function solvePart2(nodes, allLinks) {
  const dsu = new DSU(nodes.length);
  
  for (let i = 0; i < allLinks.length; i++) {
    const { source, target } = allLinks[i];
    dsu.union(source, target);
    
    // Check if all nodes are in the same component
    const root = dsu.find(0);
    if (dsu.getSize(root) === nodes.length) {
      // Found it! All boxes in one circuit
      return {
        step: i + 1,
        sourceId: source,
        targetId: target,
        sourceX: nodes[source].x,
        targetX: nodes[target].x,
        product: nodes[source].x * nodes[target].x
      };
    }
  }
  
  return null;
}

export default {
  title: '--- Day 8: Playground ---',
  description: '3D circuit visualization with junction boxes and light strings',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 8: Playground ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/8" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        
        <p>A vast underground space with a giant playground! Connect junction boxes with strings of lights, starting with the closest pairs. Build circuits until every box is electrified.</p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day08-input" 
            style="width: 100%; min-height: 120px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
            placeholder="162,817,812
57,618,57
906,360,560
..."
          ></textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day08-visualize" class="btn" style="margin-right: 0.5rem;">[Launch 3D Playground]</button>
            <button id="day08-solve" class="btn">[Solve]</button>
          </div>
        </div>

        <div id="day08-solution" style="margin-top:1rem;"></div>
        <div id="day08-3d-container" style="display:none;"></div>
      </div>
    `;
  },

  attachHandlers() {
    const inputEl = document.getElementById('day08-input');
    const visualizeBtn = document.getElementById('day08-visualize');
    const solveBtn = document.getElementById('day08-solve');
    const solutionEl = document.getElementById('day08-solution');
    const containerEl = document.getElementById('day08-3d-container');

    solveBtn?.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        solutionEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const nodes = parseInput(input);
        const linksFirst1000 = computeLinks(nodes, 1000);
        const allLinks = computeLinks(nodes);
        const states = precomputeStates(nodes, linksFirst1000);
        const finalState = states[1000];
        const part2 = solvePart2(nodes, allLinks);

        solutionEl.innerHTML = `
          <div class="code-block" style="margin-top:1rem;">
            <pre><strong style="color:#00cc00;">--- Part 1 ---</strong>
Junction boxes: ${nodes.length}
After 1000 connections:
  Circuits: ${finalState.numCircuits}
  Top 3 sizes: ${finalState.components.slice(0, 3).map(c => c.size).join(', ')}
  
<span style="color:#ffff66;">Part 1 Answer: ${finalState.product}</span>

<strong style="color:#00cc00;">--- Part 2 ---</strong>
Continue until all boxes form a single circuit...
  Connection #${part2.step} completes the circuit
  Last connection: Box ${part2.sourceId} (${part2.sourceX},*,*) ↔ Box ${part2.targetId} (${part2.targetX},*,*)
  X coordinates: ${part2.sourceX} × ${part2.targetX}
  
<span style="color:#ffff66;">Part 2 Answer: ${part2.product}</span></pre>
          </div>
        `;
      } catch (err) {
        solutionEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      }
    });

    visualizeBtn?.addEventListener('click', async () => {
      const input = inputEl.value.trim();
      if (!input) {
        solutionEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        // Parse and prepare data
        const nodes = parseInput(input);
        const linksP1 = computeLinks(nodes, 1000);
        const allLinks = computeLinks(nodes);
        const statesP1 = precomputeStates(nodes, linksP1);
        const statesP2 = precomputeStates(nodes, allLinks);
        const part2Info = solvePart2(nodes, allLinks);

        // Show container
        containerEl.style.display = 'block';
        containerEl.innerHTML = `
          <div style="margin-top: 1.5rem; border-top: 1px solid #333; padding-top: 1.5rem;">
            <h3 style="color: #00cc00;">3D Circuit Playground</h3>
            
            <div id="day08-viz-controls" style="margin: 1rem 0; padding: 1rem; background: #0a0a0a; border: 1px solid #333;">
              <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem;">
                <button id="day08-play" class="btn">[Play Part 1]</button>
                <button id="day08-play-p2" class="btn">[Play Part 2]</button>
                <button id="day08-pause" class="btn" disabled>[Pause]</button>
                <button id="day08-reset" class="btn">[Reset]</button>
                <button id="day08-toggle-mode" class="btn">[Toggle Mode]</button>
              </div>
              
              <div style="margin-bottom: 1rem;">
                <label style="color: #00cc00;">Step: <span id="day08-step-label">0</span> / <span id="day08-max-steps">1000</span></label>
                <input 
                  id="day08-step-slider" 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value="0" 
                  style="width: 100%; accent-color: #00cc00;"
                />
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; color: #cccccc; font-size: 0.9rem;">
                <div>
                  <div>Links: <span id="day08-links-count" style="color: #ffff66;">0</span></div>
                  <div>Circuits: <span id="day08-circuits-count" style="color: #ffff66;">0</span></div>
                </div>
                <div>
                  <div>Largest 3 circuits:</div>
                  <div style="color: #ffff66; font-family: monospace;" id="day08-top3">-</div>
                </div>
                <div>
                  <div>Product:</div>
                  <div style="color: #ffff66; font-size: 1.3rem; font-weight: bold;" id="day08-product">-</div>
                </div>
              </div>
            </div>

            <div id="day08-3d-graph" style="width: 100%; height: 600px; background: #0a0a0a; border: 1px solid #333; position: relative;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #00cc00; text-align: center;">
                <div style="font-size: 1.2rem; margin-bottom: 1rem;">Loading 3D Force Graph...</div>
                <div style="font-size: 0.9rem; color: #888;">This requires the 3d-force-graph library</div>
                <div style="margin-top: 1rem;">
                  <a href="https://unpkg.com/3d-force-graph" target="_blank" style="color: #009900;">3d-force-graph on unpkg</a>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 1rem; padding: 1rem; background: #0a0a0a; border: 1px solid #333; font-size: 0.9rem; color: #888;">
              <strong style="color: #00cc00;">Instructions:</strong>
              <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                <li>Use mouse to rotate, scroll to zoom</li>
                <li>Play to animate connections in shortest-first order</li>
                <li>Toggle Mode switches between fixed coordinates and force-directed layout</li>
                <li>Hero colors (gold, cyan, magenta) mark the three largest circuits</li>
              </ul>
            </div>
          </div>
        `;

        // Load 3d-force-graph library if needed
        await load3DForceGraph();

        // Initialize visualization
        initializeVisualization(nodes, linksP1, allLinks, statesP1, statesP2, part2Info);

      } catch (err) {
        containerEl.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
        console.error(err);
      }
    });
  }
};

// Load 3d-force-graph library dynamically
async function load3DForceGraph() {
  if (window.ForceGraph3D) return;

  return new Promise((resolve, reject) => {
    // Load Three.js first
    const three = document.createElement('script');
    three.src = 'https://unpkg.com/three@0.160.0/build/three.module.js';
    three.type = 'module';
    three.onerror = () => reject(new Error('Failed to load Three.js'));
    
    // Load 3d-force-graph
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/3d-force-graph@1.73.3/dist/3d-force-graph.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load 3d-force-graph'));
    
    document.head.appendChild(three);
    setTimeout(() => document.head.appendChild(script), 100);
  });
}

// Initialize the 3D visualization
function initializeVisualization(nodes, linksP1, linksP2, statesP1, statesP2, part2Info) {
  const graphEl = document.getElementById('day08-3d-graph');
  if (!graphEl || !window.ForceGraph3D) {
    graphEl.innerHTML = '<p style="color:red;">Failed to initialize 3D graph. Please refresh and try again.</p>';
    return;
  }

  // Scale coordinates to reasonable range
  const coords = nodes.flatMap(n => [n.x, n.y, n.z]);
  const minCoord = Math.min(...coords);
  const maxCoord = Math.max(...coords);
  const scale = 400 / (maxCoord - minCoord);

  nodes.forEach(n => {
    n.fx = (n.x - minCoord) * scale - 200;
    n.fy = (n.y - minCoord) * scale - 200;
    n.fz = (n.z - minCoord) * scale - 200;
    n.originalX = n.fx;
    n.originalY = n.fy;
    n.originalZ = n.fz;
  });

  // Hero colors for top 3 circuits
  const heroColors = ['#ffd166', '#06d6a0', '#ef476f'];

  // Create graph
  const Graph = ForceGraph3D()(graphEl)
    .graphData({ nodes: [], links: [] })
    .nodeRelSize(4)
    .nodeColor(node => node.color || '#555577')
    .linkWidth(0.5)
    .linkOpacity(0.6)
    .linkDirectionalParticles(2)
    .linkDirectionalParticleSpeed(0.005)
    .linkColor(link => link.color || 'rgba(255,255,255,0.3)')
    .backgroundColor('#0a0a0a')
    .d3VelocityDecay(1); // Freeze nodes since we use fx/fy/fz

  // Auto-rotation
  let angle = 0;
  setInterval(() => {
    angle += 0.3;
    const distance = 600;
    Graph.cameraPosition({
      x: distance * Math.sin(angle * Math.PI / 180),
      z: distance * Math.cos(angle * Math.PI / 180)
    });
  }, 50);

  // State
  let currentStep = 0;
  let isPlaying = false;
  let playInterval = null;
  let useFixedLayout = true;
  let isPart2 = false;
  let currentLinks = linksP1;
  let currentStates = statesP1;

  // UI elements
  const stepSlider = document.getElementById('day08-step-slider');
  const stepLabel = document.getElementById('day08-step-label');
  const maxStepsLabel = document.getElementById('day08-max-steps');
  const playBtn = document.getElementById('day08-play');
  const playP2Btn = document.getElementById('day08-play-p2');
  const pauseBtn = document.getElementById('day08-pause');
  const resetBtn = document.getElementById('day08-reset');
  const toggleModeBtn = document.getElementById('day08-toggle-mode');
  const linksCountEl = document.getElementById('day08-links-count');
  const circuitsCountEl = document.getElementById('day08-circuits-count');
  const top3El = document.getElementById('day08-top3');
  const productEl = document.getElementById('day08-product');

  // Apply state for a given step
  function applyStep(k) {
    currentStep = k;
    const state = currentStates[k];
    
    // Update UI
    stepSlider.value = k;
    stepLabel.textContent = k;
    linksCountEl.textContent = k;
    circuitsCountEl.textContent = state.numCircuits;
    
    const top3 = state.components.slice(0, 3).map(c => c.size);
    top3El.textContent = top3.join(', ');
    productEl.textContent = state.product;

    // Build node metadata
    const nodeMeta = new Map();
    state.components.forEach((comp, idx) => {
      comp.ids.forEach(id => {
        nodeMeta.set(id, {
          size: comp.size,
          heroIndex: idx < 3 ? idx : null,
          compIdx: idx
        });
      });
    });

    // Update node colors and sizes
    nodes.forEach(n => {
      const meta = nodeMeta.get(n.id);
      const baseSize = 1;
      n.__size = baseSize + Math.min(meta.size, 20) * 0.05;
      n.color = meta.heroIndex !== null ? heroColors[meta.heroIndex] : '#555577';
    });

    // Update link colors
    const displayLinks = currentLinks.slice(0, k).map(link => ({
      ...link,
      source: nodes[link.source],
      target: nodes[link.target]
    }));

    displayLinks.forEach(link => {
      const meta = nodeMeta.get(link.source.id);
      link.color = meta.heroIndex !== null 
        ? heroColors[meta.heroIndex] 
        : 'rgba(140,140,200,0.4)';
    });

    // Update graph
    Graph.graphData({ nodes, links: displayLinks });
  }

  // Play animation
  function play(part2 = false) {
    if (isPlaying) return;
    isPart2 = part2;
    currentLinks = part2 ? linksP2 : linksP1;
    currentStates = part2 ? statesP2 : statesP1;
    const maxSteps = part2 ? part2Info.step : 1000;
    
    stepSlider.max = maxSteps;
    maxStepsLabel.textContent = maxSteps;
    
    isPlaying = true;
    playBtn.disabled = true;
    playP2Btn.disabled = true;
    pauseBtn.disabled = false;

    playInterval = setInterval(() => {
      if (currentStep >= maxSteps) {
        pause();
        return;
      }
      applyStep(currentStep + 1);
    }, 1); // 50x faster (was 50ms, now 1ms)
  }

  function pause() {
    isPlaying = false;
    playBtn.disabled = false;
    playP2Btn.disabled = false;
    pauseBtn.disabled = true;
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  function reset() {
    pause();
    applyStep(0);
  }

  function toggleMode() {
    useFixedLayout = !useFixedLayout;
    
    if (useFixedLayout) {
      // Fixed coordinates
      nodes.forEach(n => {
        n.fx = n.originalX;
        n.fy = n.originalY;
        n.fz = n.originalZ;
      });
      toggleModeBtn.textContent = '[Mode: Fixed]';
    } else {
      // Force-directed
      nodes.forEach(n => {
        n.fx = undefined;
        n.fy = undefined;
        n.fz = undefined;
      });
      toggleModeBtn.textContent = '[Mode: Force]';
    }
    
    Graph.graphData(Graph.graphData());
  }

  // Event handlers
  playBtn?.addEventListener('click', () => play(false));
  playP2Btn?.addEventListener('click', () => play(true));
  pauseBtn?.addEventListener('click', pause);
  resetBtn?.addEventListener('click', reset);
  toggleModeBtn?.addEventListener('click', toggleMode);
  stepSlider?.addEventListener('input', (e) => {
    pause();
    applyStep(parseInt(e.target.value));
  });

  // Initialize at step 0
  applyStep(0);

  // Cleanup on navigation
  window.addEventListener('hashchange', () => {
    pause();
    if (Graph) {
      Graph._destructor?.();
    }
  }, { once: true });
}
