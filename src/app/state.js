export const state = {
  currentDay: 0,
  currentPart: 'part1',
};

export function setDay(day) {
  state.currentDay = day;
  updateHash();
}

export function setPart(part) {
  state.currentPart = part;
}

export function initFromHash() {
  const params = new URLSearchParams(location.hash.replace('#', ''));
  const day = parseInt(params.get('day'), 10);
  if (!isNaN(day) && day >= 0 && day <= 12) {
    state.currentDay = day;
  }
}

export function updateHash() {
  const params = new URLSearchParams(location.hash.replace('#', ''));
  params.set('day', String(state.currentDay));
  location.hash = params.toString();
}