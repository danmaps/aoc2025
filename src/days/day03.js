function maxJoltageForBank(line, targetLen = 2) {
  const digits = line.split("").map(d => Number(d));
  const n = digits.length;
  
  if (targetLen === 2) {
    // Part 1: Find best 2-digit number
    const rightMax = Array(n).fill(0);
    for (let i = n - 2; i >= 0; i--) {
      rightMax[i] = Math.max(digits[i + 1], rightMax[i + 1]);
    }
    let best = 0;
    let bestI = 0;
    let bestJ = 1;
    for (let i = 0; i < n - 1; i++) {
      const tens = digits[i];
      const ones = rightMax[i];
      const candidate = tens * 10 + ones;
      if (candidate > best) {
        best = candidate;
        let j = i + 1;
        for (let k = i + 1; k < n; k++) {
          if (digits[k] === ones) j = k;
        }
        bestI = i;
        bestJ = j;
      }
    }
    return { best, bestI, bestJ, digits };
  } else {
    // Part 2: Find best K-digit number by removing (n - K) smallest digits
    // Use monotonic stack approach: keep K largest digits in order
    const toRemove = n - targetLen;
    const stack = [];
    let removed = 0;
    
    for (let i = 0; i < n; i++) {
      // While we can still remove digits and current digit is larger than stack top
      while (stack.length > 0 && 
             removed < toRemove && 
             digits[i] > digits[stack[stack.length - 1]]) {
        stack.pop();
        removed++;
      }
      stack.push(i);
    }
    
    // Remove from the end if we haven't removed enough
    while (removed < toRemove) {
      stack.pop();
      removed++;
    }
    
    // Build result from remaining indices
    const resultDigits = stack.map(i => digits[i]);
    const best = BigInt(resultDigits.join(''));
    return { best, bestI: -1, bestJ: -1, digits };
  }
}

function createBatteryRow(container, digits) {
  container.innerHTML = "";
  
  // Calculate battery width based on number of digits
  const numDigits = digits.length;
  let batteryWidth = 24; // default
  let gap = 0.4;
  
  if (numDigits > 40) {
    batteryWidth = Math.max(8, Math.floor(800 / numDigits));
    gap = Math.max(0.1, 0.4 * (batteryWidth / 24));
  } else if (numDigits > 20) {
    batteryWidth = 18;
    gap = 0.3;
  }
  
  container.style.gap = `${gap}rem`;
  
  digits.forEach((d, idx) => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;";

    const battery = document.createElement("div");
    battery.className = "battery";
    battery.dataset.index = idx;
    battery.style.width = `${batteryWidth}px`;

    const fill = document.createElement("div");
    fill.className = "fill";
    fill.style.height = d * 10 + "%";
    battery.appendChild(fill);

    const bestLabel = document.createElement("div");
    bestLabel.className = "best-label";
    battery.appendChild(bestLabel);

    const digitLabel = document.createElement("div");
    digitLabel.className = "digit-label";
    digitLabel.textContent = d;

    wrap.appendChild(battery);
    wrap.appendChild(digitLabel);
    container.appendChild(wrap);
  });
}

