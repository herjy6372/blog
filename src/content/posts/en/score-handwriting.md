---
title: Handwriting on sheet music with CustomPainter, no packages
description: How Bible & Hymns got its pen, highlighter, eraser and undo — an eraser that never erases the score, coordinates that stay put when you zoom, and drawing that doesn't fight with panning.
date: 2026-11-26
category: flutter
project: bible-praise
order: 13
draft: false
---

## Why build it myself

Bible & Hymns is a score app for worship services and worship teams. Just as people pencil marks onto paper scores, they needed to write and highlight directly on the scores in the app.

Drawing packages exist, but the needs were modest:

- Pen · highlighter · eraser
- Undo · redo
- Saved per song and backed up to the cloud

So I built it with Flutter's `CustomPainter`. One less dependency, and I control the storage format, which then works as-is for backup and restore.

## 1. The model: a stroke is a list of points

Handwriting is **a list of strokes**. Each stroke holds its points, colour, width and kind (eraser or highlighter).

```dart
enum DrawTool { none, pen, highlighter, eraser }

class _Stroke {
  final List<_Pt> pts;
  final int clr;
  final double w;
  final bool erase;
  final bool highlight;
  // ...
  Map<String, dynamic> toJson() => {
    'pts': pts.map((p) => p.toJson()).toList(),
    'c': clr,
    'w': w,
    'e': erase,
    if (highlight) 'h': true,
  };
}
```

The JSON keys are single letters (`c`, `w`, `e`) because each song stores hundreds of points. Colours are stored as **ARGB integers** rather than `Color` objects so they go straight into JSON.

## 2. Drawing: add points as the finger moves

Touch input comes through a `Listener`, not a `GestureDetector`. Without gesture recognition in the way, the pen responds the moment it touches.

```dart
void _onPointerDown(PointerDownEvent e) {
  if (_tool == DrawTool.none) return;
  final isHL = _tool == DrawTool.highlighter;
  final isErase = _tool == DrawTool.eraser;
  setState(() {
    _current = _Stroke(
      pts: [_Pt(e.localPosition.dx, e.localPosition.dy)],
      clr: isErase
          ? Colors.white.toARGB32()
          : isHL
              ? _hlColor.withValues(alpha: 0.45).toARGB32()
              : _penColor.toARGB32(),
      w: isErase ? _eraserWidth : isHL ? _hlWidth : _penWidth,
      erase: isErase,
      highlight: isHL,
    );
    _redoStack.clear();
  });
}
```

The highlighter needs no special blending: **45% transparency is baked into its colour**, so the score shows through.

As the finger moves, points are added to `_current`; on lift, the finished stroke joins the list. Drawing a new stroke clears the redo stack, because redoing a branched history would scramble the order.

## 3. The eraser must not erase the score

This took the most thought. A “white pen” eraser is easy, but white lines **cover the notes** too.

So handwriting is drawn on **its own layer**, and the eraser makes pixels **transparent** in that layer only:

```dart
@override
void paint(Canvas canvas, Size size) {
  // A separate layer just for handwriting
  canvas.saveLayer(Offset.zero & size, Paint());
  for (final s in [...strokes, ?current]) {
    _draw(canvas, s);
  }
  canvas.restore();
}

void _draw(Canvas canvas, _Stroke s) {
  final paint = Paint()
    ..strokeWidth = s.w
    ..isAntiAlias = true
    ..style = PaintingStyle.stroke;

  if (s.erase) {
    // Clear pixels in this layer only → the score underneath is untouched
    paint
      ..blendMode = BlendMode.clear
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
  } else {
    paint
      ..color = s.color
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
  }
  // ...a single point becomes a circle, several are joined into a Path
}
```

> Shortened from the original, with the highlighter branch removed.

`BlendMode.clear` makes the pixels it touches fully transparent. Without `saveLayer` it would clear **everything on screen**, score included; with its own layer, only handwriting inside that layer disappears. The score images sit **below** the layer, unaffected.

Eraser marks are strokes too, so **erasing can be undone**: redraw the stroke list in order and you're back.

## 4. Handwriting that stays put when you zoom

Scores zoom and pan inside an `InteractiveViewer`. Saving **screen coordinates** would put a line drawn while zoomed in somewhere else entirely at normal size.

So the drawing layer (`Listener` + `CustomPaint`) sits **inside** the `InteractiveViewer`'s child, in the same `Stack` as the score pages. Then `e.localPosition` arrives in **score coordinates**, not screen coordinates. Zoom and pan apply equally to score and handwriting, so a saved point always lands on the same note.

```dart
InteractiveViewer(
  // While drawing, a finger shouldn't move the page
  panEnabled: _tool == DrawTool.none,
  scaleEnabled: _tool == DrawTool.none,
  constrained: false,
  transformationController: _txCtrl,
  child: Stack(
    children: [
      Column(children: _pages.map((bytes) => Image.memory(bytes, fit: BoxFit.contain)).toList()),
      Positioned(
        top: 0, left: 0,
        child: Listener(
          onPointerDown: _onPointerDown,
          onPointerMove: _onPointerMove,
          onPointerUp: _onPointerUp,
          behavior: _tool != DrawTool.none
              ? HitTestBehavior.opaque
              : HitTestBehavior.translucent,
          child: CustomPaint(
            painter: _AnnoPainter(_strokes, _current),
            size: Size(_pageW, _totalH),
          ),
        ),
      ),
    ],
  ),
)
```

### Drawing vs. panning

The same finger motion could mean “draw a line” or “scroll the score”. Drawing only happens when a tool is selected, enforced in two places:

- With a tool selected, `InteractiveViewer` panning and zooming are **switched off** (`panEnabled`, `scaleEnabled`).
- The `Listener`'s `behavior` is `opaque` (take the input) with a tool, `translucent` (let it pass through) without.

## 5. Saving per song

Each song's stroke list is saved as JSON in `SharedPreferences`, keyed by song id. Clearing all handwriting removes the key, so empty entries don't pile up.

```dart
const _kAnnoPrefix = 'anno_v1_';

Future<void> _saveAnno(String songId, List<_Stroke> strokes) async {
  final prefs = await SharedPreferences.getInstance();
  if (strokes.isEmpty) {
    await prefs.remove('$_kAnnoPrefix$songId');
  } else {
    await prefs.setString(
      '$_kAnnoPrefix$songId',
      jsonEncode(strokes.map((s) => s.toJson()).toList()),
    );
  }
}
```

The `v1` in the key leaves room for a future format change. If saved JSON is corrupt, loading returns empty handwriting instead of throwing — a bad annotation should never stop a score from opening.

The same format powers **cloud backup and restore** after Google sign-in: collect every value whose key starts with `anno_v1_` and upload it to Firestore.

## Takeaways

- The heart of handwriting wasn't drawing but **layer separation**. `saveLayer` + `BlendMode.clear` gives you an eraser that leaves the content beneath alone.
- Store coordinates **relative to the content**. Put the drawing layer inside the same zoomable child and Flutter converts coordinates for you.
- When two features want the same finger input, **pick a mode and switch the other off completely**. It's the most predictable option.
- Owning the storage format means backup, restore and future migrations all work from the same data.
