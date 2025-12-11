function parseInput(input) {
  const lines = input.trim().split('\n');
  const graph = new Map();
  
  for (const line of lines) {
    const [device, outputsStr] = line.split(':');
    const outputs = outputsStr.trim().split(/\s+/);
    graph.set(device.trim(), outputs);
  }
  
  return graph;
}

function findAllPaths(graph, start = 'you', end = 'out', mustVisit = []) {
  const paths = [];
  
  function dfs(current, path, visited) {
    if (current === end) {
      const fullPath = [...path, current];
      
      // Check if path visits all required nodes
      if (mustVisit.length === 0 || mustVisit.every(node => fullPath.includes(node))) {
        paths.push(fullPath);
      }
      return;
    }
    
    if (visited.has(current)) {
      return;
    }
    
    const outputs = graph.get(current);
    if (!outputs) {
      return;
    }
    
    visited.add(current);
    
    for (const next of outputs) {
      dfs(next, [...path, current], new Set(visited));
    }
  }
  
  dfs(start, [], new Set());
  return paths;
}

function countPathsWithRequired(graph, start, end, required) {
  const memo = new Map();
  
  function walk(device, visitedFlags) {
    // Update visited flags for current device first
    const newFlags = [...visitedFlags];
    required.forEach((req, idx) => {
      if (device === req) newFlags[idx] = true;
    });
    
    if (device === end) {
      // Check if all required nodes have been visited
      return newFlags.every(flag => flag) ? 1 : 0;
    }
    
    // Create memoization key with the NEW flags (after visiting this node)
    const key = `${device}|${newFlags.join(',')}`;
    if (memo.has(key)) {
      return memo.get(key);
    }
    
    let totalPaths = 0;
    const outputs = graph.get(device);
    if (outputs) {
      for (const next of outputs) {
        totalPaths += walk(next, newFlags);
      }
    }
    
    memo.set(key, totalPaths);
    return totalPaths;
  }
  
  // Initialize flags: false for each required node
  const initialFlags = required.map(() => false);
  return walk(start, initialFlags);
}

function buildGraphData(graph, paths, mustVisit = []) {
  const nodes = new Map();
  const links = [];
  const pathSet = new Set();
  
  paths.forEach((path, idx) => {
    for (let i = 0; i < path.length - 1; i++) {
      pathSet.add(`${path[i]}->${path[i+1]}`);
    }
  });
  
  for (const [device, outputs] of graph.entries()) {
    if (!nodes.has(device)) {
      nodes.set(device, {
        id: device,
        name: device,
        isStart: device === 'you' || device === 'svr',
        isEnd: device === 'out',
        isMustVisit: mustVisit.includes(device),
        pathCount: 0
      });
    }
    
    for (const output of outputs) {
      if (!nodes.has(output)) {
        nodes.set(output, {
          id: output,
          name: output,
          isStart: output === 'you' || output === 'svr',
          isEnd: output === 'out',
          isMustVisit: mustVisit.includes(output),
          pathCount: 0
        });
      }
      
      const linkKey = `${device}->${output}`;
      const isInPath = pathSet.has(linkKey);
      
      links.push({
        source: device,
        target: output,
        isInPath
      });
    }
  }
  
  paths.forEach(path => {
    path.forEach(node => {
      if (nodes.has(node)) {
        nodes.get(node).pathCount++;
      }
    });
  });
  
  return {
    nodes: Array.from(nodes.values()),
    links
  };
}

let graphInstance = null;
let isSpinning = false;

