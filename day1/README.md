# Advent of Code 2025 - Day 1: Secret Entrance

## Problem Summary
The safe has a dial with numbers 0-99. You need to follow a sequence of rotations (L for left, R for right) and count how many times the dial points to 0.

## Solution
The password for the example input is **3** (the dial points at 0 three times during the rotation sequence).

## How It Works
1. The dial starts at position 50
2. Each rotation moves the dial by a certain number of clicks
3. The dial wraps around (0-99 is circular)
4. We count every time the dial lands on 0

## Usage

### Replace the input with your puzzle input:
Edit `input.txt` with your actual puzzle input from Advent of Code.

### Run the solution:
```bash
python solution.py
```

This will:
- Print the step-by-step simulation to console
- Display the password (number of times dial points at 0)
- Generate two visualizations:
  - `dial_static.png` - Grid showing all steps
  - `dial_animation.gif` - Animated version showing the dial rotating

## Visualizations

### Static Visualization
Shows all steps in a grid format with:
- A circular dial with numbers
- Red arrow pointing to current position
- Step number and rotation instruction
- Stars (★) marking when the dial lands on 0

### Animated Visualization
An animated GIF showing:
- The dial rotating through each step
- Current position and rotation info
- Running count of zeros encountered

## Example Output
```
The dial starts by pointing at 50.
The dial is rotated L68 to point at 82.
The dial is rotated L30 to point at 52.
The dial is rotated R48 to point at 0.
The dial is rotated L5 to point at 95.
The dial is rotated R60 to point at 55.
The dial is rotated L55 to point at 0.
The dial is rotated L1 to point at 99.
The dial is rotated L99 to point at 0.
The dial is rotated R14 to point at 14.
The dial is rotated L82 to point at 32.

The dial points at 0 a total of 3 times.
Password: 3
```

## Requirements
- Python 3.x
- matplotlib
- numpy

Install dependencies:
```bash
pip install matplotlib numpy
```
