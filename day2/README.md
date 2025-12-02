# Advent of Code 2025 - Day 2: Gift Shop

A React application to find invalid product IDs in the North Pole gift shop database.

## Problem

Find all invalid product IDs within given ranges. An invalid ID is a number where some sequence of digits is repeated exactly twice (e.g., 11, 6464, 123123).

## Solution

- **Example Answer:** 1227775554
- The app parses ranges, checks each ID for the pattern, and sums all invalid IDs

## Usage

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Test the solution logic
node test.js
```

### Using the App

1. The app loads with example input already filled in
2. Click "Find Invalid IDs" to see the solution for the example (should be 1,227,775,554)
3. **Paste your own puzzle input** in the textarea to solve your specific puzzle
4. Results show the total sum and breakdown by range

## Features

- 🎯 Interactive UI to input product ID ranges
- 📊 Visual breakdown by range
- 🔍 Detailed explanation of each invalid ID
- ✨ Beautiful gradient design
- 📱 Responsive layout

## Algorithm

1. Parse comma-separated ranges (format: `start-end`)
2. For each number in each range:
   - Check if it has even length (required to split in half)
   - Check if first half equals second half
   - Skip numbers with leading zeros
3. Sum all invalid IDs found

## Example

Input: `11-22,95-115,998-1012`

Invalid IDs found:
- Range 11-22: **11, 22**
- Range 95-115: **99**
- Range 998-1012: **1010**

Total: 1,142
