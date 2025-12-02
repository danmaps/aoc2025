// Test script to verify the solution
function isInvalidIDPart1(num) {
  const str = num.toString();
  const len = str.length;
  
  if (len % 2 !== 0) return false;
  if (str[0] === '0') return false;
  
  const mid = len / 2;
  const firstHalf = str.substring(0, mid);
  const secondHalf = str.substring(mid);
  
  return firstHalf === secondHalf;
}

function isInvalidIDPart2(num) {
  const str = num.toString();
  
  if (str[0] === '0') return false;
  
  for (let patternLen = 1; patternLen <= str.length / 2; patternLen++) {
    if (str.length % patternLen === 0) {
      const pattern = str.substring(0, patternLen);
      const repetitions = str.length / patternLen;
      
      if (repetitions >= 2) {
        const repeated = pattern.repeat(repetitions);
        if (repeated === str) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function findInvalidIDs(input, isPart2 = false) {
  const ranges = input.split(',').map(r => r.trim()).filter(r => r);
  const invalidIDs = [];
  const checkFunction = isPart2 ? isInvalidIDPart2 : isInvalidIDPart1;
  
  for (const range of ranges) {
    const [start, end] = range.split('-').map(Number);
    
    for (let id = start; id <= end; id++) {
      if (checkFunction(id)) {
        invalidIDs.push(id);
      }
    }
  }
  
  return invalidIDs;
}

// Test with the example
const exampleInput = `11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
1698522-1698528,446443-446449,38593856-38593862,565653-565659,
824824821-824824827,2121212118-2121212124`;

console.log('=== Testing Day 2 Solution ===\n');

// Part 1
console.log('--- PART 1 ---');
const invalidIDs1 = findInvalidIDs(exampleInput, false);
const sum1 = invalidIDs1.reduce((acc, id) => acc + id, 0);

console.log('Invalid IDs found:', invalidIDs1);
console.log('Total invalid IDs:', invalidIDs1.length);
console.log('Sum of invalid IDs:', sum1);
console.log('Expected sum: 1227775554');
console.log('Match:', sum1 === 1227775554 ? '✓ CORRECT' : '✗ INCORRECT');

// Part 2
console.log('\n--- PART 2 ---');
const invalidIDs2 = findInvalidIDs(exampleInput, true);
const sum2 = invalidIDs2.reduce((acc, id) => acc + id, 0);

console.log('Invalid IDs found:', invalidIDs2);
console.log('Total invalid IDs:', invalidIDs2.length);
console.log('Sum of invalid IDs:', sum2);
console.log('Expected sum: 4174379265');
console.log('Match:', sum2 === 4174379265 ? '✓ CORRECT' : '✗ INCORRECT');

// Test individual cases
console.log('\n--- Part 1 Test Cases ---');
const testCasesPart1 = [
  { num: 11, expected: true, reason: '1 repeated twice' },
  { num: 22, expected: true, reason: '2 repeated twice' },
  { num: 99, expected: true, reason: '9 repeated twice' },
  { num: 1010, expected: true, reason: '10 repeated twice' },
  { num: 6464, expected: true, reason: '64 repeated twice' },
  { num: 123123, expected: true, reason: '123 repeated twice' },
  { num: 101, expected: false, reason: 'odd length' },
  { num: 111, expected: false, reason: '3 repetitions, not 2' },
  { num: 1234, expected: false, reason: 'not repeated' },
  { num: 50, expected: false, reason: 'different halves' },
];

testCasesPart1.forEach(({ num, expected, reason }) => {
  const result = isInvalidIDPart1(num);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} ${num}: ${result} (${reason})`);
});

console.log('\n--- Part 2 Test Cases ---');
const testCasesPart2 = [
  { num: 11, expected: true, reason: '1×2' },
  { num: 111, expected: true, reason: '1×3' },
  { num: 1111111, expected: true, reason: '1×7' },
  { num: 999, expected: true, reason: '9×3' },
  { num: 1010, expected: true, reason: '10×2' },
  { num: 12341234, expected: true, reason: '1234×2' },
  { num: 123123123, expected: true, reason: '123×3' },
  { num: 1212121212, expected: true, reason: '12×5' },
  { num: 565656, expected: true, reason: '56×3' },
  { num: 824824824, expected: true, reason: '824×3' },
  { num: 2121212121, expected: true, reason: '21×5' },
  { num: 101, expected: false, reason: 'not evenly divisible' },
  { num: 1234, expected: false, reason: 'no repetition' },
  { num: 50, expected: false, reason: 'no repetition' },
];

testCasesPart2.forEach(({ num, expected, reason }) => {
  const result = isInvalidIDPart2(num);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} ${num}: ${result} (${reason})`);
});
