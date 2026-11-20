import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pagesDir = resolve(__dirname, 'src/pages');
const componentsDir = resolve(__dirname, 'src/components');

// 공통 아이콘(currentColor 사용 → 토큰 색상으로 제어)
const icons = {
  'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
  'chevron-left': '<path d="M15 5l-7 7 7 7"/>',
  'chevron-right': '<path d="M9 5l7 7-7 7"/>',
  'chevron-down': '<path d="M5 9l7 7 7-7"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  minus: '<path d="M4 12h16"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
  'open-new-window':
    '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};
const svg = (name, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name] ?? ''}</svg>`;

// 메뉴 데이터(src/components/menu-data.json) → 빌드 시 정적 HTML로 변환
const menu = JSON.parse(readFileSync(resolve(componentsDir, 'menu-data.json'), 'utf8'));
const attrs = (c) => (c.external ? ' target="_blank" rel="noopener"' : '');
const extMark = (c) =>
  c.external ? `${svg('open-new-window', 'icon--sm')}<span class="sr-only">(새 창)</span>` : '';

const renderMenu = (kind) => {
  if (kind === 'nav') {
    return menu
      .map(
        (g) =>
          `<li class="gnb__item"><button type="button" class="gnb__btn" aria-expanded="false" aria-controls="mega-${g.id}" data-mega="${g.id}">${g.title}</button></li>`,
      )
      .join('');
  }
  if (kind === 'mega') {
    return menu
      .map((g) => {
        const cells = g.cells
          .map((c) => {
            const kids = (c.children ?? [])
              .map(
                (k) =>
                  `<a class="mega__link" href="${k.href}"${attrs(k)}><span class="mega__bullet" aria-hidden="true"></span>${k.title}${extMark(k)}</a>`,
              )
              .join('');
            return `<div class="mega__cell"><a class="mega__title" href="${c.href}"${attrs(c)}><span class="mega__bar" aria-hidden="true"></span>${c.title}${extMark(c)}</a>${kids}</div>`;
          })
          .join('');
        return `<div class="mega" id="mega-${g.id}" role="region" aria-label="${g.title}" hidden><div class="mega__grid">${cells}</div></div>`;
      })
      .join('');
  }
  // full: 햄버거 전체 메뉴
  return menu
    .map((g) => {
      const items = g.cells
        .map(
          (c) =>
            `<li><a class="fullmenu__link" href="${c.href}"${attrs(c)}><span class="mega__bullet" aria-hidden="true"></span>${c.title}${extMark(c)}</a></li>`,
        )
        .join('');
      return `<div class="fullmenu__group"><p class="fullmenu__title">${g.title}</p><ul>${items}</ul></div>`;
    })
    .join('');
};

// <!--@include name--> → src/components/name.html, <!--@menu:nav|mega|full-->, {{icon:name[:class]}}
function includes() {
  const expand = (html) => {
    let out = html.replace(/<!--@include ([\w-]+)-->/g, (_, name) =>
      expand(readFileSync(resolve(componentsDir, `${name}.html`), 'utf8')),
    );
    out = out.replace(/<!--@menu:(nav|mega|full)-->/g, (_, k) => renderMenu(k));
    out = out.replace(/\{\{icon:([\w-]+)(?::([\w-]+))?\}\}/g, (_, n, c) => svg(n, c));
    return out;
  };
  return {
    name: 'html-includes',
    transformIndexHtml: { order: 'pre', handler: expand },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(componentsDir)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

const input = Object.fromEntries(
  readdirSync(pagesDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace('.html', ''), resolve(pagesDir, f)]),
);

export default defineConfig({
  root: pagesDir,
  base: './',
  publicDir: resolve(__dirname, 'public'),
  plugins: [includes()],
  // 페이지(src/pages)가 root라서 ../scripts, ../styles 요청이 /scripts, /styles 로 들어오는 것을 매핑
  resolve: {
    alias: [
      { find: /^\/scripts\//, replacement: resolve(__dirname, 'src/scripts') + '/' },
      { find: /^\/styles\//, replacement: resolve(__dirname, 'src/styles') + '/' },
    ],
  },
  server: { fs: { allow: [__dirname] } },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input },
  },
});