function createVisualization(graphData, paths, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  if (!window.ForceGraph3D) {
    container.innerHTML = '<p style="color:orange;">Loading 3D Force Graph library...</p>';
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/3d-force-graph@1.73.3/dist/3d-force-graph.min.js';
    script.onload = () => {
      createVisualization(graphData, paths, containerId);
    };
    document.head.appendChild(script);
    return;
  }
  
  const width = container.offsetWidth || 800;
  const height = 600;
  
  if (graphInstance) {
    graphInstance._destructor();
    graphInstance = null;
  }
  
  graphInstance = window.ForceGraph3D()(container)
    .width(width)
    .height(height)
    .graphData(graphData)
    .nodeLabel(node => {
      const type = node.isStart ? ' (START)' : node.isEnd ? ' (END)' : node.isMustVisit ? ' (REQUIRED)' : '';
      return `${node.name}${type}\nPaths: ${node.pathCount}`;
    })
    .nodeColor(node => {
      if (node.isStart) return '#00ff00';
      if (node.isEnd) return '#ff0000';
      if (node.isMustVisit) return '#ff00ff';
      if (node.pathCount > 0) return '#ffaa00';
      return '#666666';
    })
    .nodeVal(node => {
      if (node.isStart || node.isEnd) return 8;
      return 4 + node.pathCount;
    })
    .linkColor(link => link.isInPath ? '#00ffff' : '#333333')
    .linkWidth(link => link.isInPath ? 2 : 1)
    .linkDirectionalArrowLength(3.5)
    .linkDirectionalArrowRelPos(1)
    .linkOpacity(link => link.isInPath ? 0.8 : 0.3)
    .backgroundColor('#0a0a0a')
    .enableNodeDrag(true)
    .enableNavigationControls(true)
    .showNavInfo(false);
  
  setTimeout(() => {
    graphInstance.zoomToFit(400);
  }, 100);
  
  // Set up spin animation
  if (isSpinning) {
    startSpin();
  }
}

function startSpin() {
  if (!graphInstance) return;
  
  // Get current camera position to maintain distance and y-position
  const currentPos = graphInstance.cameraPosition();
  const distance = Math.sqrt(currentPos.x ** 2 + currentPos.y ** 2 + currentPos.z ** 2);
  const yPosition = currentPos.y;
  
  // Calculate initial angle from current position
  let angle = Math.atan2(currentPos.x, currentPos.z) * 180 / Math.PI;
  
  const animate = () => {
    if (!isSpinning || !graphInstance) return;
    
    angle += 0.3;
    const radians = angle * Math.PI / 180;
    
    graphInstance.cameraPosition({
      x: distance * Math.sin(radians),
      y: yPosition,
      z: distance * Math.cos(radians)
    }, null, 0);
    
    requestAnimationFrame(animate);
  };
  
  animate();
}

function toggleSpin() {
  isSpinning = !isSpinning;
  const spinBtn = document.getElementById('day11-spin');
  if (spinBtn) {
    spinBtn.textContent = isSpinning ? '[Stop Spin]' : '[Spin]';
  }
  
  if (isSpinning && graphInstance) {
    startSpin();
  }
}

