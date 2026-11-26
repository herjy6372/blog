---
title: Drawing a map of Korea with GeoJSON and CustomPainter, no map SDK
description: Projecting census GeoJSON by hand, using ray casting to find where the dart landed, and fixing darts that kept landing in the sea by reversing the order of events.
date: 2026-11-26
category: flutter
project: random-travel
order: 6
draft: false
---

## Why no map SDK

Korea Random Trip picks your next destination by throwing a dart. It doesn't need directions or satellite imagery: just **one map with district borders**, and a way to tell **which district the dart hit**. A map SDK is heavy and needs an API key and billing, so I drew the census GeoJSON (17 provinces, 250 districts) myself.

## 1. Projection: lat/long → screen

Latitude and longitude are angles on a sphere; drawn as-is, Korea looks stretched sideways. At this scale a simple projection is enough:

```text
x = longitude × cos(middle latitude)
y = −latitude
```

Multiplying longitude by `cos(middle latitude)` fixes the horizontal ratio, and the minus sign flips y because screen y grows downward.

Polygons are converted to `Path`s in these “world coordinates” **once at startup**. Fitting to the screen is done with a canvas transform (`MapFit`), not by rebuilding paths.

## 2. Split what moves from what doesn't

Redrawing 250 polygons every frame while the dart flies would stutter.

- Static map: `KoreaMapPainter` inside a `RepaintBoundary`
- Moving dart: a separate `DartOverlayPainter`

The map is never repainted during the animation. One controller runs the dart's state machine: `idle → charging → flying → landed`.

## 3. Where did it land? Ray casting

A **point-in-polygon** test answers that. Cast a ray from the point: crossing the polygon's edges an **odd** number of times means inside, even means outside.

```dart
bool contains(List<Offset> ring, Offset p) {
  var inside = false;
  for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    final a = ring[i], b = ring[j];
    final crosses = (a.dy > p.dy) != (b.dy > p.dy) &&
        p.dx < (b.dx - a.dx) * (p.dy - a.dy) / (b.dy - a.dy) + a.dx;
    if (crosses) inside = !inside;
  }
  return inside;
}
```

Applying the same even-odd rule across all rings handles polygons with holes. That's enough to tell land (which district), North Korea and sea apart.

> The code above is simplified to show the idea.

## 4. The problem: darts kept landing in the sea

At first the dart flew to a random screen point and I checked where it landed. Much of the map is sea or North Korea, so it picked **unreachable places far too often**. Asking the user to throw again undermines the whole “let chance decide” idea.

### The fix: choose the result first, then aim

1. Pick one of the 250 districts.
2. Sample points in its bounding box and keep one that's inside the real polygon (fall back to the centroid).
3. Fire the dart at that point's screen position.

It still looks like a dart flying and sticking, but the result is always a real district. A **seeded 200-run test** confirms every result is on land and inside the district returned.

## Takeaways

- Without a map SDK, **projection, point-in-polygon and split rendering** were enough for a solid map.
- Making randomness *look* fair and making the result *useful* are different problems. Deciding the result first and fitting the animation to it solved both.
- Randomised logic can still be tested with a **fixed seed**.
