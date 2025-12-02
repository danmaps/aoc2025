function isInvalidIDPart1(num) {
  const str = num.toString();
  const len = str.length;
  if (len % 2 !== 0) return false;
  if (str[0] === '0') return false;
  const mid = len / 2;
  return str.substring(0, mid) === str.substring(mid);
}

function isInvalidIDPart2(num) {
  const str = num.toString();
  if (str[0] === '0') return false;
  for (let patternLen = 1; patternLen <= str.length / 2; patternLen++) {
    if (str.length % patternLen === 0) {
      const pattern = str.substring(0, patternLen);
      const repetitions = str.length / patternLen;
      if (repetitions >= 2 && pattern.repeat(repetitions) === str) {
        return true;
      }
    }
  }
  return false;
}

function parseRanges(input) {
  return input.split(',').map(r => r.trim()).filter(Boolean).map(r => {
    const [start, end] = r.split('-').map(Number);
    return { start, end };
  });
}

function solve(input, part) {
  const ranges = parseRanges(input);
  const check = part === 'part2' ? isInvalidIDPart2 : isInvalidIDPart1;
  const ids = [];
  for (const { start, end } of ranges) {
    for (let id = start; id <= end; id++) {
      if (check(id)) ids.push(id);
    }
  }
  const sum = ids.reduce((a, b) => a + b, 0);
  return { count: ids.length, sum, ids, ranges };
}

export default {
  title: '--- Day 2: Gift Shop ---',
  description: 'Find invalid product IDs in ranged inputs.',
  stars: '★★',
  unlocked: true,
  solvePart1(input) { return solve(input, 'part1'); },
  solvePart2(input) { return solve(input, 'part2'); },
  render() {
    return `
      <div class="article">
        <h2>--- Day 2: Gift Shop ---</h2>
        <div style="margin-bottom: 1rem;">
          <a href="https://adventofcode.com/2025/day/2" target="_blank" style="color: #009900;">[View Original Puzzle]</a>
        </div>
        <div class="tabs">
          <button class="tab active" data-part="part1">Part 1</button>
          <button class="tab" data-part="part2">Part 2</button>
        </div>
        <div class="input-section">
          <label>&gt; Enter your puzzle input:</label>
          <textarea id="puzzle-input">11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124</textarea>
          <button class="btn" id="calc-btn">[Calculate]</button>
        </div>
        <div id="result" class="result-box" style="display:none">
          <h3>&gt; Result</h3>
          <div>Total Invalid IDs: <span id="total-count" style="color:#ffff00">0</span></div>
          <div>Answer: <span class="answer" id="answer">0</span></div>
          <div id="details" style="margin-top:1rem;">
            <h3>&gt; Range Breakdown</h3>
            <div id="range-details"></div>
          </div>
        </div>
      </div>
    `;
  },
  attachHandlers(root) {
    let currentPart = 'part1';
    const inputEl = root.querySelector('#puzzle-input');
    const btn = root.querySelector('#calc-btn');
    const tabs = root.querySelectorAll('.tab');

    tabs.forEach(tab => tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentPart = e.currentTarget.dataset.part;
      root.querySelector('#result').style.display = 'none';
    }));

    btn.addEventListener('click', () => {
      const res = currentPart === 'part2' ? this.solvePart2(inputEl.value) : this.solvePart1(inputEl.value);
      const { count, sum, ranges, ids } = res;
      root.querySelector('#total-count').textContent = count;
      root.querySelector('#answer').textContent = sum;
      const detailsHTML = ranges.map(({start,end}) => {
        const rIds = ids.filter(id => id>=start && id<=end);
        const has = rIds.length>0;
        const idsHTML = has ? '<div>' + rIds.map(id=>`<span class="invalid-id">${id}</span>`).join('') + '</div>' : '';
        return `<div class="detail-item ${has?'has-invalid':''}">
          <div><strong>${start}-${end}</strong> - ${rIds.length} invalid ID${rIds.length!==1?'s':''}</div>
          ${idsHTML}
        </div>`;
      }).join('');
      root.querySelector('#range-details').innerHTML = detailsHTML;
      root.querySelector('#result').style.display = 'block';
    });
  }
};
