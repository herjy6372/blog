---
title: 출시 전 자체 보안 점검 — release 빌드가 debug 키로 서명되고 있었다
description: 나의 레시피를 비공개 테스트에 올리기 전 스스로 점검하며 찾은 debug 서명 폴백, Firestore 필드 검증 누락, 로그아웃 후 남는 캐시 문제와 해결 방법입니다.
date: 2026-11-26
category: security
project: my-recipe
order: 8
draft: false
---

## 왜 스스로 점검했나

‘나의 레시피’는 기능을 다 만든 뒤 Play Console 비공개 테스트에 올리기 전, **보안과 버그를 처음부터 다시 훑어보는 시간**을 따로 가졌습니다. 혼자 만드는 앱은 코드 리뷰를 해 줄 사람이 없어서, 일부러 “공격자라면 어디를 볼까”라는 관점으로 읽었습니다.

## 1. release 빌드가 조용히 debug 키로 서명됨

### 발견

`android/app/build.gradle.kts`가 이렇게 되어 있었습니다.

```kotlin
signingConfig = if (hasReleaseKey) {
    signingConfigs.getByName("release")
} else {
    // key.properties 가 없으면 디버그 키로 폴백 (개발 편의)
    signingConfigs.getByName("debug")
}
```

`key.properties`가 없는 환경(새 컴퓨터, CI)에서 release 빌드를 하면 **실패하지 않고** debug 키로 서명된 release 앱이 만들어집니다. debug 키는 누구나 가진 공개된 키라, 이 앱이 실수로 배포되면 서명이 “누가 만든 앱인지”를 증명하지 못합니다.

### 해결: 조용한 실패를 시끄러운 실패로

키가 없으면 빌드를 **멈추게** 했습니다. 정말 debug 서명이 필요할 때만 옵션을 명시적으로 붙이게 했습니다.

```kotlin
signingConfig = when {
    hasReleaseKey -> signingConfigs.getByName("release")
    project.hasProperty("allowDebugSigning") -> signingConfigs.getByName("debug")
    else -> throw GradleException(
        "key.properties 가 없습니다. 디버그 서명이 필요하면 -PallowDebugSigning 을 붙이세요."
    )
}
```

> 구조를 보여주기 위해 정리한 코드입니다. 실제 코드는 저장소의 `build.gradle.kts`를 따릅니다.

## 2. Firestore 규칙이 필드를 검사하지 않음

`users/{uid}` 규칙은 “본인만 쓸 수 있다”까지만 확인했습니다.

```js
allow read, write: if request.auth.uid == uid;
```

본인 문서라도 **어떤 필드를, 얼마나 크게** 쓰는지는 막지 않아, 변조한 앱이 임의 필드나 최대 1MB의 데이터를 넣을 수 있었습니다. `hasOnly()`로 허용 필드를 정하고 필드마다 타입과 크기를 검사하도록 다시 썼습니다.

```js
allow write: if request.auth.uid == uid &&
  request.resource.data.keys().hasOnly(['photoBase64', 'birthDate', 'phoneNumber']) &&
  (!('photoBase64' in request.resource.data) || request.resource.data.photoBase64.size() < 200 * 1024) &&
  (!('phoneNumber' in request.resource.data) || request.resource.data.phoneNumber.size() <= 30);
```

> 실제 규칙은 필드별 타입 검사까지 포함합니다. 위는 구조를 보여주는 요약입니다.

`firebase deploy --only firestore:rules`로 실제 프로젝트에 배포한 뒤 확인했습니다.

## 3. 로그아웃해도 이전 사용자 데이터가 기기에 남음

`signOut()`이 Firebase·Google 로그아웃만 하고, Firestore의 **오프라인 캐시**는 그대로 두고 있었습니다. 같은 기기에서 다른 사람이 로그인하기 전까지 이전 사용자의 프로필과 즐겨찾기가 기기에 남는 구조였습니다. 로그아웃 때 `terminate()`와 `clearPersistence()`를 함께 호출하도록 고쳤습니다.

## 함께 고친 안정성 문제

- 계정 선택 화면에서 **취소해도 로그인된 것처럼** 화면이 닫히던 버그 → 로그인 함수가 성공 여부(`bool`)를 돌려주게 바꿈
- 손상된 프로필 사진 데이터로 **마이페이지가 통째로 크래시** → 디코딩 실패 시 기본 아바타
- 로그아웃 상태에서 즐겨찾기가 **무한 로딩** → 빈 스트림 대신 빈 목록을 내보내는 스트림

## 배운 점

- “개발 편의” 설정은 **배포 경로에서 조용히 동작**할 때 위험해집니다. 기본값은 실패로 두고, 예외는 명시적으로 켜게 합니다.
- 소유자 확인만으로는 부족합니다. 규칙은 **어떤 필드를, 어떤 크기로**까지 검사해야 합니다.
- 로그아웃은 인증만 끊는 것이 아니라 **기기에 남은 데이터 정리**까지입니다.
