---
title: 무료 번역 API 제한 안에서 레시피를 한국어로 보여주기
description: 영어 기반 TheMealDB 레시피를 MyMemory 번역 API로 옮기면서 500자 제한을 문장 단위 청크와 4개 배치로 풀고, 캐시 키를 안정적인 해시로 바꾼 과정입니다.
date: 2026-11-26
category: flutter
project: my-recipe
order: 7
draft: true
---

## 문제 상황

‘나의 레시피’는 TheMealDB 공개 API를 씁니다. 데이터가 모두 영어라 두 방향 번역이 필요했습니다.

- **검색어**: 사용자가 “닭고기”라고 쓰면 “chicken”으로 바꿔 검색
- **결과**: 요리 이름과 조리법을 한국어로

무료인 MyMemory 번역 API를 골랐는데, **요청 한 건에 500자** 제한이 있었습니다. 조리법은 대부분 500자를 넘습니다. 한꺼번에 많이 보내면 요청 수 제한에도 걸렸습니다.

## 해결 1: 필요한 것만 번역

- 검색어는 **한글이 포함된 경우에만** 영어로 바꿉니다. “pasta”처럼 영어로 쓴 검색어는 그대로 보냅니다.
- 결과 번역은 앱 언어가 한국어일 때만 합니다.

번역 호출 자체를 줄이는 것이 가장 확실한 최적화였습니다.

## 해결 2: 문장 단위로 500자 청크 나누기

글자 수로만 자르면 문장 중간이 끊겨 번역 품질이 나빠집니다. 그래서 **문장 단위**로 묶어 500자를 넘기 직전까지 채웁니다.

```dart
List<String> chunkBySentence(String text, {int max = 500}) {
  final sentences = text.split(RegExp(r'(?<=[.!?])\s+'));
  final chunks = <String>[];
  var buf = StringBuffer();
  for (final s in sentences) {
    if (buf.length + s.length + 1 > max && buf.isNotEmpty) {
      chunks.add(buf.toString());
      buf = StringBuffer();
    }
    buf.write(buf.isEmpty ? s : ' $s');
  }
  if (buf.isNotEmpty) chunks.add(buf.toString());
  return chunks;
}
```

> 원리를 보여주기 위한 단순화한 코드입니다. 한 문장이 500자를 넘는 경우 등은 실제 코드에서 따로 처리합니다.

## 해결 3: 4개씩 배치로 보내기

청크를 한꺼번에 모두 보내면 요청 수 제한에 걸리고, 하나씩 보내면 너무 느립니다. **4개씩 묶어 병렬로** 보내고, 한 묶음이 끝나면 다음 묶음을 보냈습니다.

## 해결 4: 캐시, 그리고 캐시 키

같은 레시피를 다시 열 때마다 번역하면 제한에 금방 닿습니다. 검색·상세·번역 결과를 **Hive TTL 캐시**에 저장해 같은 조건이면 API를 부르지 않습니다.

여기서 점검 중에 문제를 하나 찾았습니다. 긴 텍스트의 캐시 키를 `String.hashCode`로 만들었는데, Dart의 `hashCode`는 **실행할 때마다, 또는 런타임 버전에 따라 같다는 보장이 없습니다.** 앱 업데이트 후 캐시가 조용히 전부 무효화될 수 있는 구조였습니다.

저장되는 키에는 안정적인 해시가 필요해서 **FNV-1a**를 직접 구현해 썼습니다.

```dart
String fnv1a(String input) {
  var hash = 0x811c9dc5;
  for (final unit in utf8.encode(input)) {
    hash ^= unit;
    hash = (hash * 0x01000193) & 0xffffffff;
  }
  return hash.toRadixString(16).padLeft(8, '0');
}
```

## 배운 점

- 무료 API의 제한은 설계 조건입니다. **호출 줄이기 → 쪼개기 → 묶어 보내기 → 캐시** 순서로 접근했습니다.
- 디스크에 저장하는 키에는 `hashCode`가 아니라 **안정적인 해시**를 써야 합니다.
- 영어 API에 한국어 경험을 얹을 때는 “어디서 번역하고, 무엇을 캐시할지”를 먼저 정해 두면 나머지 설계가 쉬워집니다.
