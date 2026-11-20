# 천연기념물센터 (KRDS 실습)

Figma 「KRDS를 활용한 실습」 최종 페이지를 구현한 반응형 정적 웹사이트입니다. (Vite + 바닐라 HTML/CSS/JS)

> 이 누리집은 대한민국 공식 전자정부 누리집이 아니라 KRDS를 활용한 UX/UI 디자인 실습 페이지입니다.

## 실행

```powershell
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 로 정적 빌드
npm run preview  # 빌드 결과 미리보기
```

## 구조

- `src/pages` — 페이지(26개). 공통 헤더·푸터·팝업은 `<!--@include name-->` 로 빌드 시 삽입
- `src/components` — 재사용 조각(header, footer, 팝업, 만족도 조사, 메뉴 데이터 `menu-data.json`)
- `src/styles` — `tokens.css`(KRDS 토큰) + 컴포넌트/페이지 CSS
- `src/scripts` — 헤더·메가메뉴, 팝업, 시설 뷰어, 메인 슬라이드
- `public/images` — 이미지(교체용 자리표시는 코드의 `TODO` 주석 참고)

## 다국어(i18n)

키 기반 사전 방식입니다. 한국어가 기본이며(HTML에 그대로 들어 있음), 영어·중국어 간체(zh-CN)·중국어 번체(zh-TW)는 사전으로 교체합니다.

- 사전: `src/i18n/ko.json`, `en.json`, `zh-CN.json`, `zh-TW.json` (같은 키 구조). 필요할 때만 동적으로 불러옵니다.
- 마크업: `data-i18n="key"`(텍스트), `data-i18n-html="key"`(줄바꿈·강조가 섞인 문구), `data-i18n-attr="alt:key;aria-label:key2"`(속성)
- 언어 선택: 오른쪽 상단 **Language** 버튼(지구본 아이콘). 선택은 `localStorage('lang')`에 저장되고 `?lang=en` 으로도 지정할 수 있습니다.
- 메뉴(`src/components/menu-data.json`)는 항목마다 `key` 가 있어 빌드 시 `data-i18n` 으로 출력됩니다.
- 새 언어 추가: `src/i18n/<lang>.json` 작성 → `src/scripts/i18n.js` 의 `LANGS`·`INLINE` 등록 → `src/components/header.html` 의 Language 메뉴에 항목 추가.
- 문구를 바꿀 때는 HTML의 한국어 텍스트와 `ko.json`, `en.json` 의 같은 키를 함께 수정하세요.

## 팝업 다시 보기

메인의 팝업은 '오늘 하루 보지 않기'를 누르면 24시간 동안 숨겨집니다(브라우저 저장소 사용). 다시 보려면 주소 뒤에 `?popup=show` 를 붙여 여세요.
예: `https://krds-practice.vercel.app/index.html?popup=show`
