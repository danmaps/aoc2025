const KEY_LAST_DAY = 'aoc:lastDay';
const KEY_INPUT_PREFIX = 'aoc:input:';

export function saveLastDay(day) {
  try { localStorage.setItem(KEY_LAST_DAY, String(day)); } catch {}
}

export function loadLastDay() {
  try {
    const v = localStorage.getItem(KEY_LAST_DAY);
    return v ? parseInt(v, 10) : null;
  } catch { return null; }
}

export function saveInput(day, text) {
  try { localStorage.setItem(KEY_INPUT_PREFIX + day, text); } catch {}
}

export function loadInput(day) {
  try { return localStorage.getItem(KEY_INPUT_PREFIX + day) || ''; } catch { return ''; }
}
