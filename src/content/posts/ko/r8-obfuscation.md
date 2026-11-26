---
title: R8과 Dart 난독화로 앱 설치 크기 38% 줄이기
description: Play Console의 DEX 최적화 경고를 계기로 R8 코드 축소와 Dart 난독화를 적용해 신규 설치 크기를 19.7MB에서 12.1MB로 줄인 기록입니다.
date: 2026-11-26
category: deploy
project: mytodo
order: 2
draft: true
---

## 문제 상황

‘나의 할 일’을 Play Console에 올리자 이런 경고가 붙었습니다.

> DEX 코드 최적화 기준점 미만 (난독화 2%)

신규 설치 크기도 19.7MB로 기능에 비해 컸습니다. 앱이 동작하는 데는 문제가 없었지만, 크기는 설치 전환율에 영향을 주고, 난독화되지 않은 코드는 내부 구조를 그대로 보여줍니다.

## 원인

release 빌드에서 코드 축소와 난독화가 꺼져 있었습니다. Flutter 앱은 두 종류의 코드를 함께 담습니다.

- **Java·Kotlin 코드** (Flutter 엔진의 Android 쪽, 플러그인들) → Android의 **R8**이 담당
- **Dart 코드** (앱 본체) → Flutter의 `--obfuscate` 옵션이 담당

둘 중 하나만 켜면 반쪽짜리입니다.

## 해결 1: R8 켜기

`android/app/build.gradle.kts`의 release 빌드에 코드·리소스 축소를 켰습니다.

```kotlin
buildTypes {
    release {
        // R8: 사용하지 않는 코드·리소스 제거 + Java/Kotlin 코드 난독화
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro",
        )
    }
}
```

### 리플렉션을 쓰는 플러그인만 지켜 주기

R8은 “쓰이지 않는 것 같은” 코드를 지우고 이름을 바꿉니다. 그런데 리플렉션으로 클래스를 찾는 코드는 R8이 사용 여부를 알 수 없어, 지우거나 이름을 바꾸면 런타임에 깨집니다.

대부분의 Flutter 플러그인은 자체 규칙을 가지고 있어서, 문제가 되는 것만 골라 `keep` 규칙을 넣었습니다. 이 앱에서는 예약 알림을 Gson으로 저장·복원하는 `flutter_local_notifications`였습니다.

```proguard
# flutter_local_notifications: 예약 알림을 Gson 으로 저장/복원 (제네릭 타입 정보 필요)
-keep class com.dexterous.** { *; }
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken

# 비정상 종료 보고서의 줄 번호는 남기고 원본 파일 이름은 숨김
-keepattributes LineNumberTable
-renamesourcefileattribute SourceFile
```

규칙을 넣은 뒤에는 **반드시 release 빌드로 예약 알림을 실제로 만들고, 앱을 껐다 켠 뒤 울리는지** 확인했습니다. debug 빌드에서는 R8이 돌지 않아 이런 문제가 보이지 않습니다.

## 해결 2: Dart 난독화

Dart 코드는 빌드 명령에 옵션을 붙입니다.

```bash
flutter build appbundle --release \
  --obfuscate \
  --split-debug-info=symbols/
```

`--split-debug-info`는 디버그 정보를 앱 밖으로 빼서 크기를 더 줄여 줍니다. 대신 이 **심볼 파일이 없으면 난독화된 오류 로그를 읽을 수 없습니다.**

- 심볼 폴더는 버전별로 저장소 **밖**에 보관하고 `.gitignore`에 넣었습니다. 이 파일이 공개되면 난독화가 무의미해집니다.
- R8 매핑 파일과 네이티브 디버그 심볼은 App Bundle에 포함해, Play Console에서 비정상 종료 스택을 해독할 수 있게 했습니다.

## 결과

- Play Console 경고가 사라졌습니다.
- 신규 설치 크기가 **19.7MB → 12.1MB**, 약 38% 줄었습니다. (v1.6.2 기준)

## 배운 점

- 난독화는 보안 장치라기보다 **분석 비용을 높이는 장치**입니다. API 키 같은 비밀은 난독화로 숨길 수 없으니 앱에 넣지 않는 것이 원칙입니다.
- R8 문제는 release 빌드에서만 보입니다. 리플렉션을 쓰는 기능(알림 예약, JSON 직렬화)은 **release 빌드로 꼭 다시 테스트**해야 합니다.
- 심볼 파일은 “빌드 결과물”이 아니라 **운영 자산**입니다. 버전과 함께 잃어버리지 않게 보관해야 합니다.
