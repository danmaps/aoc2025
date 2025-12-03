# Advent of Code 2025 — Single Page App

Lightweight SPA (no bundler) for viewing and solving AoC 2025 puzzles with an Advent of Code–style theme.

## Structure
```
aoc2025/
├─ public/
│  ├─ index.html        # Skeleton page, divs for list + main content
│  └─ assets/           # Images used by puzzles (e.g., Day 1 dial)
├─ src/
│  ├─ app/
│  │  ├─ main.js        # Entry point: bootstraps the UI, hooks events
│  │  ├─ state.js       # Current day and part, URL hash
│  │  ├─ layout.js      # DOM helpers and rendering functions
│  │  └─ routing.js     # Sync selected day <-> URL (#day=3)
│  ├─ days/
│  │  ├─ index.js       # Registry of all day modules
│  │  ├─ dayNN.js       # Individual day modules (render + logic)
│  ├─ core/
│  │  └─ storage.js     # localStorage helpers
│  └─ styles/
│     └─ main.css       # AoC-like styling
```

## Running
Open `public/index.html` in your browser directly, or serve the `public/` folder with a simple web server to avoid cross-origin issues.

### Windows cmd
```bat
cd public
start index.html
```

Or, use Python simple server:
```bat
cd public
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Adding New Days
- Create `src/days/dayNN.js` that exports `{ title, description, unlocked, stars, render(), solvePart1(), solvePart2(), attachHandlers(root) }`.
- Register the module in `src/days/index.js`.
- Use `src/core/storage.js` to persist inputs per day.

## Notes
- Visual assets should be placed in `public/assets/` and referenced from day modules.
