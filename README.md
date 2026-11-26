# 허진영 개발 블로그

Flutter 앱과 웹사이트를 혼자 기획하고 만들며 배운 것을 기록하는 블로그입니다. 한국어·영어, 라이트·다크 모드를 지원합니다.

- 주소: https://herjy6372.github.io/blog/
- 만든 도구: [Astro](https://astro.build) 5 (정적 사이트), GitHub Pages, GitHub Actions

## 로컬에서 실행

```bash
npm ci
npm run dev        # http://localhost:4321/blog/
npm run build      # 타입 검사 후 dist/ 에 빌드
npm run preview    # 빌드 결과 미리보기
```

## 구조

```
src/
├── config.ts               GitHub·포트폴리오 주소, Giscus 댓글 설정
├── i18n.ts                 한국어·영어 문구와 링크 도우미
├── data/projects.ts        프로젝트 7개 (설명·기능·문제 해결·스크린샷)
├── data/changelog.ts       업데이트 기록
├── content/posts/ko/*.md   한국어 글
├── content/posts/en/*.md   영어 글 (같은 파일 이름 = 같은 글)
├── layouts/Base.astro      공통 머리글·바닥글, CSP, 테마
├── pages/[lang]/…          /ko/…, /en/… 페이지
└── styles/global.css       색 토큰(라이트·다크)과 스타일
public/
├── images/                 프로젝트 스크린샷
└── js/                     테마·언어·필터 스크립트 (CSP 때문에 인라인 스크립트 없음)
```

## 글 쓰기

`src/content/posts/ko/새-글.md`와 `src/content/posts/en/새-글.md`를 만듭니다.

```markdown
---
title: 글 제목
description: 목록과 검색 결과에 보이는 한두 문장 요약
date: 2026-12-01
category: flutter        # flutter | native | security | deploy
project: mytodo          # data/projects.ts 의 slug
order: 11                # 같은 날짜일 때 순서, 시리즈 이전/다음 글 순서
draft: false             # true면 '초안' 표시
---
```

`draft: true`로 두면 글 목록과 본문에 "초안" 표시가 붙습니다. 검토가 끝나면 `false`로 바꿉니다.

## 배포 (처음 한 번)

1. GitHub 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다.
2. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 빌드해서 배포합니다.

## 댓글 켜기 (선택)

1. 저장소 **Settings → General → Features**에서 **Discussions**를 켭니다.
2. https://github.com/apps/giscus 를 이 저장소에 설치합니다.
3. https://giscus.app 에서 저장소와 카테고리를 고르면 `repo-id`, `category-id`가 나옵니다.
4. `src/config.ts`의 `giscus` 값을 채웁니다. 비어 있으면 댓글 영역은 나타나지 않습니다.

## 보안 메모

- GitHub Pages는 응답 헤더를 바꿀 수 없어 `<meta http-equiv="Content-Security-Policy">`로 CSP를 적용합니다. 스크립트는 같은 사이트의 파일만 허용합니다(`script-src 'self'`).
- 글에 코드를 붙일 때 API 키, keystore 비밀번호, Firebase 관리자 이메일 같은 값은 가짜 값으로 바꿉니다.
- 스크린샷에 실명·이메일·전화번호·실제 데이터가 보이지 않는지 확인합니다.
