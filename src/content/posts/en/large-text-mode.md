---
title: "From teens to eighties: large-text mode and undo-delete in a Flutter app"
description: How to make text bigger inside the app while respecting the phone's font setting, keep Korean from breaking mid-word, and bring back a deleted record within six seconds.
date: 2026-11-26
category: flutter
project: mytodo
order: 11
draft: false
---

## Why

My To-Do aims to be easy for **everyone from teens to people in their eighties**. As features piled up, two things were easy to miss: **text size** and **records deleted by mistake**. Version 1.6.2 spent its effort there instead of on new features.

- Large-text mode (normal · large · extra large)
- Better Korean line breaking
- Undo delete

## 1. Large-text mode: *multiply* the phone's setting

Phones already have a font-size setting. If the app overrides it with its own size, people who enlarged text system-wide end up with *smaller* text. So the app's scale is **multiplied by the phone's**.

```dart
enum TextSizeOption {
  normal('normal', '기본', 1.0),
  large('large', '크게', 1.15),
  xlarge('xlarge', '아주 크게', 1.3);

  const TextSizeOption(this.code, this.label, this.scale);
  final String code;
  final String label;
  final double scale;

  /// Large or above also strengthens button and card borders.
  bool get strongOutline => this != TextSizeOption.normal;
}
```

It's applied once, in `MaterialApp.builder`. Wrapping the whole app's `MediaQuery` and changing `textScaler` means no screen needs its own font tweaks.

```dart
builder: (ctx, child) {
  // Large-text mode: phone font scale × app scale (max 2×)
  final mq = MediaQuery.of(ctx);
  final scale = (mq.textScaler.scale(1) * textSize.scale).clamp(0.5, 2.0);
  return MediaQuery(
    data: mq.copyWith(textScaler: TextScaler.linear(scale)),
    child: child!,
  );
},
```

The `clamp(0.5, 2.0)` cap exists because someone already at the phone's maximum who also picks “extra large” would otherwise overflow buttons and break layouts.

### Bigger text alone isn't enough

As text grows, **faint borders** get harder to see by comparison. From “large” upward, the theme's `outlineVariant` (faint border) is replaced with `outline` (strong border):

```dart
ThemeData strong(ThemeData t) => textSize.strongOutline
    ? t.copyWith(colorScheme: t.colorScheme.copyWith(outlineVariant: t.colorScheme.outline))
    : t;
```

Screens already used `scheme.outlineVariant`, so one line changed every border in the app.

### Preview before choosing

The settings screen shows a **sample sentence rendered at each size**. Since the app scale is already applied, it divides it out to get the phone's own scale, then multiplies by each option:

```dart
/// The phone's own font scale (with the app scale removed)
double _baseScale(BuildContext context) =>
    MediaQuery.textScalerOf(context).scale(1) / ThemeRepository.instance.textSize.scale;
```

## 2. Keeping Korean words whole

Bigger text means more line breaks, and Flutter may break Korean **between any two characters**, splitting words in awkward places.

On the web, CSS `word-break: keep-all` fixes this; Flutter has no equivalent. So `keepWords()` inserts an invisible **WORD JOINER (U+2060)** between characters, telling the engine not to break there. It skips positions next to spaces and newlines, so lines break **only between words**.

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
      // Don't insert before emoji variation selectors or joiners
      final combining = n == 0xFE0F || n == 0x200D || (n >= 0x1F3FB && n <= 0x1F3FF);
      if (!breakable && !combining && c != 0x200D) buf.write(joiner);
    }
  }
  return buf.toString();
}
```

The catch was **emoji**. Skin-tone emoji like 👍🏻 and joined emoji like 👨‍👩‍👧 are several code points; inserting a character between them splits the picture. So nothing is inserted before variation selectors (U+FE0F), zero-width joiners (U+200D) or skin-tone modifiers.

The function is used only on **short, prominent text** such as home-menu labels and permission notices. It's safer to leave user-typed text alone, because copying it would carry the invisible characters along.

## 3. Undo delete: six seconds of grace

Even with an “Are you sure?” dialog, people learn to tap “Yes” by habit. So alongside the dialog, a deletion can be **undone for six seconds**.

### A restore() in each repository

Each repository got the inverse of delete. It re-inserts the item with the same id and, for unfinished to-dos, **reschedules the notification**. Restoring the data but forgetting the notification would leave users believing it's back while the reminder never fires.

```dart
/// Undo a deletion (re-insert with the same id and reschedule its notification).
Future<void> restore(Todo todo) async {
  if (_todos.any((t) => t.id == todo.id)) return;
  _todos.add(todo);
  await _save();
  notifyListeners();
  if (!todo.isDone) await NotificationService.instance.scheduleTodo(todo);
}
```

### Keep the message after the screen closes

Deleting from the edit screen closes it and returns to the previous one. A snackbar shown with the closing screen's `context` disappears with it. So the `ScaffoldMessenger` is captured **before closing**, and the message is shown through it:

```dart
final messenger = ScaffoldMessenger.of(context); // grab it before closing
await _repo.remove(todo.id);
showUndoSnackBar(messenger, '"${todo.title}" 삭제됨', () => _repo.restore(todo));
Navigator.of(context).pop(true);
```

To-dos, memos, the ledger and the mood log all use the same `showUndoSnackBar()`, so the message looks the same wherever you delete.

## Takeaways

- Accessibility means **respecting and adding to** system settings, not overriding them — hence multiplying, with a cap.
- Text size, border contrast and line breaking are one problem: enlarge one and the others need care too.
- A confirmation dialog alone can't stop every slip; an **undo** is far more forgiving. When undoing, restore the **side effects** (notifications) as well as the data.