async function animateBank(line, rowEl, bankTextEl, bankMaxEl) {
  bankTextEl.textContent = line;
  const { best, bestI, bestJ, digits } = maxJoltageForBank(line);
  createBatteryRow(rowEl, digits);

  const batteries = [...rowEl.querySelectorAll(".battery")];

  await new Promise(resolve => setTimeout(resolve, 250));
  batteries.forEach((b, idx) => {
    const fill = b.querySelector(".fill");
    const d = digits[idx];
    const scale = d / 9;
    requestAnimationFrame(() => {
      fill.style.transform = `scaleY(${scale})`;
    });
  });
  await new Promise(resolve => setTimeout(resolve, 600));

  for (let i = 0; i < digits.length - 1; i++) {
    const b = batteries[i];
    b.style.transform = "scale(1.15)";
    b.style.boxShadow = "0 0 20px #00cc00, 0 0 40px #00cc00";
    b.style.borderColor = "#00cc00";
    await new Promise(r => setTimeout(r, 100));
    if (i !== bestI) {
      b.style.transform = "";
      b.style.boxShadow = "";
      b.style.borderColor = "";
    }
  }

  batteries.forEach(b => b.classList.add("dimmed"));
  const tensBattery = batteries[bestI];
  const onesBattery = batteries[bestJ];
  tensBattery.classList.remove("dimmed");
  onesBattery.classList.remove("dimmed");
  tensBattery.classList.add("tens");
  onesBattery.classList.add("ones");

  const midIndex = (bestI + bestJ) / 2;
  const bestAnchor = batteries[Math.round(midIndex)];
  const label = bestAnchor.querySelector(".best-label");
  label.textContent = `${digits[bestI]}${digits[bestJ]}`;
  requestAnimationFrame(() => {
    label.classList.add("show");
  });

  const target = best;
  let current = 0;
  const step = () => {
    if (current < target) {
      current += Math.max(1, Math.floor((target - current) / 5));
      bankMaxEl.textContent = current;
      requestAnimationFrame(step);
    } else {
      bankMaxEl.textContent = target;
    }
  };
  step();
}

