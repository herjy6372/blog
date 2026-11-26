---
title: 디버그에서는 되던 Google 로그인이 스토어 앱에서만 실패한 이유
description: Play 앱 서명 때문에 배포 빌드의 SHA-1 인증서 지문이 바뀌어 Firebase Google 로그인이 실패한 문제와, google_sign_in v7 마이그레이션 기록입니다.
date: 2026-11-26
category: deploy
project: bible-praise
order: 4
draft: false
---

## 문제 상황

‘성경&찬양’(당시 이름 교회찬양집)을 Play 스토어 비공개 테스트에 올린 뒤, 테스터들이 Google 로그인이 안 된다고 알려 왔습니다. 개발할 때 쓰던 debug 빌드는 물론, 제 컴퓨터에서 만든 release 빌드도 정상이었습니다. **Play 스토어에서 받은 앱에서만** 이런 오류가 났습니다.

```text
clientConfigurationError
Account reauth failed
```

## 원인: 스토어가 앱을 다시 서명한다

Android 앱은 서명 인증서로 “누가 만든 앱인가”를 증명합니다. Firebase의 Google 로그인은 등록된 **SHA-1 인증서 지문**과 앱의 서명이 일치할 때만 동작합니다.

그런데 Play 스토어는 **Play 앱 서명(App Signing)**을 사용합니다.

1. 개발자는 **업로드 키**로 서명한 AAB를 올립니다.
2. Google이 업로드 키를 확인한 뒤, 사용자에게 줄 APK를 **Google이 보관하는 앱 서명 키**로 다시 서명합니다.

즉 사용자 기기에 설치된 앱의 SHA-1은 제 컴퓨터의 키와 **다릅니다.** Firebase에는 제 키의 SHA-1만 등록되어 있었으니, 스토어 앱은 낯선 앱으로 취급된 것입니다.

## 해결

1. Play Console → **앱 무결성 → 앱 서명**에서 *앱 서명 키 인증서*의 SHA-1을 복사했습니다.
2. Firebase 콘솔 → 프로젝트 설정 → Android 앱에 이 SHA-1을 **추가**했습니다. (업로드 키 SHA-1도 그대로 둡니다. 직접 만든 release 빌드를 테스트할 때 필요합니다.)
3. 새 `google-services.json`을 내려받아 교체하고 다시 빌드했습니다.

> 등록해야 할 지문은 세 가지입니다: debug 키, 업로드 키, Play 앱 서명 키.

## 덤: google_sign_in v7 마이그레이션

비슷한 시기에 `google_sign_in`을 v7로 올리자 빌드가 깨졌습니다. `GoogleSignIn()` 생성자와 `accessToken`이 없어지고 싱글턴 방식으로 바뀌었기 때문입니다. Firebase 인증에는 `idToken`만 있으면 되므로 아래처럼 바꿨습니다.

```dart
// v7 방식
await GoogleSignIn.instance.initialize(
  clientId: '...',
  serverClientId: '...',
);
final googleUser = await GoogleSignIn.instance.authenticate();
final credential = GoogleAuthProvider.credential(
  idToken: googleUser.authentication.idToken,
);
```

## 배운 점

- “내 기기에서는 된다”는 증거가 되지 않습니다. 스토어를 거친 빌드는 **서명부터 다를 수 있습니다.**
- 비공개 테스트 트랙은 이런 문제를 정식 출시 전에 찾기 위한 곳입니다. 로그인처럼 서명에 의존하는 기능은 **스토어에서 받은 앱으로 꼭 확인**해야 합니다.
- 서명 키(업로드 키, keystore 비밀번호)는 저장소에 올리지 않고 `key.properties`처럼 git에서 제외한 파일로 관리합니다.
