export const LANGS = ['ko', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const CATEGORIES = ['flutter', 'native', 'security', 'deploy'] as const;
export type Category = (typeof CATEGORIES)[number];

const ko = {
  htmlLang: 'ko',
  langName: '한국어',
  otherLangLabel: 'EN',
  otherLangName: 'English',
  siteName: '허진영 개발 블로그',
  siteDescription: 'Flutter 앱과 웹사이트를 혼자 기획하고 만들며 배운 것을 기록합니다.',
  author: '허진영',
  nav: { home: '홈', projects: '프로젝트', posts: '글', about: '소개', changelog: '업데이트 기록' },
  skip: '본문으로 건너뛰기',
  themeToggle: '라이트/다크 모드 전환',
  langSwitch: 'English로 보기',
  home: {
    eyebrow: 'Flutter · Firebase · 보안',
    title: '기획부터 스토어 출시까지, 혼자 만든 앱과 웹의 기록',
    sub: 'Flutter 앱 5개와 웹 프로젝트 2개를 만들며 부딪힌 문제와 해결 과정을 정리합니다.',
    ctaProjects: '프로젝트 보기',
    ctaPosts: '최근 글 읽기',
    stats: [
      { v: '7', l: '프로젝트' },
      { v: '5', l: 'Google Play 비공개 테스트' },
    ],
    postsStat: '글',
    projects: '프로젝트',
    recent: '최근 글',
    seeAll: '전체 보기',
  },
  projects: {
    title: '프로젝트',
    sub: '직접 기획하고 만든 앱과 웹사이트입니다.',
    all: '전체',
    app: 'Flutter 앱',
    web: '웹',
    detail: '자세히 보기',
    code: 'GitHub 코드',
    codePrivate: '코드 비공개',
    period: '개발 기간',
    platform: '플랫폼',
    status: '상태',
    version: '버전',
    screens: '스크린샷',
    features: '핵심 기능',
    stack: '기술 스택',
    arch: '구조',
    trouble: '문제 해결',
    problem: '문제',
    solution: '해결',
    related: '관련 글',
    noRelated: '아직 관련 글이 없습니다.',
    prev: '이전 프로젝트',
    next: '다음 프로젝트',
  },
  posts: {
    title: '글',
    sub: '만들면서 배운 것을 문제 → 원인 → 해결 → 배운 점 순서로 씁니다.',
    all: '전체',
    search: '글 검색',
    searchPlaceholder: '제목이나 내용으로 찾기',
    empty: '조건에 맞는 글이 없습니다.',
    draft: '초안',
    draftNote: '이 글은 저장소와 포트폴리오 내용을 바탕으로 작성한 초안입니다. 검토 후 내용이 바뀔 수 있습니다.',
    toc: '목차',
    prev: '이전 글',
    next: '다음 글',
    comments: '댓글',
    project: '프로젝트',
    minRead: '분',
    backToList: '글 목록으로',
  },
  categories: { flutter: 'Flutter', native: '네이티브 연동', security: '보안', deploy: '배포·출시' } as Record<Category, string>,
  about: {
    title: '소개',
    role: 'Flutter Developer',
    intro:
      '통신·네트워크 현장에서 4년간 일한 뒤 Flutter 개발자가 되었습니다. Claude·Gemini·ChatGPT Codex 같은 AI 도구를 활용해 기획부터 설계, 구현, 스토어 배포까지 혼자 진행합니다. 기능을 만든 뒤에는 스스로 보안 점검을 하고, 찾은 문제와 해결 과정을 이 블로그에 기록합니다.',
    photoAlt: '산을 배경으로 선 허진영',
    skills: '기술',
    timeline: '경력 · 교육',
    certs: '자격',
    contact: '연락',
    portfolio: '포트폴리오 사이트',
  },
  changelog: { title: '업데이트 기록', sub: '앱별 주요 버전의 변경 내역입니다. 최신 버전이 위에 있습니다.' },
  footer: { note: '정적 사이트 · GitHub Pages', rss: 'RSS' },
  notFound: { title: '페이지를 찾을 수 없습니다', body: '주소가 바뀌었거나 없는 페이지입니다.', home: '홈으로' },
};

const en: typeof ko = {
  htmlLang: 'en',
  langName: 'English',
  otherLangLabel: '한국어',
  otherLangName: '한국어',
  siteName: 'Heo Jinyoung · Dev Blog',
  siteDescription: 'Notes from planning and building Flutter apps and websites on my own.',
  author: 'Heo Jinyoung',
  nav: { home: 'Home', projects: 'Projects', posts: 'Posts', about: 'About', changelog: 'Changelog' },
  skip: 'Skip to content',
  themeToggle: 'Toggle light/dark mode',
  langSwitch: '한국어로 보기',
  home: {
    eyebrow: 'Flutter · Firebase · Security',
    title: 'From idea to app store: notes from building apps and sites solo',
    sub: 'What I ran into, and how I solved it, while building five Flutter apps and two web projects.',
    ctaProjects: 'See projects',
    ctaPosts: 'Read recent posts',
    stats: [
      { v: '7', l: 'Projects' },
      { v: '5', l: 'In Google Play closed testing' },
    ],
    postsStat: 'Posts',
    projects: 'Projects',
    recent: 'Recent posts',
    seeAll: 'See all',
  },
  projects: {
    title: 'Projects',
    sub: 'Apps and websites I planned and built myself.',
    all: 'All',
    app: 'Flutter apps',
    web: 'Web',
    detail: 'View details',
    code: 'Code on GitHub',
    codePrivate: 'Code private',
    period: 'Timeline',
    platform: 'Platform',
    status: 'Status',
    version: 'Version',
    screens: 'Screenshots',
    features: 'Key features',
    stack: 'Tech stack',
    arch: 'Structure',
    trouble: 'Problem solving',
    problem: 'Problem',
    solution: 'Solution',
    related: 'Related posts',
    noRelated: 'No related posts yet.',
    prev: 'Previous project',
    next: 'Next project',
  },
  posts: {
    title: 'Posts',
    sub: 'What I learned, written as problem → cause → fix → takeaways.',
    all: 'All',
    search: 'Search posts',
    searchPlaceholder: 'Search titles and summaries',
    empty: 'No posts match.',
    draft: 'Draft',
    draftNote: 'This is a draft written from the project repositories and portfolio. It may change after review.',
    toc: 'Contents',
    prev: 'Previous',
    next: 'Next',
    comments: 'Comments',
    project: 'Project',
    minRead: 'min read',
    backToList: 'All posts',
  },
  categories: { flutter: 'Flutter', native: 'Native', security: 'Security', deploy: 'Release' },
  about: {
    title: 'About',
    role: 'Flutter Developer',
    intro:
      'After four years in telecom and network field work, I became a Flutter developer. I use AI tools such as Claude, Gemini and ChatGPT Codex to take each project from planning and design through to store release on my own. Once a feature works, I audit it for security, and I write up what I find here.',
    photoAlt: 'Heo Jinyoung standing in front of a mountain',
    skills: 'Skills',
    timeline: 'Experience · Education',
    certs: 'Certifications',
    contact: 'Contact',
    portfolio: 'Portfolio site',
  },
  changelog: { title: 'Changelog', sub: 'Notable versions of each app, newest first.' },
  footer: { note: 'Static site · GitHub Pages', rss: 'RSS' },
  notFound: { title: 'Page not found', body: 'The address may have changed, or the page does not exist.', home: 'Go home' },
};

export const UI = { ko, en };
export const t = (lang: Lang) => UI[lang];

/** BASE_URL을 슬래시 하나로 끝나게 정리 */
export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** 언어별 내부 링크. path는 'projects/' 처럼 앞 슬래시 없이, 끝 슬래시 포함 */
export const href = (lang: Lang, path = '') => `${base}${lang}/${path}`;

/** public/ 아래 파일 경로 */
export const asset = (path: string) => `${base}${path.replace(/^\//, '')}`;

export const otherLang = (lang: Lang): Lang => (lang === 'ko' ? 'en' : 'ko');

export const formatDate = (lang: Lang, d: Date) =>
  new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }).format(d);

export const langPaths = () => LANGS.map((lang) => ({ params: { lang } }));
