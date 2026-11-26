---
title: Showing recipes in Korean within a free translation API's limits
description: Translating English TheMealDB recipes through the MyMemory API by splitting text into sentence-based 500-character chunks, sending them four at a time, and using a stable hash for cache keys.
date: 2026-11-26
category: flutter
project: my-recipe
order: 7
draft: true
---

## The problem

My Recipe uses the public TheMealDB API, and all its data is in English. I needed translation both ways:

- **Search terms**: “닭고기” becomes “chicken” before searching
- **Results**: dish names and instructions in Korean

The free MyMemory API allows **500 characters per request**, and most instructions are longer. Sending too much at once also hits rate limits.

## Fix 1: translate only what's needed

- Search terms are translated **only when they contain Hangul**; “pasta” goes through as-is.
- Results are translated only when the app language is Korean.

Not calling the API at all was the most reliable optimisation.

## Fix 2: sentence-based 500-character chunks

Cutting by character count splits sentences and hurts quality, so chunks are filled **sentence by sentence** up to the limit.

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

> Simplified to show the idea; the real code also handles single sentences over 500 characters.

## Fix 3: batches of four

All at once hits the rate limit; one at a time is too slow. Chunks go out **four at a time in parallel**, and the next batch starts when one finishes.

## Fix 4: caching, and the cache key

Re-translating every time a recipe opens burns through the limit, so search, detail and translation results live in a **Hive TTL cache**.

A review turned up a bug: long-text cache keys used `String.hashCode`, and Dart's `hashCode` is **not guaranteed to be stable across runs or runtime versions**. An app update could silently invalidate the whole cache. Keys stored on disk need a stable hash, so I implemented **FNV-1a**:

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

## Takeaways

- A free API's limits are design constraints: **call less → split → batch → cache**.
- Keys you persist need a **stable hash**, not `hashCode`.
- When layering a Korean experience on an English API, deciding early *where to translate and what to cache* makes the rest of the design easier.
