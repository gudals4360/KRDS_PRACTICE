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
