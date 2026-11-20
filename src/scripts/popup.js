// 메인 팝업(여러 개를 순서대로): 접속 시 표시 / 오늘 하루 보지 않기(localStorage 24h) / 닫기(X, ESC, 스크림) / 포커스 트랩
// 마크업 순서대로 하나씩 열고, 닫으면 다음 팝업이 이어서 열린다. "오늘 하루 보지 않기"는 팝업별로 따로 저장된다.
const DAY = 24 * 60 * 60 * 1000;
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// index.html <head> 인라인 스크립트의 키 규칙과 동일해야 함: `${key}-popup-hidden-until`
const storageKey = (scrim) => `${scrim.dataset.popupKey}-popup-hidden-until`;

function isHiddenToday(scrim) {
  try {
    return Number(localStorage.getItem(storageKey(scrim))) > Date.now();
  } catch {
    return false; // 저장소 접근 불가 시 항상 표시
  }
}

export function initPopup() {
  const all = [...document.querySelectorAll('[data-popup]')];
  if (!all.length) return;
  const queue = all.filter((s) => !isHiddenToday(s));
  all.forEach((s) => (s.hidden = true));
  if (!queue.length) return;

  const previouslyFocused = document.activeElement;

  const open = (i) => {
    if (i >= queue.length) {
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
      return;
    }
    const scrim = queue[i];
    const modal = scrim.querySelector('.modal');

    const close = () => {
      scrim.hidden = true;
      document.removeEventListener('keydown', onKeydown);
      open(i + 1);
    };

    const onKeydown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      // 포커스 트랩
      const items = [...modal.querySelectorAll(FOCUSABLE)].filter((el) => !el.hidden);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    scrim.querySelectorAll('[data-popup-close]').forEach((b) => b.addEventListener('click', close));
    scrim.querySelector('[data-popup-hide-today]')?.addEventListener('click', () => {
      try {
        localStorage.setItem(storageKey(scrim), String(Date.now() + DAY));
      } catch {
        /* 저장 실패해도 닫기는 수행 */
      }
      close();
    });
    // '자세히 보기' 링크(기사 이동)는 페이지를 떠나므로 별도 처리 불필요
    scrim.addEventListener('mousedown', (e) => {
      if (e.target === scrim) close();
    });

    scrim.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
    (modal.querySelector('[data-popup-close]') ?? modal).focus();
  };

  open(0);
}
