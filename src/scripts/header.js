// 헤더: 데스크톱 메가메뉴(호버/클릭/포커스), 햄버거 전체 메뉴, 푸터 아코디언
export function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const buttons = [...header.querySelectorAll('.gnb__btn')];
  const panels = [...header.querySelectorAll('.mega')];
  const toggle = header.querySelector('.menu-toggle');
  const full = document.getElementById('fullmenu');
  const fullClose = header.querySelector('.fullmenu__close');
  const canHover = window.matchMedia('(hover: hover)');

  let closeTimer;

  const closeMega = () => {
    buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    panels.forEach((p) => (p.hidden = true));
  };
  const openMega = (id) => {
    closeFull();
    buttons.forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.mega === id)));
    panels.forEach((p) => (p.hidden = p.id !== `mega-${id}`));
  };
  const closeFull = () => {
    if (!full || full.hidden) return;
    full.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '전체 메뉴 열기');
  };
  const openFull = () => {
    closeMega();
    full.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '전체 메뉴 닫기');
  };

  let openedByHover = null; // 호버로 막 열린 메뉴: 이어지는 클릭은 닫지 않고 고정

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      if (open && openedByHover === btn) {
        openedByHover = null; // 호버로 열린 뒤 클릭 → 열린 상태 유지
        return;
      }
      open ? closeMega() : openMega(btn.dataset.mega);
    });
    // 호버로 열기 (마우스 환경)
    btn.addEventListener('mouseenter', () => {
      if (!canHover.matches) return;
      clearTimeout(closeTimer);
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';
      openMega(btn.dataset.mega);
      openedByHover = wasOpen ? null : btn;
    });
  });

  header.addEventListener('mouseleave', () => {
    if (!canHover.matches) return;
    closeTimer = setTimeout(closeMega, 150);
  });
  header.addEventListener('mouseenter', () => clearTimeout(closeTimer));

  toggle?.addEventListener('click', () => (full.hidden ? openFull() : closeFull()));
  fullClose?.addEventListener('click', () => {
    closeFull();
    toggle.focus();
  });

  // ESC로 닫기 / 바깥 클릭으로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const wasMega = panels.some((p) => !p.hidden);
    const wasFull = full && !full.hidden;
    if (!wasMega && !wasFull) return;
    const active = buttons.find((b) => b.getAttribute('aria-expanded') === 'true');
    closeMega();
    closeFull();
    (wasFull ? toggle : active)?.focus();
  });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      closeMega();
      closeFull();
    }
  });
  // 키보드로 메가메뉴 밖으로 포커스가 나가면 닫기
  header.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !header.contains(e.relatedTarget)) closeMega();
  });

  // 현재 페이지 메뉴 표시
  const here = location.pathname.split('/').pop() || 'index.html';
  header.querySelectorAll('.mega__title, .mega__link, .fullmenu__link').forEach((a) => {
    if (a.getAttribute('href')?.split('#')[0].replace('./', '') === here) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

// 푸터 패밀리 사이트 아코디언
export function initFooter() {
  document.querySelectorAll('.family__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });
}
