---
title: 10대부터 80대까지 — Flutter 앱에 큰 글씨 모드와 삭제 되돌리기 넣기
description: 휴대폰 글꼴 설정을 존중하면서 앱 안에서 글씨를 더 키우는 방법, 한국어가 한두 글자씩 끊기지 않게 하는 방법, 실수로 지운 기록을 6초 안에 되살리는 방법을 정리했습니다.
date: 2026-11-26
category: flutter
project: mytodo
order: 11
draft: false
---

## 왜 필요했나

‘나의 할 일’의 목표는 **10대부터 80대까지** 누구나 쓰기 쉬운 앱입니다. 기능이 늘어날수록 놓치기 쉬운 것이 **글씨 크기**와 **실수로 지운 기록**이었습니다. 1.6.2에서는 새 기능 대신 이 부분을 손봤습니다.

- 큰 글씨 모드 (기본 · 크게 · 아주 크게)
- 한국어 줄바꿈 다듬기
- 삭제 되돌리기

## 1. 큰 글씨 모드: 휴대폰 설정에 “곱하기”

휴대폰에는 이미 글꼴 크기 설정이 있습니다. 앱이 이를 무시하고 자기 크기로 덮어쓰면, 시스템에서 크게 해 둔 사용자가 오히려 작은 글씨를 보게 됩니다. 그래서 앱 배율을 **휴대폰 배율에 곱하기**로 했습니다.

배율은 enum으로 정했습니다.

```dart
enum TextSizeOption {
  normal('normal', '기본', 1.0),
  large('large', '크게', 1.15),
  xlarge('xlarge', '아주 크게', 1.3);

  const TextSizeOption(this.code, this.label, this.scale);
  final String code;
  final String label;
  final double scale;

  /// 크게 이상이면 버튼·카드 테두리도 진하게 표시합니다.
  bool get strongOutline => this != TextSizeOption.normal;
}
```

적용은 `MaterialApp.builder`에서 한 번만 합니다. 앱 전체의 `MediaQuery`를 감싸 `textScaler`를 바꾸면, 화면마다 글씨 크기를 따로 고칠 필요가 없습니다.

```dart
builder: (ctx, child) {
  // 큰 글씨 모드: 휴대폰 글꼴 크기에 앱 배율을 곱함 (최대 2배)
  final mq = MediaQuery.of(ctx);
  final scale = (mq.textScaler.scale(1) * textSize.scale).clamp(0.5, 2.0);
  return MediaQuery(
    data: mq.copyWith(textScaler: TextScaler.linear(scale)),
    child: child!,
  );
},
```

`clamp(0.5, 2.0)`로 상한을 둔 이유는, 휴대폰에서 이미 최대 크기를 쓰는 사람이 “아주 크게”를 고르면 버튼 안 글자가 넘쳐 레이아웃이 깨지기 때문입니다.

### 글씨만 키우면 부족하다

글씨가 커지면 상대적으로 **연한 테두리**가 더 안 보입니다. 그래서 “크게” 이상에서는 테마의 `outlineVariant`(연한 테두리)를 `outline`(진한 테두리)으로 바꿔, 버튼과 카드의 경계도 함께 강조했습니다.

```dart
ThemeData strong(ThemeData t) => textSize.strongOutline
    ? t.copyWith(colorScheme: t.colorScheme.copyWith(outlineVariant: t.colorScheme.outline))
    : t;
```

화면 코드는 원래부터 `scheme.outlineVariant`를 쓰고 있어서, 한 줄 바꿨는데 앱 전체 테두리가 바뀌었습니다.

### 고르기 전에 미리 보여주기

설정 화면에서는 각 선택지 아래에 **실제 그 크기로 렌더링한 예시 문장**을 보여줍니다. 이때 이미 앱 배율이 적용된 상태이므로, 현재 앱 배율을 나눠 휴대폰 자체 배율을 구한 뒤 각 선택지 배율을 곱합니다.

```dart
/// 휴대폰 자체 글꼴 배율 (앱 배율을 빼고 계산)
double _baseScale(BuildContext context) =>
    MediaQuery.textScalerOf(context).scale(1) / ThemeRepository.instance.textSize.scale;
```

## 2. 한국어가 한두 글자씩 끊기지 않게

글씨를 키우면 줄바꿈이 많아집니다. 그런데 Flutter는 한국어를 **글자 단위로** 줄을 바꿀 수 있어서, “일정을 / 확인하세요”가 아니라 “일정을 확인하 / 세요”처럼 끊기곤 했습니다.

