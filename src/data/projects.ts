import type { Lang } from '../i18n';

type Shot = { src: string; ko: string; en: string; wide?: boolean };
type Trouble = { problem: string; solution: string };
type Text = {
  name: string;
  kind: string;
  summary: string;
  desc: string;
  period: string;
  platform: string;
  status: string;
  features: string[];
  troubles: Trouble[];
};

export type Project = {
  slug: string;
  type: 'app' | 'web';
  version?: string;
  code?: string;
  live?: { url: string; ko: string; en: string };
  cover: { src: string; wide?: boolean };
  shots: Shot[];
  tags: string[];
  arch?: string;
  ko: Text;
  en: Text;
};

export const PROJECTS: Project[] = [
  {
    slug: 'mytodo',
    type: 'app',
    version: '1.6.3',
    code: 'https://github.com/herjy6372/mytodo',
    cover: { src: 'images/mytodo/feature.png', wide: true },
    shots: [
      { src: 'images/mytodo/home.jpg', ko: '홈 화면', en: 'Home' },
      { src: 'images/mytodo/home-menu.jpg', ko: '홈 메뉴', en: 'Home menu' },
      { src: 'images/mytodo/todo-list.jpg', ko: '할 일 목록', en: 'To-do list' },
      { src: 'images/mytodo/calendar.jpg', ko: '캘린더', en: 'Calendar' },
      { src: 'images/mytodo/graph.jpg', ko: '통계 그래프', en: 'Stats' },
      { src: 'images/mytodo/mood.jpg', ko: '기분 한 줄', en: 'Mood log' },
      { src: 'images/mytodo/ledger.jpg', ko: '가계부', en: 'Ledger' },
      { src: 'images/mytodo/alarm.jpg', ko: '알람 화면', en: 'Alarm' },
      { src: 'images/mytodo/theme-cat.jpg', ko: '고양이 테마', en: 'Cat theme' },
    ],
    tags: ['Flutter', 'Dart', 'Firebase Auth', 'Firestore', 'fl_chart', 'home_widget', 'WidgetKit', 'flutter_quill', 'R8'],
    arch: `lib/
├── models/      user_profile.dart — UserRole enum (등급별 기능 getter)
├── data/        도메인별 Repository (Todo · Ledger · Mood · Profile · …)
├── services/    sync · notification · holiday · permission
├── screens/     23개 화면
└── widgets/`,
    ko: {
      name: '나의 할 일',
      kind: 'Flutter 앱',
      summary: '할 일·캘린더·가계부·기분 기록을 한 앱에서',
      desc: '할 일 관리를 중심으로 캘린더·통계·가계부·기분 기록·알람·메모·타이머·세계시각까지 하나로 관리하는 올인원 라이프 관리 앱입니다. 기능이 늘어날수록 “누가 어떤 기능까지 쓸 수 있는가”를 명확히 하기 위해 5단계 등급별 권한 구조를 처음부터 설계에 넣었고, 10대부터 80대까지 쓰기 쉽도록 큰 글씨 모드와 삭제 되돌리기를 갖췄습니다.',
      period: '2026.04 ~ 진행 중',
      platform: 'Android · iOS',
      status: 'Google Play 비공개 테스트',
      features: [
        '5단계 등급별 권한(RBAC)을 UserRole enum 하나로 관리',
        'R8·Dart 난독화로 신규 설치 크기 19.7MB → 12.1MB (v1.6.2)',
        'Android(RemoteViews)·iOS(WidgetKit) 홈 화면 위젯 9종',
        '1분간 울리는 알람 화면과 1·5·10·30분 다시 울림',
        '메모 글 서식(flutter_quill)과 펜·형광펜·지우개 그림 그리기',
        '큰 글씨 모드·삭제 되돌리기·JSON 백업 파일로 전 연령 사용성 개선',
      ],
      troubles: [
        {
          problem: 'Play Console에 “DEX 코드 최적화 기준점 미만” 경고가 뜨고 설치 크기가 컸습니다.',
          solution: 'R8 코드·리소스 축소와 Dart --obfuscate --split-debug-info를 적용하고, 리플렉션을 쓰는 플러그인만 keep 규칙으로 보존했습니다. 신규 설치 크기가 약 38% 줄었습니다.',
        },
        {
          problem: '일반 사용자가 자기 users 문서의 role(등급) 필드를 직접 고칠 수 있는 권한 상승 위험이 있었습니다.',
          solution: 'Firestore 보안 규칙에서 role·disabled 필드 수정을 막고, 탈퇴 시 본인 데이터 삭제는 허용되도록 규칙을 다시 정리했습니다.',
        },
        {
          problem: '로컬에서 지운 항목이 클라우드 백업과 병합되며 다시 살아났습니다.',
          solution: '로컬에 없는 원격 문서도 배치 삭제하도록 동기화 로직을 고치고, 변경 2초 뒤 자동 백업되도록 디바운스를 적용했습니다.',
        },
      ],
    },
    en: {
      name: 'My To-Do',
      kind: 'Flutter app',
      summary: 'To-dos, calendar, ledger and mood log in one app',
      desc: 'An all-in-one life manager built around to-dos, with a calendar, stats, ledger, mood log, alarms, memos, timers and world clocks. To keep “who can use what” clear as features grew, a five-tier access model was part of the design from day one, and large-text mode and undo-delete make it easy to use from teens to eighties.',
      period: 'Apr 2026 – present',
      platform: 'Android · iOS',
      status: 'Google Play closed testing',
      features: [
        'Five access tiers (RBAC) handled by a single UserRole enum',
        'Fresh install size 19.7 MB → 12.1 MB with R8 and Dart obfuscation (v1.6.2)',
        'Nine home-screen widgets on Android (RemoteViews) and iOS (WidgetKit)',
        'Full-screen alarm that rings for one minute, snooze 1/5/10/30 min',
        'Rich-text memos (flutter_quill) and drawing with pen, highlighter and eraser',
        'Large-text mode, undo delete and JSON backup files for users of all ages',
      ],
      troubles: [
        {
          problem: 'Play Console warned the DEX code was below the optimization threshold, and the app was large.',
          solution: 'Enabled R8 code and resource shrinking plus Dart --obfuscate --split-debug-info, keeping only reflection-based plugins via keep rules. Fresh install size dropped by about 38%.',
        },
        {
          problem: 'A regular user could edit the role field on their own users document: a privilege-escalation risk.',
          solution: 'Firestore rules now block changes to role and disabled, while still letting users delete their own data when they leave.',
        },
        {
          problem: 'Items deleted locally came back after merging with the cloud backup.',
          solution: 'Sync now batch-deletes remote documents that no longer exist locally, and backs up automatically two seconds after a change.',
        },
      ],
    },
  },
  {
    slug: 'bible-praise',
    type: 'app',
    version: '1.5.0',
    code: 'https://github.com/herjy6372/churchpraise-app',
    cover: { src: 'images/praise/compare-tablet.jpg', wide: true },
    shots: [
      { src: 'images/praise/compare.jpg', ko: '성경 비교 보기', en: 'Side-by-side translations' },
      { src: 'images/praise/bible-highlight.jpg', ko: '형광펜', en: 'Highlights' },
      { src: 'images/praise/books-ot.jpg', ko: '구약 권 선택', en: 'Old Testament books' },
      { src: 'images/praise/books-nt.jpg', ko: '신약 권 선택', en: 'New Testament books' },
      { src: 'images/praise/select.jpg', ko: '여러 절 선택', en: 'Selecting verses' },
      { src: 'images/praise/reading-plan.jpg', ko: '2027 성경읽기표', en: '2027 reading plan' },
      { src: 'images/praise/hymns.jpg', ko: '새찬송가', en: 'Hymnal' },
      { src: 'images/praise/liturgy.jpg', ko: '예배문', en: 'Liturgy' },
      { src: 'images/praise/compare-tablet.jpg', ko: '태블릿 가로 비교 보기', en: 'Tablet landscape comparison', wide: true },
    ],
    tags: ['Flutter', 'Dart', 'pdfx', 'CustomPainter', 'MethodChannel', 'Isolate', 'Firebase Auth', 'Firestore'],
    arch: `lib/
├── services/   bible_service (역본 전환 · 장절 검색) · score_service (네이티브 파일 선택기)
│               highlight · reading_plan · tag (마이그레이션) · sync
├── screens/    6탭 홈 · bible_tab · viewer (PDF + 필기) · conti_editor · reading_plan
└── data/       새찬송가 645곡 · 교독문 1~137번`,
    ko: {
      name: '성경&찬양',
      kind: 'Flutter 앱 (구 교회찬양집)',
      summary: '성경 66권과 새찬송가 645곡 악보를 한 앱에',
      desc: '종이 악보집과 여러 앱을 번갈아 쓰던 불편을 덜기 위해 만든 예배 앱입니다. 새찬송가 645곡 악보 뷰어와 필기, 콘티(세트리스트) 관리로 시작해, 성경 66권 오프라인 열람·역본 비교·형광펜·2027 성경읽기표·교독문까지 담은 통합 예배 앱으로 넓혔습니다.',
      period: '2026.06 ~ 진행 중',
      platform: 'Android · iOS',
      status: 'Google Play 비공개 테스트',
      features: [
        '펜·형광펜·지우개·실행 취소 필기를 외부 패키지 없이 CustomPainter로 구현',
        'MethodChannel로 Android(Kotlin)·iOS(Swift) 파일 선택기를 직접 연동해 내 악보 업로드',
        '성경 66권 오프라인 탑재, 개역개정·개역한글·KJV 전환과 두 역본 비교 보기',
        'compute()(Isolate)로 큰 성경 JSON을 파싱해 화면 끊김 방지',
        '1,189장을 365일에 나눈 2027 성경읽기표와 진도 체크',
        '즐겨찾기·콘티·태그·형광펜을 Firestore로 백업·복원',
      ],
      troubles: [
        {
          problem: '디버그 빌드에서는 되던 Google 로그인이 Play 스토어에서 받은 앱에서만 실패했습니다.',
          solution: 'Play 앱 서명으로 배포 빌드의 SHA-1이 바뀐 것이 원인이었습니다. Play Console의 앱 서명 SHA-1을 Firebase에 등록하고 google-services.json을 다시 받아 해결했습니다.',
        },
        {
          problem: 'iOS에서만 긴 악보가 아래로 스크롤되지 않았습니다.',
          solution: 'InteractiveViewer의 boundaryMargin이 고정값이었습니다. 실제 PDF 렌더링 높이를 계산해 여백을 동적으로 정했습니다.',
        },
        {
          problem: '“요 3:16”을 검색하면 요엘·요나·요한1서까지 함께 나왔습니다.',
          solution: '약어가 정확히 일치하는 책을 먼저 고르도록 검색 규칙을 고치고, 역본별 검색 테스트를 추가했습니다.',
        },
      ],
    },
    en: {
      name: 'Bible & Hymns',
      kind: 'Flutter app (formerly Church Hymnal)',
      summary: 'The whole Bible and 645 hymn scores in one app',
      desc: 'A worship app built to replace juggling paper hymnals and several apps. It began as a viewer for 645 hymn scores with handwriting and set-list management, and grew to include the full Bible offline, translation comparison, highlights, a 2027 reading plan and responsive readings.',
      period: 'Jun 2026 – present',
      platform: 'Android · iOS',
      status: 'Google Play closed testing',
      features: [
        'Pen, highlighter, eraser and undo built with CustomPainter, no packages',
        'Native file pickers on Android (Kotlin) and iOS (Swift) via MethodChannel for your own scores',
        'All 66 books offline, three translations and side-by-side comparison',
        'Large Bible JSON parsed with compute() (an Isolate) to avoid dropped frames',
        'A 2027 reading plan spreading 1,189 chapters across 365 days',
        'Favourites, set lists, tags and highlights backed up to Firestore',
      ],
      troubles: [
        {
          problem: 'Google sign-in worked in debug builds but failed in the app installed from Play.',
          solution: 'Play App Signing re-signs releases, so the SHA-1 differed. Adding Play’s app-signing SHA-1 to Firebase and downloading a fresh google-services.json fixed it.',
        },
        {
          problem: 'Long scores would not scroll down on iOS only.',
          solution: 'InteractiveViewer had a fixed boundaryMargin. The margin is now computed from the rendered PDF height.',
        },
        {
          problem: 'Searching “요 3:16” also matched Joel, Jonah and 1 John.',
          solution: 'Exact abbreviation matches now win first, with per-translation search tests to lock it in.',
        },
      ],
    },
  },
  {
    slug: 'church-website',
    type: 'web',
    cover: { src: 'images/church/home.jpg', wide: true },
    shots: [{ src: 'images/church/home.jpg', ko: '메인 화면', en: 'Home page', wide: true }],
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Firebase Auth', 'Firestore', 'GitHub Pages'],
    arch: `index · intro · history · album        정적 HTML
login · signup · member · admin       Firebase Auth + Firestore
auth-nav.js                           로그인 상태에 따라 메뉴만 전환
images/<연도>/<행사>/NN.jpg           사진 약 1,225장`,
    ko: {
      name: '교회 홈페이지',
      kind: '웹사이트',
      summary: '정적 사이트에 교인 전용 회원제를 더한 교회 홈페이지',
      desc: '예배 안내·교회 소개·연혁·사진 앨범을 담은 정적 웹사이트에 Firebase 기반 교인 전용 회원 시스템(가입·승인·등급·관리자)을 더했습니다. 별도 서버 없이 GitHub Pages만으로 운영하며, 실제 성도 사진이 많은 만큼 개인정보 보호를 우선해 공개 범위를 계속 다시 검토하고 있습니다.',
      period: '2026.08',
      platform: 'Web (GitHub Pages)',
      status: '운영 중 · 개인정보 보호로 코드 비공개',
      features: [
        '서버 없이 정적 HTML 위에 Firebase 회원제(가입·관리자 승인·등급) 결합',
        '사진 약 1,225장을 ~1600px로 줄이고 연도·행사별 폴더로 정리',
        '성경&찬양 앱 비공개 테스트 신청서 (로그인 없이, 같은 계정은 한 번만)',
        '관리자 페이지: 회원 승인, 등급, 공지, 테스트 신청 목록',
        '무료 요금제 안에서 기능 범위 결정 (이미지 첨부 게시판 제외)',
      ],
      troubles: [
        {
          problem: '로그인 없이 받는 테스트 신청서를 아무나 마음대로 채우거나 여러 번 보낼 수 있었습니다.',
          solution: '문서 ID를 소문자 이메일로 쓰고, 규칙으로 허용 필드·형식·서버 시각을 검사해 생성만 허용했습니다. 이미 있는 문서에 쓰면 update로 거절되고, 열람과 삭제는 관리자만 할 수 있습니다.',
        },
        {
          problem: '앨범 사진이 많아 저장소 용량이 커질 위험이 있었습니다.',
          solution: '업로드 전에 sips로 웹용 크기로 줄이고 연도·행사별 폴더 구조로 정리했습니다.',
        },
      ],
    },
    en: {
      name: 'Church Website',
      kind: 'Website',
      summary: 'A static church site with a members-only area',
      desc: 'A static site with service times, history and a photo album, plus a Firebase members-only system (sign-up, admin approval, tiers, admin page). It runs on GitHub Pages with no server. Because it holds many photos of real members, privacy comes first and its visibility is reviewed regularly.',
      period: 'Aug 2026',
      platform: 'Web (GitHub Pages)',
      status: 'Live · code private for members’ privacy',
      features: [
        'Firebase membership (sign-up, admin approval, tiers) on top of static HTML',
        'About 1,225 photos resized to ~1600 px and sorted by year and event',
        'A no-login sign-up form for app testers, one entry per account',
        'Admin page: member approval, tiers, notices and tester requests',
        'Scope chosen to fit the free plan (no image-upload board)',
      ],
      troubles: [
        {
          problem: 'A no-login tester form could be filled with anything, or submitted many times.',
          solution: 'The document ID is the lower-cased email, and rules allow create only with whitelisted fields, valid formats and the server timestamp. Writing to an existing document is rejected as an update; only admins can read or delete.',
        },
        {
          problem: 'Thousands of album photos risked bloating the repository.',
          solution: 'Photos are resized with sips before upload and organised into year/event folders.',
        },
      ],
    },
  },
  {
    slug: 'routiny',
    type: 'app',
    version: '1.0.3',
    code: 'https://github.com/herjy6372/routiny',
    cover: { src: 'images/routiny/home.jpg' },
    shots: [{ src: 'images/routiny/home.jpg', ko: '홈 화면', en: 'Home' }],
    tags: ['Flutter', 'Dart', 'Kotlin', 'Swift', 'Health Connect', 'HealthKit', 'Hive', 'Firestore', 'WidgetKit'],
    arch: `UI (Home · History · Onboarding · Auth)
 └ Services
    ├ HealthService        플랫폼별 데이터 타입·권한 분기, 동기화
    ├ LocalStorageService  Hive
    ├ AuthService          Firebase Auth · Firestore
    ├ PaceCoachingService  기기 안에서 컨디션 점수 계산
    └ HomeWidgetBridge     네이티브 위젯 데이터 전달`,
    ko: {
      name: '루티니',
      kind: 'Flutter 앱',
      summary: '건강 앱 데이터로 운동 루틴과 컨디션 기록',
      desc: '삼성 헬스·애플 건강에 쌓인 걸음 수·운동 거리·체중을 자동으로 불러와, 오늘의 운동 루틴 달성과 수면·컨디션을 한 화면에서 기록하는 트래커입니다. Android Health Connect와 iOS HealthKit을 하나의 서비스로 묶는 것을 핵심 목표로 잡았습니다.',
      period: '2026.11 ~ 진행 중',
      platform: 'Android · iOS',
      status: 'Google Play 비공개 테스트',
      features: [
        'Health Connect·HealthKit을 하나의 서비스로 통합하고 플랫폼별 데이터 타입 분리',
        '앱 실행·복귀·15분마다 권한 팝업 없는 silent 자동 동기화',
        '수면·컨디션·운동량으로 0~100점 컨디션 점수와 추천 페이스 계산 (기기 안에서)',
        'Android·iOS 홈 화면 위젯으로 걸음 수와 루틴 달성률 표시',
        '회원 탈퇴 시 계정·Firestore·로컬 데이터 즉시 삭제',
      ],
      troubles: [
        {
          problem: '권한을 허용해도 Android에서 “접근 권한이 거부되었습니다”가 표시됐습니다.',
          solution: 'health 플러그인 소스를 읽어 보니 WORKOUT 요청 때 READ_TOTAL_CALORIES_BURNED를 함께 요청하고 있었습니다. 매니페스트에 권한을 추가하고 iOS 전용 데이터 타입을 분리했습니다.',
        },
        {
          problem: 'iOS 실기기에서만 HealthKit이 동작하지 않았습니다.',
          solution: 'Runner.entitlements가 Xcode 타겟의 CODE_SIGN_ENTITLEMENTS에 연결되지 않았습니다. Debug·Release·Profile 설정에 연결하고 서명된 앱에 권한이 들어간 것을 확인했습니다.',
        },
        {
          problem: '“아이디 찾기”용 컬렉션이 누구나 읽을 수 있게 열려 있어 회원 정보가 노출될 수 있었습니다.',
          solution: '규칙을 본인만 읽고 쓰게 잠그고 아이디 찾기 기능을 없애 비밀번호 재설정 메일만 남겼습니다. 로그인하지 않은 요청이 403으로 거부되는 것을 확인했습니다.',
        },
      ],
    },
    en: {
      name: 'Routiny',
      kind: 'Flutter app',
      summary: 'Workout routines and condition from your health data',
      desc: 'A tracker that pulls steps, distance and weight from Samsung Health and Apple Health, and logs your daily routine, sleep and condition on one screen. The core goal was to put Android Health Connect and iOS HealthKit behind one service.',
      period: 'Nov 2026 – present',
      platform: 'Android · iOS',
      status: 'Google Play closed testing',
      features: [
        'Health Connect and HealthKit behind one service, with per-platform data types',
        'Silent auto-sync on launch, on resume and every 15 minutes',
        'On-device condition score (0–100) and suggested pace',
        'Home-screen widgets for steps and routine progress',
        'Deleting an account removes the account, Firestore and local data at once',
      ],
      troubles: [
        {
          problem: 'Android reported access as denied even after the user allowed it.',
          solution: 'Reading the health plugin source showed WORKOUT also requests READ_TOTAL_CALORIES_BURNED. Declaring it in the manifest, and splitting out iOS-only data types, fixed it.',
        },
        {
          problem: 'HealthKit did not work on a real iPhone.',
          solution: 'Runner.entitlements was not linked to CODE_SIGN_ENTITLEMENTS. Linking it for Debug, Release and Profile put the entitlement into the signed app.',
        },
        {
          problem: 'A “find my ID” collection was world-readable and could expose member details.',
          solution: 'Rules now allow only the owner, and the feature was replaced by password-reset email. Unauthenticated reads are confirmed to fail with 403.',
        },
      ],
    },
  },
  {
    slug: 'random-travel',
    type: 'app',
    version: '1.0.0',
    code: 'https://github.com/herjy6372/randomtravel',
    cover: { src: 'images/travel/home.jpg' },
    shots: [{ src: 'images/travel/home.jpg', ko: '지도와 다트 발사대', en: 'Map and dart launcher' }],
    tags: ['Flutter', 'Dart', 'CustomPainter', 'GeoJSON', 'Provider', 'Hive', 'Firebase Auth', 'Firestore'],
    arch: `UI (MapGame · Result · Records · Settings · Login)
 └ AppState (ChangeNotifier)
    ├ GeoData              GeoJSON 파싱 · 투영 · 착지 판정
    ├ SpecialtyRepository  지역별 특산물·명소
    ├ AuthService          Firebase ↔ 로컬(폴백)
    └ RecordStore          Firestore ↔ Hive(폴백)
 └ DartGameController      idle → charging → flying → landed`,
    ko: {
      name: '한국 랜덤여행',
      kind: 'Flutter 앱',
      summary: '다트를 던져 정하는 다음 국내 여행지',
      desc: '발사대를 꾹 눌렀다 떼면 다트가 대한민국 지도 위 무작위 시·군·구로 날아가 다음 여행지를 정해주는 앱입니다. 방향과 세기를 사용자가 정하지 않게 해 “랜덤”이라는 취지를 살렸고, 착지한 지역의 특산물·명소와 우리집에서의 거리를 보여줍니다.',
      period: '2026.07',
      platform: 'Android · iOS',
      status: 'Google Play 비공개 테스트',
      features: [
        '통계청 행정경계 GeoJSON(시군구 250개)을 지도 SDK 없이 CustomPainter로 그리기',
        'Ray casting 점-폴리곤 판정으로 육지·북한·바다 구분',
        '정적인 지도와 움직이는 다트를 다른 Painter로 나눠 다시 그리기 최소화',
        '하버사인 공식으로 우리집까지 거리 계산 (“당일치기 딱 좋아요”)',
        'Firebase 초기화에 실패하면 Hive 로컬 모드로 자동 전환',
      ],
      troubles: [
        {
          problem: '화면의 아무 좌표로 다트를 날리면 바다나 북한에 자주 떨어졌습니다.',
          solution: '결과를 먼저 뽑도록 순서를 바꿨습니다. 시군구 하나를 고르고 그 안의 점을 뽑은 뒤 그 좌표로 다트를 날립니다. 시드를 고정한 200회 테스트로 모두 육지인지 확인했습니다.',
        },
        {
          problem: '강원 고성군과 경남 고성군처럼 이름이 같은 지역의 명소가 섞여 나왔습니다.',
          solution: '데이터를 광역시 / 도-시군 / 도 대표 특산물 3단계로 나누고 시도 코드로 구분했습니다.',
        },
      ],
    },
    en: {
      name: 'Korea Random Trip',
      kind: 'Flutter app',
      summary: 'Throw a dart to pick your next trip',
      desc: 'Hold and release the launcher and a dart flies to a random city or county on a map of Korea: that is your next destination. You don’t choose the direction or power, which keeps it truly random. It then shows local specialties, sights and the distance from home.',
      period: 'Jul 2026',
      platform: 'Android · iOS',
      status: 'Google Play closed testing',
      features: [
        '250 districts drawn from census GeoJSON with CustomPainter, no map SDK',
        'Ray-casting point-in-polygon test to tell land, North Korea and sea apart',
        'Static map and moving dart in separate painters to avoid repaints',
        'Haversine distance from home (“perfect for a day trip”)',
        'Falls back to local Hive storage if Firebase fails to start',
      ],
      troubles: [
        {
          problem: 'Throwing at a random screen point often landed in the sea or North Korea.',
          solution: 'Pick the result first: choose a district, pick a point inside it, then aim the dart there. A seeded 200-run test confirms every result is on land.',
        },
        {
          problem: 'Sights from same-name districts (Goseong in Gangwon and Gyeongnam) got mixed up.',
          solution: 'Data is split into metro city / province-district / province levels and keyed by province code.',
        },
      ],
    },
  },
  {
    slug: 'my-recipe',
    type: 'app',
    version: '1.0.1',
    code: 'https://github.com/herjy6372/myrecipe',
    cover: { src: 'images/recipe/home.jpg' },
    shots: [{ src: 'images/recipe/home.jpg', ko: '레시피 검색', en: 'Recipe search' }],
    tags: ['Flutter', 'Dart', 'Riverpod', 'Dio', 'Hive', 'Firebase Auth', 'Firestore', 'TheMealDB'],
    arch: `MealDbApi (HTTP)
 → RecipeRepository (Hive TTL 캐시)
 → Riverpod Provider (watch 체인)
 → UI`,
    ko: {
      name: '나의 레시피',
      kind: 'Flutter 앱',
      summary: '재료로 찾고 한국어로 읽는 세계 레시피',
      desc: 'TheMealDB 공개 API로 전 세계 요리를 요리명·재료·카테고리·지역별로 찾고, 한글 검색어와 조리법을 자동 번역해 보여주는 레시피 앱입니다. 기능을 만든 뒤 스스로 보안·버그 전수 점검을 하며 배포 전에 위험한 설정을 찾아 고쳤습니다.',
      period: '2026.08 ~ 진행 중',
      platform: 'Android',
      status: 'Google Play 비공개 테스트',
      features: [
        'API → Repository(Hive TTL 캐시) → Riverpod → UI 계층 분리로 오프라인 우선 설계',
        '카테고리·지역·검색어 중 하나만 켜지는 배타적 필터',
        '한↔영 자동 번역을 500자 단위로 나누고 4개씩 묶어 무료 API 제한 회피',
        'Firestore 규칙에 필드 화이트리스트와 크기 제한 추가',
        'Google 로그인과 즐겨찾기 동기화',
      ],
      troubles: [
        {
          problem: 'key.properties가 없으면 release 빌드가 경고 없이 debug 키로 서명됐습니다.',
          solution: '명시적인 -PallowDebugSigning 옵션이 없으면 빌드를 실패시키도록 바꿔 “조용한 실패”를 “시끄러운 실패”로 바꿨습니다.',
        },
        {
          problem: 'users 문서 규칙이 소유자 확인만 하고 필드나 크기를 검사하지 않았습니다.',
          solution: 'hasOnly()로 허용 필드를 제한하고 필드별 타입·크기를 검사하도록 규칙을 다시 써서 배포했습니다.',
        },
        {
          problem: '번역 캐시 키를 String.hashCode로 만들어 런타임 버전이 바뀌면 캐시가 조용히 무효화될 수 있었습니다.',
          solution: '안정적인 FNV-1a 해시를 직접 구현해 캐시 키로 썼습니다.',
        },
      ],
    },
    en: {
      name: 'My Recipe',
      kind: 'Flutter app',
      summary: 'Search world recipes by ingredient, read them in Korean',
      desc: 'A recipe app on the public TheMealDB API: search by dish, ingredient, category or region, with Korean search terms and instructions translated automatically. After building it, I audited it for security and bugs and fixed risky settings before release.',
      period: 'Aug 2026 – present',
      platform: 'Android',
      status: 'Google Play closed testing',
      features: [
        'Offline-first layers: API → repository (Hive TTL cache) → Riverpod → UI',
        'Mutually exclusive filters: category, region or search text',
        'Translation split into 500-character chunks, four per batch, to fit free API limits',
        'Firestore rules with a field whitelist and size limits',
        'Google sign-in and synced favourites',
      ],
      troubles: [
        {
          problem: 'Without key.properties, release builds were silently signed with the debug key.',
          solution: 'The build now fails unless -PallowDebugSigning is passed explicitly: a silent failure became a loud one.',
        },
        {
          problem: 'The users rule checked ownership but not fields or sizes.',
          solution: 'Rewrote the rule with hasOnly() and per-field type and size checks, then deployed it.',
        },
        {
          problem: 'Translation cache keys used String.hashCode, which is not stable across Dart versions.',
          solution: 'Implemented a stable FNV-1a hash for cache keys.',
        },
      ],
    },
  },
  {
    slug: 'card-flip',
    type: 'web',
    code: 'https://github.com/herjy6372/cardflipmatch',
    live: { url: 'https://herjy6372.github.io/cardflipmatch/', ko: '게임 플레이', en: 'Play the game' },
    cover: { src: 'images/cardflip/play.jpg' },
    shots: [
      { src: 'images/cardflip/start.jpg', ko: '시작 화면', en: 'Start screen' },
      { src: 'images/cardflip/play.jpg', ko: '플레이', en: 'Playing' },
      { src: 'images/cardflip/result.jpg', ko: '결과', en: 'Results' },
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'Firebase Auth', 'Firestore', 'GitHub Actions', 'GitHub Pages'],
    ko: {
      name: '두근두근 카드 뒤집기',
      kind: '웹 미니게임 · AI 바이브코딩',
      summary: '난이도별 50라운드 카드 짝 맞추기',
      desc: '2026 경북게임개발사관학교 기초역량함양과정 ‘AI 바이브코딩 기반 웹 미니게임 개발’에서 ChatGPT Codex를 활용해 만든 카드 짝 맞추기 게임입니다. 캐릭터의 응원과 함께 50라운드에 도전하고, 난이도별 실시간 순위를 겨룹니다.',
      period: '2026 (교육 과정)',
      platform: 'PC · 모바일 웹',
      status: '공개 · 바로 플레이 가능',
      features: [
        '쉬움·보통·어려움과 5라운드마다 늘어나는 카드 수',
        '짝 맞추기 점수와 남은 시간 보너스를 합산한 최종 기록',
        'Firebase 익명 인증 + Firestore로 난이도별 실시간 순위',
        '로컬 기록 보관, 연결이 돌아오면 동기화하고 중복 제출 방지',
        '캐릭터 반응, 배경음·효과음, 터치와 키보드 입력',
      ],
      troubles: [
        {
          problem: '로그인 없는 게임이라 누구나 순위표에 터무니없는 점수를 올리거나 연달아 제출할 수 있었습니다.',
          solution: '익명 인증을 거치게 하고, 서버 규칙으로 기록의 일관성(점수·시간 범위)과 제출 간격을 검사했습니다. 정상 범위 안에서 꾸민 기록까지 판별하는 서버 플레이 검증은 범위 밖으로 두었습니다.',
        },
      ],
    },
    en: {
      name: 'Heart-Pounding Card Flip',
      kind: 'Web mini-game · AI vibe coding',
      summary: 'A 50-round card matching game with difficulty levels',
      desc: 'A card matching game built with ChatGPT Codex in the 2026 Gyeongbuk Game Development Academy course “Web Mini-Game Development with AI Vibe Coding”. Take on 50 rounds with a cheering character and compete on live rankings per difficulty.',
      period: '2026 (course project)',
      platform: 'Desktop and mobile web',
      status: 'Public · playable now',
      features: [
        'Easy, normal and hard, with more cards every five rounds',
        'Final score combines matches and a time bonus',
        'Live rankings per difficulty with Firebase anonymous auth and Firestore',
        'Local records kept, synced when back online, duplicate submissions blocked',
        'Character reactions, music and sound effects, touch and keyboard input',
      ],
      troubles: [
        {
          problem: 'With no login, anyone could post absurd scores to the leaderboard or submit repeatedly.',
          solution: 'Anonymous auth is required, and server rules check that score and time are consistent and limit how often you can submit. Server-side replay to catch plausible-but-faked scores was left out of scope.',
        },
      ],
    },
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const projectName = (slug: string, lang: Lang) => getProject(slug)?.[lang].name ?? slug;
