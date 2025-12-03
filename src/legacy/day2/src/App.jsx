import { useState } from 'react';
import './App.css';

// Part 1: Check if a number is made of repeated digits (pattern repeated exactly twice)
function isInvalidIDPart1(num) {
  const str = num.toString();
  const len = str.length;
  
  // Must have even length to be splittable in half
  if (len % 2 !== 0) return false;
  
  // Check if it has leading zeros (would be invalid format)
  if (str[0] === '0') return false;
  
  const mid = len / 2;
  const firstHalf = str.substring(0, mid);
  const secondHalf = str.substring(mid);
  
  return firstHalf === secondHalf;
}

// Part 2: Check if a number is made of repeated digits (pattern repeated at least twice)
function isInvalidIDPart2(num) {
  const str = num.toString();
  
  // Check if it has leading zeros (would be invalid format)
  if (str[0] === '0') return false;
  
  // Try all possible pattern lengths from 1 to half the string length
  for (let patternLen = 1; patternLen <= str.length / 2; patternLen++) {
    // Check if the string length is divisible by pattern length
    if (str.length % patternLen === 0) {
      const pattern = str.substring(0, patternLen);
      const repetitions = str.length / patternLen;
      
      // Need at least 2 repetitions
      if (repetitions >= 2) {
        // Check if the entire string is this pattern repeated
        const repeated = pattern.repeat(repetitions);
        if (repeated === str) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Parse ranges and find all invalid IDs
function findInvalidIDs(input, isPart2 = false) {
  const ranges = input.split(',').map(r => r.trim()).filter(r => r);
  const invalidIDs = [];
  const rangeDetails = [];
  const checkFunction = isPart2 ? isInvalidIDPart2 : isInvalidIDPart1;
  
  for (const range of ranges) {
    const [start, end] = range.split('-').map(Number);
    const rangeInvalid = [];
    
    for (let id = start; id <= end; id++) {
      if (checkFunction(id)) {
        invalidIDs.push(id);
        rangeInvalid.push(id);
      }
    }
    
    rangeDetails.push({
      range,
      start,
      end,
      invalidIDs: rangeInvalid,
      count: rangeInvalid.length
    });
  }
  
  return { invalidIDs, rangeDetails };
}

const EXAMPLE_INPUT = `11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
1698522-1698528,446443-446449,38593856-38593862,565653-565659,
824824821-824824827,2121212118-2121212124`;

function App() {
  const [activeTab, setActiveTab] = useState('part1');
  const [input, setInput] = useState(EXAMPLE_INPUT);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(true);

  const handleCalculate = () => {
    const isPart2 = activeTab === 'part2';
    const { invalidIDs, rangeDetails } = findInvalidIDs(input, isPart2);
    const sum = invalidIDs.reduce((acc, id) => acc + id, 0);
    setResult({ invalidIDs, rangeDetails, sum });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResult(null); // Clear results when switching tabs
  };

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>🎁 Day 2: Gift Shop</h1>
          <p className="subtitle">Finding Invalid Product IDs</p>
        </header>

        <nav className="tab-nav">
          <button 
            className={`tab ${activeTab === 'part1' ? 'active' : ''}`}
            onClick={() => handleTabChange('part1')}
          >
            Part 1
          </button>
          <button 
            className={`tab ${activeTab === 'part2' ? 'active' : ''}`}
            onClick={() => handleTabChange('part2')}
          >
            Part 2
          </button>
        </nav>

        <div className="card">
          <h2>Product ID Ranges</h2>
          <p className="description">
            {activeTab === 'part1' ? (
              <>
                Enter comma-separated ranges (e.g., <code>11-22,95-115</code>).
                Invalid IDs are numbers where a pattern repeats <strong>exactly twice</strong> (like 11, 6464, 123123).
              </>
            ) : (
              <>
                Enter comma-separated ranges (e.g., <code>11-22,95-115</code>).
                Invalid IDs are numbers where a pattern repeats <strong>at least twice</strong> (like 11, 111, 1234123412, 1212121212).
              </>
            )}
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter ranges..."
            rows={6}
          />
          <button onClick={handleCalculate} className="btn-primary">
            Find Invalid IDs
          </button>
        </div>

        {result && (
          <>
            <div className="card result-card">
              <h2>Result</h2>
              <div className="result-summary">
                <div className="stat">
                  <span className="stat-label">Total Invalid IDs:</span>
                  <span className="stat-value">{result.invalidIDs.length}</span>
                </div>
                <div className="stat highlight">
                  <span className="stat-label">Sum of Invalid IDs:</span>
                  <span className="stat-value">{result.sum}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="details-header">
                <h2>Range Details</h2>
                <button 
                  onClick={() => setShowDetails(!showDetails)} 
                  className="btn-secondary"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {showDetails && (
                <div className="range-details">
                  {result.rangeDetails.map((detail, idx) => (
                    <div key={idx} className="range-item">
                      <div className="range-header">
                        <span className="range-name">{detail.range}</span>
                        <span className={`range-count ${detail.count > 0 ? 'has-invalid' : ''}`}>
                          {detail.count} invalid ID{detail.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {detail.invalidIDs.length > 0 && (
                        <div className="invalid-list">
                          {detail.invalidIDs.map(id => (
                            <span key={id} className="invalid-id">{id.toLocaleString()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result.invalidIDs.length > 0 && result.invalidIDs.length <= 20 && (
              <div className="card">
                <h2>All Invalid IDs</h2>
                <div className="all-invalid-ids">
                  {result.invalidIDs.map(id => (
                    <div key={id} className="invalid-id-detail">
                      <span className="id-value">{id.toLocaleString()}</span>
                      <span className="id-explanation">
                        {(() => {
                          const str = id.toString();
                          const mid = str.length / 2;
                          return `${str.substring(0, mid)} repeated twice`;
                        })()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="card info-card">
          <h3>How it works</h3>
          {activeTab === 'part1' ? (
            <div className="how-it-works">
              <div className="work-item">
                <p>✓ Check if length is even (must split in half)</p>
                <pre><code>{`if (str.length % 2 !== 0) return false;`}</code></pre>
              </div>
              <div className="work-item">
                <p>✓ Split the number in half and compare</p>
                <pre><code>{`const mid = str.length / 2;
const firstHalf = str.substring(0, mid);
const secondHalf = str.substring(mid);
return firstHalf === secondHalf;`}</code></pre>
                <p className="example">Example: <code>6464</code> → <code>"64" === "64"</code> → invalid ✓</p>
              </div>
              <div className="work-item">
                <p>✓ Reject numbers with leading zeros</p>
                <pre><code>{`if (str[0] === '0') return false;`}</code></pre>
              </div>
            </div>
          ) : (
            <div className="how-it-works">
              <div className="work-item">
                <p>✓ Try all possible pattern lengths</p>
                <pre><code>{`for (let patternLen = 1; patternLen <= str.length / 2; patternLen++) {
  if (str.length % patternLen === 0) {
    // Check this pattern length
  }
}`}</code></pre>
              </div>
              <div className="work-item">
                <p>✓ Check if pattern repeats at least twice</p>
                <pre><code>{`const pattern = str.substring(0, patternLen);
const repetitions = str.length / patternLen;
if (repetitions >= 2) {
  const repeated = pattern.repeat(repetitions);
  if (repeated === str) return true;
}`}</code></pre>
                <p className="example">Example: <code>1212121212</code> → pattern <code>"12"</code> × 5 → invalid ✓</p>
              </div>
              <div className="work-item">
                <p>✓ Reject numbers with leading zeros</p>
                <pre><code>{`if (str[0] === '0') return false;`}</code></pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