웹에서는 CSS `word-break: keep-all`로 해결하지만 Flutter에는 같은 옵션이 없습니다. 그래서 글자 사이에 보이지 않는 문자인 **WORD JOINER**(U+2060)를 넣어 “여기서는 줄을 바꾸지 말라”고 알려 주는 `keepWords()`를 만들었습니다. 공백과 줄바꿈 앞뒤에는 넣지 않으므로, 줄은 **단어 사이에서만** 바뀝니다.

```dart
String keepWords(String text) {
  const space = 0x20, newline = 0x0A, joiner = '\u2060';
  final runes = text.runes.toList();
  final buf = StringBuffer();
  for (var i = 0; i < runes.length; i++) {
    final c = runes[i];
    buf.writeCharCode(c);
    if (i + 1 < runes.length) {
      final n = runes[i + 1];
      final breakable = c == space || c == newline || n == space || n == newline;
      // 이모지 변형 선택자·결합 문자 앞에는 넣지 않음
      final combining = n == 0xFE0F || n == 0x200D || (n >= 0x1F3FB && n <= 0x1F3FF);
      if (!breakable && !combining && c != 0x200D) buf.write(joiner);
    }
  }
  return buf.toString();
}
```

주의할 점은 **이모지**였습니다. 👍🏻 같은 피부색 이모지나 👨‍👩‍👧 같은 결합 이모지는 여러 코드 포인트로 이루어져 있어, 그 사이에 문자를 끼우면 그림이 쪼개집니다. 그래서 변형 선택자(U+FE0F), 결합자(U+200D), 피부색 수정자 앞에는 넣지 않았습니다.

이 함수는 모든 텍스트에 쓰지 않고, 홈 메뉴 라벨이나 권한 안내처럼 **짧고 눈에 띄는 문장**에만 씁니다. 사용자가 직접 입력한 글에는 넣지 않는 것이 안전합니다. 복사하면 보이지 않는 문자가 함께 따라가기 때문입니다.

## 3. 삭제 되돌리기: 6초의 여유

“삭제하시겠습니까?” 확인 창이 있어도, 자주 보면 습관처럼 “예”를 누르게 됩니다. 그래서 확인 창과 별개로 **지운 뒤 6초 동안 되돌릴 수 있게** 했습니다.

### 저장소에 restore() 두기

각 Repository에 삭제의 반대 동작을 만들었습니다. 같은 id로 다시 넣고, 완료되지 않은 할 일이면 **알림도 다시 예약**합니다. 데이터만 되살리고 알림을 잊으면, 사용자는 되돌렸다고 믿는데 알림이 오지 않습니다.

```dart
/// 삭제를 되돌립니다 (같은 id 로 다시 넣고 알림도 다시 예약).
Future<void> restore(Todo todo) async {
  if (_todos.any((t) => t.id == todo.id)) return;
  _todos.add(todo);
  await _save();
  notifyListeners();
  if (!todo.isDone) await NotificationService.instance.scheduleTodo(todo);
}
```

### 화면을 닫아도 안내가 보이게

편집 화면에서 삭제하면 화면이 닫히면서 이전 화면으로 돌아갑니다. 이때 닫히는 화면의 `context`로 스낵바를 띄우면 화면과 함께 사라집니다. 그래서 **화면을 닫기 전에** `ScaffoldMessenger`를 받아 두고, 그 messenger로 안내를 띄웁니다.

```dart
final messenger = ScaffoldMessenger.of(context); // 닫기 전에 잡아 두기
await _repo.remove(todo.id);
showUndoSnackBar(messenger, '"${todo.title}" 삭제됨', () => _repo.restore(todo));
Navigator.of(context).pop(true);
```

할 일·메모·가계부·기분 기록 모두 같은 `showUndoSnackBar()`를 써서, 어디서 지워도 같은 위치에 같은 문구가 나옵니다.

## 배운 점

- 접근성은 시스템 설정을 **덮어쓰는 것이 아니라 존중하고 더하는 것**입니다. 그래서 곱하기로 했고, 상한을 뒀습니다.
- 글씨 크기, 테두리 대비, 줄바꿈은 따로 노는 문제가 아니었습니다. 하나를 키우면 나머지도 함께 손봐야 읽기 쉬워집니다.
- 확인 창만으로는 실수를 다 막을 수 없습니다. **되돌리기**를 함께 두면 훨씬 너그러워집니다. 되돌릴 때는 데이터뿐 아니라 알림 같은 **부수 효과**까지 되살려야 합니다.
