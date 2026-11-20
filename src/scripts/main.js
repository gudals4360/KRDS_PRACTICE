import { initHeader, initFooter } from './header.js';
import { initPopup } from './popup.js';

initHeader();
initFooter();

// ---------- 점 표시(dots) 생성 ----------
function buildDots(el, count) {
  el.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const d = document.createElement('span');
    d.className = 'dots__dot';
    el.append(d);
  }
  return [...el.children];
}

// ---------- 히어로 슬라이드 ----------
function initHero() {
  const root = document.querySelector('.hero');
  if (!root) return;
  const slides = [...root.querySelectorAll('.hero__slide')];
  const texts = [...root.querySelectorAll('[data-hero-text]')];
  const dots = buildDots(root.querySelector('[data-hero-dots]'), slides.length);
  const current = root.querySelector('[data-hero-current]');
  const detail = root.querySelector('[data-hero-detail]');
  const toggle = root.querySelector('[data-hero-toggle]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let timer = null;
  let playing = !reduce.matches;

  const show = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => (s.hidden = n !== index));
    texts.forEach((t, n) => (t.hidden = n !== index));
    dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
    current.textContent = String(index + 1);
    const href = texts[index].querySelector('.hero__href')?.getAttribute('href');
    if (href && detail) detail.setAttribute('href', href);
    // 현재 슬라이드의 이미지는 lazy 대기하지 않도록
    slides[index].querySelector('img')?.setAttribute('loading', 'eager');
  };
  const play = () => {
    clearInterval(timer);
    timer = setInterval(() => show(index + 1), 5000);
  };
  const setPlaying = (on) => {
    playing = on;
    on ? play() : clearInterval(timer);
    toggle.setAttribute('aria-label', on ? '자동 재생 정지' : '자동 재생 시작');
    toggle.innerHTML = on
      ? '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>'
      : '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
  };

  root.querySelector('[data-hero-prev]').addEventListener('click', () => show(index - 1));
  root.querySelector('[data-hero-next]').addEventListener('click', () => show(index + 1));
  toggle.addEventListener('click', () => setPlaying(!playing));
  // 포커스/호버 중에는 자동 전환 일시 정지
  root.addEventListener('focusin', () => clearInterval(timer));
  root.addEventListener('focusout', () => playing && play());
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', () => playing && play());

  show(0);
  setPlaying(playing);
}

// ---------- 지금 만나는 전시 (가로 스크롤 스냅 + 화살표) ----------
function initNow() {
  const track = document.querySelector('[data-now-track]');
  if (!track) return;
  const cards = [...track.children];
  const dotsEl = document.querySelector('[data-now-dots]');
  let dots = [];

  const perView = () => Math.max(1, Math.round(track.clientWidth / cards[0].getBoundingClientRect().width));
  const pageCount = () => Math.max(1, cards.length - perView() + 1);
  const rebuild = () => {
    dots = buildDots(dotsEl, pageCount());
    update();
  };
  const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
  const update = () => {
    const i = Math.round(track.scrollLeft / step());
    dots.forEach((d, n) => d.classList.toggle('is-active', n === Math.min(i, dots.length - 1)));
  };
  const go = (dir) => track.scrollBy({ left: dir * step(), behavior: 'smooth' });

  document.querySelector('[data-now-prev]').addEventListener('click', () => go(-1));
  document.querySelector('[data-now-next]').addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', rebuild);
  rebuild();
}

// ---------- 뉴스 탭 필터 ----------
function initNews() {
  const tabs = [...document.querySelectorAll('[data-news-tabs] [role="tab"]')];
  const items = [...document.querySelectorAll('[data-news-list] .news-card')];
  const empty = document.querySelector('[data-news-empty]');
  const more = document.querySelector('[data-news-more]');
  const board = document.querySelector('[data-news-board]');
  if (!tabs.length) return;
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      const f = tab.dataset.filter;
      let shown = 0;
      items.forEach((it) => {
        const ok = f === 'all' || it.dataset.cat === f;
        it.hidden = !ok;
        if (ok) shown += 1;
      });
      empty.hidden = shown > 0;
      // 더보기·게시판 바로가기는 선택한 분류의 게시판으로 이동
      const href = tab.dataset.href || './notice.html';
      if (more) more.setAttribute('href', href);
      if (board) board.setAttribute('href', href);
    }),
  );
}

initHero();
initNow();
initNews();
initPopup();
