type Entry = { project: string; version: string; date?: string; ko: string[]; en: string[] };

/** 최신이 위. date는 확인된 것만 적습니다. */
export const CHANGELOG: Entry[] = [
  {
    project: 'mytodo', version: '1.6.3', date: '2026-11-24',
    ko: ['메모 글 서식: 크기·굵게·기울임·밑줄·취소선·글자색·형광·정렬·목록·체크리스트', '메모 그림 그리기: 펜·형광펜·지우개·글상자·이동, 실행 취소·다시 실행', '화면 폭에 따라 2~6칸으로 바뀌는 메모 목록, 가로 화면 배치'],
    en: ['Rich-text memos: size, bold, italic, underline, strikethrough, colour, highlight, alignment, lists, checklists', 'Drawing in memos: pen, highlighter, eraser, text box, move, undo/redo', 'Memo grid that adapts from 2 to 6 columns, landscape layout'],
  },
  {
    project: 'bible-praise', version: '1.5.0', date: '2026-11-22',
    ko: ['성경 비교 보기: 휴대폰은 절마다 위아래, 태블릿 가로는 좌우로', '읽기표 분량 표기를 “창 1장~3장”으로'],
    en: ['Side-by-side translations: stacked per verse on phones, two columns on landscape tablets', 'Reading plan ranges written in full chapters'],
  },
  {
    project: 'mytodo', version: '1.6.2',
    ko: ['R8 코드·리소스 축소와 Dart 난독화, 신규 설치 크기 19.7MB → 12.1MB', 'edge-to-edge 화면, 암호화되지 않은 http 통신 차단', '큰 글씨 모드·삭제 되돌리기·백업 파일·홈 메뉴 편집', '타이머·세계시각·메모와 타이머 위젯도 로그인 필요'],
    en: ['R8 shrinking and Dart obfuscation: fresh install 19.7 MB → 12.1 MB', 'Edge-to-edge display, cleartext http blocked', 'Large-text mode, undo delete, backup files, editable home menu', 'Timer, world clock, memos and the timer widget now require sign-in'],
  },
  {
    project: 'mytodo', version: '1.6.1',
    ko: ['앱 이름과 아이콘에서 Beta 표기 제거', '기분 한 줄·가계부·테마를 모든 등급에 개방', '알람 시각에 전체 화면 알람과 1분간 소리·진동, 다시 울림'],
    en: ['Dropped the Beta label from name and icon', 'Mood log, ledger and themes open to every tier', 'Full-screen alarm with one minute of sound and vibration, snooze'],
  },
  {
    project: 'mytodo', version: '1.6.0',
    ko: ['메모와 알람(아침 깨우기·잘 때·일반) 추가', 'Android·iOS 홈 화면 위젯 9종'],
    en: ['Memos and alarms (wake-up, bedtime, general)', 'Nine Android and iOS home-screen widgets'],
  },
  {
    project: 'bible-praise', version: '1.4.0', date: '2026-11-15',
    ko: ['색상 권 선택(구약 파랑·신약 빨강)과 절 선택', '여러 절 선택·복사·형광펜 4색', '2027 성경읽기표'],
    en: ['Colour-coded book picker and verse picker', 'Multi-verse select, copy and four highlight colours', '2027 reading plan'],
  },
  {
    project: 'bible-praise', version: '1.3.0', date: '2026-11-15',
    ko: ['앱 이름을 교회찬양집 → 성경&찬양으로 변경, 새 아이콘', '역본 선택: 개역개정 · 개역한글 · KJV', '역본별 장절·본문 검색 분리'],
    en: ['Renamed from Church Hymnal to Bible & Hymns, new icon', 'Translation picker: KRV revised, KRV, KJV', 'Search scoped to the selected translation'],
  },
  {
    project: 'my-recipe', version: '1.0.1',
    ko: ['지역(국가) 필터 28개 추가', 'Firestore 규칙 필드 화이트리스트·크기 제한', 'release 빌드의 debug 서명 폴백 제거', '로그인 취소·캐시 잔존·무한 로딩 등 안정성 버그 수정'],
    en: ['28 region filters', 'Firestore field whitelist and size limits', 'Removed the debug-signing fallback in release builds', 'Fixed cancelled sign-in, stale cache, endless loading and more'],
  },
  {
    project: 'random-travel', version: '1.0.0',
    ko: ['첫 비공개 테스트 배포'],
    en: ['First closed-testing release'],
  },
];
