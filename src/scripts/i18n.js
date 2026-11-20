// i18n: 키 기반 사전(src/i18n/<lang>.json) + data-i18n 속성
//   data-i18n="key"            → textContent 교체
//   data-i18n-html="key"       → innerHTML 교체 (줄바꿈·강조 span 등이 섞인 문구)
//   data-i18n-attr="attr:key;attr2:key2" → 속성(alt, aria-label, placeholder, content …) 교체
// 새 언어 추가: ① src/i18n/ja.json 작성(ko.json 의 모든 키) ② 아래 LANGS·INLINE 에 등록 ③ header.html 의 Language 메뉴에 항목 추가
// 사전(JSON)은 필요할 때만 동적으로 불러온다 → 한국어(기본) 사용자는 추가 다운로드가 없다.
export const LANGS = ['ko', 'en'];
const DEFAULT_LANG = 'ko'; // 마크업(HTML)에 들어 있는 기본 언어
const STORAGE_KEY = 'lang';

// 스크립트에서 바로 쓰는 소수의 문구는 코드에 내장(사전 로딩 전에도 동작)
const INLINE = {
  ko: { 'js.menu.open': '전체 메뉴 열기', 'js.menu.close': '전체 메뉴 닫기', 'js.hero.pause': '자동 재생 정지', 'js.hero.play': '자동 재생 시작' },
  en: { 'js.menu.open': 'Open full menu', 'js.menu.close': 'Close full menu', 'js.hero.pause': 'Pause autoplay', 'js.hero.play': 'Start autoplay' },
};
const loaded = {}; // lang -> 사전
let current = DEFAULT_LANG;

async function load(lang) {
  if (!loaded[lang]) loaded[lang] = (await import(`../i18n/${lang}.json`)).default;
  return loaded[lang];
}

export function getLang() {
  // ?lang=en 으로 지정하면 저장 후 그대로 사용
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) {
      localStorage.setItem(STORAGE_KEY, q);
      return q;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {
    /* 저장소 접근 불가 → 기본 언어 */
  }
  return DEFAULT_LANG;
}

/** 키 → 현재 언어 문구 (없으면 한국어, 그것도 없으면 키) */
export function t(key) {
  return loaded[current]?.[key] ?? INLINE[current]?.[key] ?? INLINE[DEFAULT_LANG][key] ?? loaded[DEFAULT_LANG]?.[key] ?? key;
}

export async function applyLang(lang, { persist = false } = {}) {
  if (!LANGS.includes(lang)) return;
  await load(lang);
  current = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const i = pair.indexOf(':');
      if (i > 0) el.setAttribute(pair.slice(0, i), t(pair.slice(i + 1)));
    });
  });
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* 무시 */
    }
  }
  document.querySelectorAll('[data-lang-option]').forEach((b) => {
    if (b.dataset.langOption === lang) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

// Language 버튼(드롭다운) 동작 + 초기 언어 적용
export function initI18n() {
  const root = document.querySelector('[data-lang]');
  const btn = root?.querySelector('.lang__btn');
  const menu = root?.querySelector('.lang__menu');

  const close = () => {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    (menu.querySelector('[aria-current]') ?? menu.querySelector('button'))?.focus();
  };

  if (btn && menu) {
    btn.addEventListener('click', () => (menu.hidden ? open() : close()));
    menu.querySelectorAll('[data-lang-option]').forEach((b) =>
      b.addEventListener('click', async () => {
        await applyLang(b.dataset.langOption, { persist: true });
        close();
        btn.focus();
      }),
    );
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        close();
        btn.focus();
      }
    });
    root.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !root.contains(e.relatedTarget)) close();
    });
  }

  const lang = getLang();
  if (lang !== DEFAULT_LANG) applyLang(lang); // 비동기: 사전 로딩 후 적용
  else document.querySelectorAll('[data-lang-option="ko"]').forEach((b) => b.setAttribute('aria-current', 'true'));
}
