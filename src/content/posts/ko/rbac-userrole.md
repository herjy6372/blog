---
title: 등급별 권한(RBAC)을 UserRole enum 하나로 관리하기
description: 기능이 늘어나도 "누가 무엇을 쓸 수 있는지"를 한곳에서 판단하도록, 권한 매핑을 모델 레이어의 enum getter로 모은 과정입니다.
date: 2026-11-26
category: security
project: mytodo
order: 1
draft: true
---

## 문제 상황

‘나의 할 일’은 할 일 관리로 시작했지만 가계부, 기분 기록, 클라우드 동기화, 공지 작성처럼 기능이 계속 늘었습니다. 그런데 모든 기능을 모든 사람에게 열 수는 없었습니다.

- 클라우드 동기화는 비용이 드는 기능이라 베타 테스터와 관리자에게만 열고 싶었습니다.
- 공지 작성과 회원 등급 변경은 관리자만 해야 합니다.
- 만 14세 미만 학생은 보호자 동의가 필요합니다.

화면마다 `if (role == 'BETA' || role == 'ADMIN')` 같은 조건을 쓰기 시작하면, 기능 하나를 추가할 때마다 여러 화면을 고쳐야 하고 한 군데만 빠져도 권한 구멍이 생깁니다.

## 등급 설계

처음부터 다섯 단계 등급을 정해 두었습니다.

| 등급 | 쓸 수 있는 기능 |
|---|---|
| 비로그인 | 고객지원 · 알람 · 설정 |
| Normal | 할 일 · 그래프 · 기분 · 가계부 · 타이머 · 세계시각 · 알람 · 메모 · 테마 · 언어 |
| Student | Normal과 같음 (만 14세 미만, Beta·Pro 부여 불가) |
| Pro | Normal과 같음 |
| Beta | Normal + 클라우드 동기화 |
| Admin | 모든 기능 + 공지 작성 · 회원 등급 관리 |

## 권한 판단을 enum 안으로 모으기

핵심은 **“이 등급이 이 기능을 쓸 수 있는가”를 묻는 질문을 등급 자신이 답하게 하는 것**입니다. Dart의 enhanced enum에 getter를 두었습니다.

```dart
enum UserRole {
  admin('ADMIN', '관리자'),
  beta('BETA', '베타'),
  pro('PRO', '프로'),
  student('STUDENT', '학생'),
  normal('NORMAL', '일반');

  const UserRole(this.code, this.label);
  final String code;
  final String label;

  static UserRole fromCode(String? code) {
    for (final r in UserRole.values) {
      if (r.code == code) return r;
    }
    // 알 수 없는 코드는 일반으로 처리
    return UserRole.normal;
  }

  /// 클라우드 동기화 — Beta·Admin 전용
  bool get canSync => this == UserRole.beta || this == UserRole.admin;

  /// 공지 작성·수정·삭제 — Admin 전용
  bool get canEditAnnouncements => this == UserRole.admin;

  /// 다른 사용자 등급 변경 — Admin 전용
  bool get canManageUsers => this == UserRole.admin;
}
```

화면에서는 등급 이름을 몰라도 됩니다.

```dart
final showSync = loggedIn && role.canSync;
```

1.6.1에서 기분 기록·가계부·테마를 모든 등급에 열었을 때도, 화면을 하나하나 찾지 않고 getter 정의만 바꾸면 됐습니다.

### 알 수 없는 값은 가장 낮은 권한으로

`fromCode`는 서버에서 처음 보는 값이 와도 `normal`을 돌려줍니다. 권한 판단에서 모르는 값은 **가장 낮은 권한으로 처리**하는 것이 안전합니다. 반대로 기본값을 높은 등급으로 두면, 오타 하나로 모든 사람이 관리자가 될 수 있습니다.

## 앱의 판단은 보안이 아니다

여기서 끝내면 안 됩니다. 앱 코드는 사용자 기기에서 돌아가므로 **누구나 고칠 수 있습니다.** 앱에서 버튼을 숨기는 것은 사용자 경험일 뿐이고, 실제로 데이터를 지키는 것은 서버 쪽 규칙입니다.

그래서 Firestore 보안 규칙에도 같은 판단을 넣었습니다. 앱의 `canSync`와 규칙의 `canSync()`가 같은 등급을 보도록 주석으로 묶어 두었습니다.

```js
// 백업·복원 접근 가능 등급: BETA 또는 ADMIN (앱의 canSync 와 동일)
function canSync() {
  return isLoggedIn() && (userRole() == 'BETA' || userRole() == 'ADMIN');
}
```

### 스스로 등급을 올리지 못하게

점검 중에 놓친 부분을 찾았습니다. 사용자는 자기 `users/{uid}` 문서를 수정할 수 있는데, 그 문서 안에 `role` 필드가 있었습니다. 즉 변조한 앱으로 자기 등급을 `ADMIN`으로 바꿀 수 있는 **권한 상승(privilege escalation)** 위험이 있었습니다.

규칙에서 본인 수정은 허용하되, 등급은 그대로 두거나 `NORMAL`로 내리는 것만 허용하도록 바꿨습니다. 정지된 계정(`disabled`)은 스스로 풀 수 없습니다.

```js
allow update: if isAdmin() || (
  isOwner(uid) &&
  resource.data.get('disabled', false) == false &&
  request.resource.data.get('disabled', false) == false &&
  (
    request.resource.data.role == resource.data.role ||
    request.resource.data.role == 'NORMAL'
  )
);
```

## 배운 점

- 권한 매핑은 **한곳**에 있어야 합니다. enum getter는 Dart에서 그 한곳을 만드는 가장 가벼운 방법이었습니다.
- 앱의 권한 체크는 화면을 위한 것이고, 데이터를 지키는 것은 **서버 규칙**입니다. 둘을 같은 이름으로 맞춰 두면 함께 고치기 쉽습니다.
- 사용자가 쓸 수 있는 문서 안에 권한 필드를 두었다면, 그 필드를 **규칙에서 따로 막았는지** 꼭 확인해야 합니다.
