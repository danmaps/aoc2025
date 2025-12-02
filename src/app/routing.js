import { initFromHash, setDay } from './state.js';

export function setupRouting(onDayChange) {
  initFromHash();
  window.addEventListener('hashchange', () => {
    initFromHash();
    onDayChange();
  });
}
