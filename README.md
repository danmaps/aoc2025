# Advent of Code 2025 - Single Page App

This is a lightweight single-page app (no bundler) that renders AoC 2025 puzzles and solutions with an AoC-like theme.

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
│  │  ├─ index.js       # Registry of all days
│  │  ├─ day01.js       # Day 1 module (Secret Entrance)
│  │  ├─ day02.js       # Day 2 module (Gift Shop)
│  │  └─ day12.js       # Stubs until unlocked
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
- Create `src/days/dayNN.js` exporting `{ title, description, unlocked, stars, render(), solvePart1(), solvePart2(), attachHandlers(root) }`.
- Register it in `src/days/index.js`.
- Use `storage.js` to persist inputs per day.

## Notes
- Day 1 visualizations expect images in `public/assets/`.
- Day 2 logic mirrors earlier React version in plain modules.
