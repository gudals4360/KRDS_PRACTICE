// 시설 뷰어: 시설 선택 시 사진과 선택 상태(aria-selected)가 바뀜. 화살표 키로 이동 가능.
export function initViewer() {
  const root = document.querySelector('[data-viewer]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const photos = [...root.querySelectorAll('[data-photo]')];

  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    photos.forEach((p) => (p.hidden = p.dataset.photo !== tab.dataset.target));
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        select(tabs[e.key === 'Home' ? 0 : tabs.length - 1], true);
      }
    });
  });
}
