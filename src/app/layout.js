export const els = {
  main: document.getElementById('main'),
  sidebar: document.getElementById('sidebar'),
};

export function renderSidebar(days, currentDay) {
  els.sidebar.innerHTML = `<h2>Calendar</h2>` + days.map((day, idx) => {
    const isHome = idx === 0;
    const label = isHome ? 'Home' : `Day ${idx}`;
    const dayId = idx; // 0-based: 0=Home, 1=Day1
    const unlocked = day.unlocked !== false;
    const classes = ['day-item', unlocked ? 'unlocked' : 'locked', dayId === currentDay ? 'active' : ''].join(' ');
    const stars = day.stars || (isHome ? '' : '');
    return `<div class="${classes}" data-day="${dayId}"><span>${label}</span><span class="stars">${stars}</span></div>`;
  }).join('');
}

export function renderArticle(html) {
  els.main.innerHTML = html;
}

export function onSidebarClick(handler) {
  els.sidebar.addEventListener('click', (e) => {
    const item = e.target.closest('.day-item.unlocked');
    if (!item) return;
    const day = parseInt(item.dataset.day, 10);
    handler(day);
  });
}