export default {
  title: 'Day 11: Reactor',
  description: 'Find all paths through device network',
  unlocked: true,
  stars: '',
  render() {
    return `
      <div class="article">
        <h2>--- Day 11: Reactor ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/11" target="_blank" style="color: #009900;">[View Puzzle]</a>
        </div>
        <p>Find all paths from <code>you</code> to <code>out</code> through the device network.</p>
        <p><strong>Part 2:</strong> Find paths from <code>svr</code> to <code>out</code> that visit both <code>dac</code> and <code>fft</code>.</p>
        
        <div style="margin: 1rem 0;">
          <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
          <textarea 
            id="day11-input" 
            style="width: 100%; min-height: 150px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;"
            placeholder="aaa: you hhh
you: bbb ccc
bbb: ddd eee
..."
          ></textarea>
          <div style="margin-top: 0.5rem;">
            <button id="day11-visualize" class="btn" style="margin-right: 0.5rem;">[Visualize Part 1]</button>
            <button id="day11-solve" class="btn" style="margin-right: 0.5rem;">[Solve Part 1]</button>
            <button id="day11-example" class="btn" style="margin-right: 0.5rem;">[Load Example 1]</button>
            <button id="day11-debug" class="btn">[Debug Graph]</button>
          </div>
          <div style="margin-top: 0.5rem;">
            <button id="day11-visualize-p2" class="btn" style="margin-right: 0.5rem;">[Visualize Part 2]</button>
            <button id="day11-solve-p2" class="btn" style="margin-right: 0.5rem;">[Solve Part 2]</button>
            <button id="day11-example-p2" class="btn">[Load Example 2]</button>
          </div>
        </div>

        <div id="day11-results" style="margin-top:1rem;"></div>
        <div id="day11-visualization" style="margin-top:1rem; border: 1px solid #333; min-height: 600px;"></div>
        <div style="margin-top: 0.5rem;">
          <button id="day11-spin" class="btn">[Spin]</button>
        </div>
      </div>
    `;
  },
  attachHandlers() {
    const inputEl = document.getElementById('day11-input');
    const visualizeBtn = document.getElementById('day11-visualize');
    const solveBtn = document.getElementById('day11-solve');
    const exampleBtn = document.getElementById('day11-example');
    const debugBtn = document.getElementById('day11-debug');
    const visualizeBtnP2 = document.getElementById('day11-visualize-p2');
    const solveBtnP2 = document.getElementById('day11-solve-p2');
    const exampleBtnP2 = document.getElementById('day11-example-p2');
    const spinBtn = document.getElementById('day11-spin');
    const resultsEl = document.getElementById('day11-results');

    const exampleInput = `aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out`;

    const exampleInput2 = `svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out`;

    // Auto-load and visualize example on page load
    inputEl.value = exampleInput;
    
    // Trigger visualization automatically
    setTimeout(() => {
      try {
        const graph = parseInput(exampleInput);
        const paths = findAllPaths(graph);
        const graphData = buildGraphData(graph, paths);
        
        resultsEl.innerHTML = `
          <div style="padding: 1rem; background: #111; border: 1px solid #333; margin-bottom: 1rem;">
            <p style="color: #00ff00; font-size: 1.2rem; margin: 0.5rem 0;">
              <strong>Part 1 Answer: ${paths.length} paths</strong>
            </p>
            <p style="color: #cccccc; margin: 0.5rem 0;">
              Nodes: ${graphData.nodes.length} | Links: ${graphData.links.length}
            </p>
            <details style="margin-top: 1rem;">
              <summary style="color: #00cc00; cursor: pointer;">Show all paths</summary>
              <div style="margin-top: 0.5rem; max-height: 300px; overflow-y: auto;">
                ${paths.map((path, i) => `
                  <div style="color: #aaa; font-family: monospace; font-size: 0.9rem; margin: 0.25rem 0;">
                    ${i+1}. ${path.join(' → ')}
                  </div>
                `).join('')}
              </div>
            </details>
            <div style="margin-top: 1rem; color: #888; font-size: 0.9rem;">
              <strong>Legend:</strong>
              <span style="color: #00ff00;">● START</span> | 
              <span style="color: #ff0000;">● END</span> | 
              <span style="color: #ff00ff;">● REQUIRED</span> | 
              <span style="color: #ffaa00;">● In paths</span> | 
              <span style="color: #00ffff;">→ Path links</span>
            </div>
          </div>
        `;
        
        createVisualization(graphData, paths, 'day11-visualization');
      } catch (error) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
      }
    }, 100);

    spinBtn.addEventListener('click', toggleSpin);

    debugBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const graph = parseInput(input);
        let debugInfo = '<div style="padding: 1rem; background: #111; border: 1px solid #333;">';
        debugInfo += '<h3 style="color: #00ff00;">Graph Debug Info</h3>';
        
        // Check for svr, dac, fft, out nodes
        const hassvr = graph.has('svr');
        const hasdac = graph.has('dac');
        const hasfft = graph.has('fft');
        const hasout = graph.has('out');
        
        debugInfo += `<p style="color: #cccccc;">Nodes in graph: ${graph.size}</p>`;
        debugInfo += `<p style="color: ${hassvr ? '#00ff00' : '#ff0000'};">Has 'svr': ${hassvr}</p>`;
        debugInfo += `<p style="color: ${hasdac ? '#00ff00' : '#ff0000'};">Has 'dac': ${hasdac}</p>`;
        debugInfo += `<p style="color: ${hasfft ? '#00ff00' : '#ff0000'};">Has 'fft': ${hasfft}</p>`;
        debugInfo += `<p style="color: ${hasout ? '#00ff00' : '#ff0000'};">Has 'out': ${hasout}</p>`;
        
        if (hassvr) {
          debugInfo += `<p style="color: #cccccc;">svr connects to: ${graph.get('svr').join(', ')}</p>`;
        }
        if (hasdac) {
          debugInfo += `<p style="color: #cccccc;">dac connects to: ${graph.get('dac').join(', ')}</p>`;
        }
        if (hasfft) {
          debugInfo += `<p style="color: #cccccc;">fft connects to: ${graph.get('fft').join(', ')}</p>`;
        }
        
        // Show all nodes
        debugInfo += '<details style="margin-top: 1rem;"><summary style="color: #00cc00; cursor: pointer;">Show all nodes</summary>';
        debugInfo += '<div style="max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 0.9rem;">';
        for (const [node, outputs] of graph.entries()) {
          debugInfo += `<div style="color: #aaa; margin: 0.25rem 0;">${node}: ${outputs.join(', ')}</div>`;
        }
        debugInfo += '</div></details>';
        
        debugInfo += '</div>';
        resultsEl.innerHTML = debugInfo;
      } catch (error) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
      }
    });

    exampleBtn.addEventListener('click', () => {
      inputEl.value = exampleInput;
      visualizeBtn.click();
    });

    exampleBtnP2.addEventListener('click', () => {
      inputEl.value = exampleInput2;
      visualizeBtnP2.click();
    });

    visualizeBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const graph = parseInput(input);
        const paths = findAllPaths(graph);
        const graphData = buildGraphData(graph, paths);
        
        resultsEl.innerHTML = `
          <div style="padding: 1rem; background: #111; border: 1px solid #333; margin-bottom: 1rem;">
            <p style="color: #00ff00; font-size: 1.2rem; margin: 0.5rem 0;">
              <strong>Part 1 Answer: ${paths.length} paths</strong>
            </p>
            <p style="color: #cccccc; margin: 0.5rem 0;">
              Nodes: ${graphData.nodes.length} | Links: ${graphData.links.length}
            </p>
            <details style="margin-top: 1rem;">
              <summary style="color: #00cc00; cursor: pointer;">Show all paths</summary>
              <div style="margin-top: 0.5rem; max-height: 300px; overflow-y: auto;">
                ${paths.map((path, i) => `
                  <div style="color: #aaa; font-family: monospace; font-size: 0.9rem; margin: 0.25rem 0;">
                    ${i+1}. ${path.join(' → ')}
                  </div>
                `).join('')}
              </div>
            </details>
            <div style="margin-top: 1rem; color: #888; font-size: 0.9rem;">
              <strong>Legend:</strong>
              <span style="color: #00ff00;">● START</span> | 
              <span style="color: #ff0000;">● END</span> | 
              <span style="color: #ff00ff;">● REQUIRED</span> | 
              <span style="color: #ffaa00;">● In paths</span> | 
              <span style="color: #00ffff;">→ Path links</span>
            </div>
          </div>
        `;
        
        createVisualization(graphData, paths, 'day11-visualization');
      } catch (error) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
      }
    });

    visualizeBtnP2.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const graph = parseInput(input);
        const allPathsCount = countPathsWithRequired(graph, 'svr', 'out', []);
        const requiredPathsCount = countPathsWithRequired(graph, 'svr', 'out', ['dac', 'fft']);
        
        // Still get actual paths for visualization
        const paths = findAllPaths(graph, 'svr', 'out', ['dac', 'fft']);
        const graphData = buildGraphData(graph, paths, ['dac', 'fft']);
        
        resultsEl.innerHTML = `
          <div style="padding: 1rem; background: #111; border: 1px solid #333; margin-bottom: 1rem;">
            <p style="color: #00ff00; font-size: 1.2rem; margin: 0.5rem 0;">
              <strong>Part 2 Answer: ${requiredPathsCount} paths</strong>
            </p>
            <p style="color: #cccccc; margin: 0.5rem 0;">
              Total paths from svr to out: ${allPathsCount} | 
              Paths visiting both dac and fft: <strong>${requiredPathsCount}</strong>
            </p>
            <p style="color: #cccccc; margin: 0.5rem 0;">
              Nodes: ${graphData.nodes.length} | Links: ${graphData.links.length}
            </p>
            <details style="margin-top: 1rem;">
              <summary style="color: #00cc00; cursor: pointer;">Show sample paths (first ${Math.min(paths.length, 100)})</summary>
              <div style="margin-top: 0.5rem; max-height: 300px; overflow-y: auto;">
                ${paths.slice(0, 100).map((path, i) => `
                  <div style="color: #aaa; font-family: monospace; font-size: 0.9rem; margin: 0.25rem 0;">
                    ${i+1}. ${path.join(' → ')}
                  </div>
                `).join('')}
                ${paths.length > 100 ? `<div style="color: #888; margin-top: 0.5rem;">...and ${paths.length - 100} more</div>` : ''}
              </div>
            </details>
            <div style="margin-top: 1rem; color: #888; font-size: 0.9rem;">
              <strong>Legend:</strong>
              <span style="color: #00ff00;">● START (svr)</span> | 
              <span style="color: #ff0000;">● END (out)</span> | 
              <span style="color: #ff00ff;">● REQUIRED (dac, fft)</span> | 
              <span style="color: #ffaa00;">● In paths</span> | 
              <span style="color: #00ffff;">→ Path links</span>
            </div>
          </div>
        `;
        
        createVisualization(graphData, paths, 'day11-visualization');
      } catch (error) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
      }
    });

    solveBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const graph = parseInput(input);
        const paths = findAllPaths(graph);
        
        resultsEl.innerHTML = `
          <div style="padding: 1rem; background: #111; border: 1px solid #333;">
            <p style="color: #00ff00; font-size: 1.5rem; margin: 0.5rem 0;">
              <strong>⭐ Part 1 Answer: ${paths.length}</strong>
            </p>
            <p style="color: #cccccc;">
              Total paths from <code>you</code> to <code>out</code>: <strong>${paths.length}</strong>
            </p>
          </div>
        `;
      } catch (error) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
      }
    });

    solveBtnP2.addEventListener('click', () => {
      const input = inputEl.value.trim();
      if (!input) {
        resultsEl.innerHTML = '<p style="color:orange;">Please paste puzzle input first.</p>';
        return;
      }

      try {
        const graph = parseInput(input);
        const allPathsCount = countPathsWithRequired(graph, 'svr', 'out', []);
        const requiredPathsCount = countPathsWithRequired(graph, 'svr', 'out', ['dac', 'fft']);
        
        resultsEl.innerHTML = `
          <div style="padding: 1rem; background: #111; border: 1px solid #333;">
            <p style="color: #00ff00; font-size: 1.5rem; margin: 0.5rem 0;">
              <strong>⭐ Part 2 Answer: ${requiredPathsCount}</strong>
            </p>
            <p style="color: #cccccc;">
              Total paths from <code>svr</code> to <code>out</code>: ${allPathsCount}<br>
              Paths visiting both <code>dac</code> and <code>fft</code>: <strong>${requiredPathsCount}</strong>
            </p>
          </div>
        `;
      } catch (error) {
        resultsEl.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
      }
    });
  }
};
