import { days } from '../days/index.js';
import { els, renderSidebar, renderArticle, onSidebarClick } from './layout.js';
import { state, setDay } from './state.js';
import { setupRouting } from './routing.js';
import { loadInput, saveInput, saveLastDay, loadLastDay } from '../core/storage.js';

function renderDay() {
  const dayMod = days[state.currentDay];
  const html = dayMod.render();
  renderArticle(html);
  const root = els.main.querySelector('.article');

  // Restore input if element exists
  const inputEl = root.querySelector('#puzzle-input');
  if (inputEl) {
    const saved = loadInput(state.currentDay);
    if (saved) inputEl.value = saved;
    inputEl.addEventListener('input', () => saveInput(state.currentDay, inputEl.value));
  }

  // Attach handlers if provided
  if (typeof dayMod.attachHandlers === 'function') {
    dayMod.attachHandlers(root);
  }

  renderSidebar(days, state.currentDay);
}

function bootstrap() {
  // Load last day from storage if present
  const last = loadLastDay();
  if (last) setDay(last);

  setupRouting(renderDay);
  renderDay();

  onSidebarClick((day) => {
    setDay(day);
    saveLastDay(day);
    renderDay();
  });
}

bootstrap();
