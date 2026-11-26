---
title: Adding nine Android and iOS home-screen widgets to a Flutter app
description: Using home_widget to drive Android RemoteViews and iOS WidgetKit from the same data keys, and keeping widget taps from fighting with app sync.
date: 2026-11-26
category: native
project: mytodo
order: 3
draft: true
---

## What I built

Version 1.6.0 of My To-Do added nine home-screen widgets: to-do checklist, daily and yearly progress, mood, ledger, memo, timer, and one- and two-city clocks.

Flutter can't draw home-screen widgets itself. The OS renders them in a **separate process**, so Android needs `RemoteViews` (XML layouts) and iOS needs `WidgetKit` (SwiftUI).

## Structure: Flutter owns the data, native code draws

The `home_widget` package is the bridge:

1. The Flutter app computes to-do, mood and ledger data and writes it to a **key-value store**.
2. It asks the widgets to refresh.
3. Android and iOS widgets read the **same keys** and draw.

Matching key names on both platforms keeps the Flutter side single, and a new widget doesn't need its data format designed twice. On iOS the widget extension lives in a different sandbox, so both targets share an **App Group** to read the same store.

## The hard part: taps inside the widget

The to-do widget has a check button, but the app also syncs with Firebase. If the widget extension changed data directly, the next sync could **overwrite the check made in the widget.**

So iOS widget taps go into an **App Group queue** instead. When the app opens, it applies the queue through `TodoRepository`, so every change takes the app's normal path: save → reschedule notifications → sync.

> The widget is a quick input; the app stays the owner of the data.

## Security: widgets follow sign-in too

In 1.6.2 the timer, world clock and memos started requiring sign-in. But the **timer widget** lives outside the app and could bypass that. The app now records sign-in state in the widget store, the widget shows a lock message when signed out, and its start action checks again. Rules inside the app must also cover entry points outside it: widgets, notifications, deep links.

## Takeaways

- Widgets run in **another process**; data moves through shared storage only.
- Having both platforms read the **same keys** keeps one Flutter code path.
- Queue widget changes and apply them **through the app** to avoid sync conflicts.
- Access rules must reach **entry points outside the app** too.