export default {
  title: '--- Day 3: Lobby ---',
  description: 'Find maximum joltage from battery banks.',
  stars: '★★',
  unlocked: true,
  solvePart1(input) {
    const lines = input.trim().split('\n');
    return lines.reduce((sum, line) => sum + maxJoltageForBank(line, 2).best, 0);
  },
  solvePart2(input) {
    const lines = input.trim().split('\n');
    const total = lines.reduce((sum, line) => sum + maxJoltageForBank(line, 12).best, BigInt(0));
    return total.toString();
  },
  render() {
    return `
      <div class="article">
        <h2>--- Day 3: Lobby ---</h2>
        <div style="margin-bottom: 1rem;">
        <p>In the lobby, you need to restore power to the <em>escalators</em>. Emergency <em>batteries</em> are arranged into <em>banks</em>, each labeled with a <em>joltage rating</em> (1-9 digits). In <em>Part 1</em>, find the <em>maximum two-digit joltage</em> by turning on exactly two batteries where the tens digit comes before the ones digit. In <em>Part 2</em>, turn on <em>exactly 12 batteries</em> per bank to overcome static friction, maximizing the <em>12-digit joltage</em>.</p>
        </div>
        <p>In the lobby, you need to restore power to the <em>escalators</em>. Emergency <em>batteries</em> are arranged into <em>banks</em>, each labeled with a <em>joltage rating</em> (1-9 digits). For each bank, find the <em>maximum two-digit joltage</em> by turning on exactly two batteries where the <em>tens digit comes before the ones digit</em> in the bank string.</p>

        <div style="margin-top: 1.5rem;">
          <h3>&gt; Battery Bank Visualization</h3>
          <div style="margin: 1rem 0;">
            <label style="color: #00cc00; display: block; margin-bottom: 0.5rem;">&gt; Paste your puzzle input:</label>
            <textarea id="day3-input" style="width: 100%; min-height: 100px; background: #0a0a0a; color: #00cc00; border: 1px solid #333; padding: 0.75rem; font-family: 'Source Code Pro', monospace; font-size: 12px; resize: vertical;">987654321111111
811111111111119
234234234234278
818181911112111</textarea>
            <button id="day3-animate-btn" class="btn" style="margin-top: 0.5rem;">[Animate First Bank]</button>
            <button id="day3-animate-all-btn" class="btn" style="margin-top: 0.5rem; margin-left: 0.5rem;">[Animate All Banks]</button>
            <button id="day3-calculate-btn" class="btn" style="margin-top: 0.5rem; margin-left: 0.5rem;">[Calculate All and Reveal Total]</button>
          </div>

          <div style="margin-top: 1rem;">
            <div style="color: #cccccc; margin-bottom: 0.5rem;">Current bank:</div>
            <div id="day3-bank-text" style="font-family: monospace; color: #9be7ff; font-size: 1.1rem;"></div>
          </div>

          <div id="day3-battery-row" class="battery-row" style="display: flex; gap: 0.4rem; align-items: flex-end; margin: 1rem 0; position: relative; min-height: 100px; max-width: 100%;"></div>

          <div style="margin-top: 1rem; padding: 1rem; background: #0a0a0a; border: 1px solid #00cc00;">
            <div style="margin-bottom: 0.5rem;">Max joltage for this bank: <span id="day3-bank-max" style="color: #ffff00; font-size: 1.2rem; font-family: monospace;">0</span></div>
            <div style="margin-bottom: 0.5rem;">Total output joltage (Part 1): <span id="day3-total" style="color: #7cf6ff; font-size: 1.5rem; font-family: monospace;">0</span></div>
            <div>Total output joltage (Part 2): <span id="day3-total-part2" style="color: #7cf6ff; font-size: 1.5rem; font-family: monospace;">0</span></div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #333;">
          <h3>&gt; How This Works</h3>
          <div style="margin: 1rem 0;">
            <strong>Part 1: Maximum Two-Digit Joltage</strong>
            <p style="margin: 0.5rem 0; color: #cccccc;">
              For each battery bank string, find the largest two-digit number where the <em>tens digit appears before the ones digit</em> in the string. The algorithm scans left-to-right, pairing each digit with the maximum digit to its right.
            </p>
            <div class="code-block" style="font-size: 12px;">
<pre>def max_joltage(bank):
    digits = [int(d) for d in bank]
    n = len(digits)
    # Precompute max digit to the right of each position
    right_max = [0] * n
    for i in range(n - 2, -1, -1):
        right_max[i] = max(digits[i + 1], right_max[i + 1])
    
    best = 0
    for i in range(n - 1):
        tens = digits[i]
        ones = right_max[i]
        candidate = tens * 10 + ones
        best = max(best, candidate)
    
    return best

# Example: bank = "987654321111111"
# Position 0: digit=9, right_max=8 → 98 ✓
# Position 1: digit=8, right_max=7 → 87
# Best: 98</pre>
            </div>
          </div>
          <div style="margin: 1rem 0;">
            <strong>Part 2: 12-Digit Maximum Joltage</strong>
            <p style="margin: 0.5rem 0; color: #cccccc;">
              Turn on exactly <em>12 batteries</em> per bank to maximize the 12-digit joltage. Remove the smallest (n - 12) digits while preserving relative order. Use a greedy approach: scan left-to-right and remove a digit if a larger digit follows and we still have enough digits remaining.
            </p>
            <div class="code-block" style="font-size: 12px;">
<pre>def max_12_digit_joltage(bank):
    digits = [int(d) for d in bank]
    n = len(digits)
    to_remove = n - 12
    
    # Greedy removal: remove smallest digits from left
    removed = []
    i = 0
    while len(removed) < to_remove and i < n:
        # Can we remove digit[i]?
        if (n - len(removed) - 1) >= 12:
            # Check if there's a larger digit ahead
            for j in range(i + 1, n):
                if digits[j] > digits[i]:
                    removed.append(i)
                    break
        i += 1
    
    # Build result excluding removed indices
    result = ''.join(str(digits[i]) for i in range(n) 
                     if i not in removed)
    return int(result)

# Example: "987654321111111"
# Remove 3 smallest: exclude three 1s at end
# Result: 987654321111</pre>
            </div>
          </div>
        </div>

        <style>
          .battery {
            width: 24px;
            height: 64px;
            border-radius: 4px;
            border: 2px solid #333;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            background: #0a0a0a;
            transition: transform 0.15s;
          }

          .battery::after {
            content: "";
            position: absolute;
            top: -6px;
            left: 6px;
            right: 6px;
            height: 6px;
            border-radius: 3px 3px 0 0;
            background: #444;
          }

          .fill {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            transform-origin: bottom;
            transform: scaleY(0);
            background: linear-gradient(to top, #00cc00, #7cf6ff);
            transition: transform 0.35s ease-out;
          }

          .digit-label {
            text-align: center;
            font-size: 0.8rem;
            margin-top: 0.15rem;
            color: #999;
          }

          .battery.tens {
            box-shadow: 0 0 16px #ffeb3b77;
            transform: scale(1.08);
            border-color: #ffeb3b;
          }

          .battery.ones {
            box-shadow: 0 0 18px #ff408177;
            transform: scale(1.1);
            border-color: #ff80ab;
          }

          .battery.dimmed {
            opacity: 0.4;
          }

          .best-label {
            position: absolute;
            top: -32px;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            background: #111;
            border: 1px solid #ffeb3b;
            font-size: 0.8rem;
            color: #ffeb3b;
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
          }

          .best-label.show {
            opacity: 1;
            transform: translateX(-50%) translateY(-4px) scale(1.05);
          }
        </style>
      </div>
    `;
  },
  attachHandlers() {
    const animateBtn = document.getElementById('day3-animate-btn');
    const animateAllBtn = document.getElementById('day3-animate-all-btn');
    const calculateBtn = document.getElementById('day3-calculate-btn');
    const inputEl = document.getElementById('day3-input');
    const rowEl = document.getElementById('day3-battery-row');
    const bankTextEl = document.getElementById('day3-bank-text');
    const bankMaxEl = document.getElementById('day3-bank-max');
    const totalEl = document.getElementById('day3-total');
    const totalPart2El = document.getElementById('day3-total-part2');

    let shouldSkip = false;

    if (!animateBtn || !inputEl) return;

    animateBtn.addEventListener('click', async () => {
      const raw = inputEl.value.trim();
      if (!raw) return;
      const firstLine = raw.split('\n')[0].trim();
      bankMaxEl.textContent = '0';
      await animateBank(firstLine, rowEl, bankTextEl, bankMaxEl);
    });
    animateAllBtn.addEventListener('click', async () => {
      const raw = inputEl.value.trim();
      if (!raw) return;
      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      let total = 0;
      let totalPart2 = BigInt(0);
      
      shouldSkip = false;
      animateAllBtn.disabled = true;
      animateBtn.disabled = true;
      
      for (let i = 0; i < lines.length; i++) {
        if (shouldSkip) {
          // Calculate remaining banks instantly
          for (let j = i; j < lines.length; j++) {
            total += maxJoltageForBank(lines[j], 2).best;
            totalPart2 += maxJoltageForBank(lines[j], 12).best;
          }
          break;
        }
        
        const line = lines[i];
        bankMaxEl.textContent = '0';
        await animateBank(line, rowEl, bankTextEl, bankMaxEl);
        const bankValue = maxJoltageForBank(line, 2).best;
        total += bankValue;
        totalEl.textContent = total;
        
        const bankValuePart2 = maxJoltageForBank(line, 12).best;
        totalPart2 += bankValuePart2;
        totalPart2El.textContent = totalPart2.toString();
        
        await new Promise(r => setTimeout(r, 800));
      }
      
      totalEl.textContent = total;
      totalPart2El.textContent = totalPart2.toString();
      animateAllBtn.disabled = false;
      animateBtn.disabled = false;
    });

    calculateBtn.addEventListener('click', () => {
      const raw = inputEl.value.trim();
      if (!raw) return;
      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      
      if (shouldSkip) {
        // Already animating, just skip to end
        shouldSkip = true;
      } else {
        // Calculate instantly without animation
        let total = 0;
        let totalPart2 = BigInt(0);
        
        for (const line of lines) {
          total += maxJoltageForBank(line, 2).best;
          totalPart2 += maxJoltageForBank(line, 12).best;
        }
        
        totalEl.textContent = total;
        totalPart2El.textContent = totalPart2.toString();
        bankTextEl.textContent = 'Calculated all banks instantly';
        bankMaxEl.textContent = '—';
      }
    });
  }
};
