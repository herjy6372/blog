---
title: 외부 패키지 없이 CustomPainter로 악보 위에 필기하기
description: 성경&찬양 앱의 펜·형광펜·지우개·실행 취소를 직접 만든 방법입니다. 악보는 지우지 않는 지우개, 확대해도 어긋나지 않는 좌표, 그리기와 화면 이동이 부딪히지 않게 한 처리를 정리했습니다.
date: 2026-11-26
category: flutter
project: bible-praise
order: 13
draft: false
---

## 왜 직접 만들었나

‘성경&찬양’은 예배와 찬양팀을 위한 악보 앱입니다. 종이 악보에 연필로 표시하듯, 앱 악보 위에도 바로 적고 칠할 수 있어야 했습니다.

필기 패키지도 있지만, 필요한 것은 생각보다 단순했습니다.

- 펜 · 형광펜 · 지우개
- 실행 취소 · 다시 실행
- 곡마다 저장하고, 클라우드에 백업

그래서 Flutter의 `CustomPainter`로 직접 만들었습니다. 의존성이 줄고, 저장 형식을 내가 정할 수 있어서 백업·복원에도 그대로 쓸 수 있었습니다.

## 1. 데이터 모델: 획(stroke) 하나 = 점들의 목록

필기는 **획의 목록**입니다. 획 하나는 점들의 목록과 색, 굵기, 종류(지우개·형광펜)를 가집니다.

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

JSON 키를 `c`, `w`, `e`처럼 한 글자로 줄인 것은 곡마다 수백 개의 점이 저장되기 때문입니다. 색은 `Color` 객체 대신 **정수**(ARGB)로 저장해 JSON으로 바로 바꿀 수 있게 했습니다.

## 2. 그리기: 손가락을 따라 점 추가

화면의 손가락 입력은 `GestureDetector`가 아니라 `Listener`로 받습니다. 제스처 인식을 거치지 않아 펜을 대자마자 바로 반응합니다.

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

형광펜은 따로 섞는 방식을 만들지 않고, **색에 투명도(45%)를 미리 넣어** 아래 악보가 비쳐 보이게 했습니다.

손가락이 움직이면 `_current`에 점을 더하고, 손을 떼면 완성된 획을 목록에 넣습니다. 새 획을 그리면 다시 실행 목록(`_redoStack`)은 비웁니다. 갈라진 기록을 다시 실행하면 순서가 꼬이기 때문입니다.

## 3. 지우개가 악보까지 지우면 안 된다

가장 고민한 부분입니다. 지우개를 “흰색 펜”으로 만들면 간단하지만, 흰 선이 **악보의 음표까지 덮어** 버립니다.

그래서 필기를 악보와 **다른 층**에 그리고, 지우개는 그 층에서만 픽셀을 **투명하게 지우게** 했습니다.

```dart
@override
void paint(Canvas canvas, Size size) {
  // 필기만 담을 별도 레이어
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
    // 이 레이어의 픽셀만 투명하게 → 아래 악보는 그대로
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
  // ...점이 하나면 원, 여러 개면 Path로 이어서 그림
}
```

> 코드는 원본에서 형광펜 분기를 빼고 줄였습니다.

`BlendMode.clear`는 그리는 곳의 픽셀을 완전히 투명하게 만듭니다. `saveLayer` 없이 쓰면 **화면 전체**에서 지워져 악보도 사라지지만, `saveLayer`로 레이어를 따로 열면 그 레이어 안의 필기만 지워집니다. 악보 이미지는 이 레이어 **아래**에 있으니 영향을 받지 않습니다.

지우개도 하나의 “획”으로 저장되므로, **지운 것도 실행 취소**할 수 있습니다. 획 목록을 순서대로 다시 그리기만 하면 되기 때문입니다.

## 4. 확대해도 필기가 어긋나지 않게

악보는 `InteractiveViewer` 안에서 확대·이동합니다. 필기를 **화면 좌표**로 저장하면, 확대한 상태에서 그린 선이 원래 크기로 돌아왔을 때 엉뚱한 곳에 가 있게 됩니다.

그래서 필기 레이어(`Listener` + `CustomPaint`)를 `InteractiveViewer`의 **자식 안**, 악보 페이지와 같은 `Stack`에 넣었습니다. 이렇게 하면 `e.localPosition`이 화면이 아니라 **악보 기준 좌표**로 들어옵니다. 확대·이동은 악보와 필기에 똑같이 적용되므로, 저장된 좌표는 언제나 같은 음표 위를 가리킵니다.

```dart
InteractiveViewer(
  // 그리는 중에는 손가락이 화면을 움직이지 않도록
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

### 그리기와 화면 이동이 부딪히지 않게

같은 손가락 동작이 “선 긋기”일 수도, “악보 넘기기”일 수도 있습니다. 도구를 골랐을 때만 그리기로 처리하도록 두 가지를 맞췄습니다.

- 도구를 고르면 `InteractiveViewer`의 이동·확대를 **끕니다** (`panEnabled`, `scaleEnabled`).
- `Listener`의 `behavior`도 도구가 있으면 `opaque`(입력을 내가 받음), 없으면 `translucent`(아래로 흘려보냄)로 바꿉니다.

## 5. 곡마다 저장하기

획 목록은 곡 id별로 `SharedPreferences`에 JSON으로 저장합니다. 필기를 모두 지우면 키 자체를 지워서 빈 데이터가 쌓이지 않게 했습니다.

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

키에 `v1`을 붙여 둔 것은 나중에 저장 형식을 바꿔야 할 때를 위한 것입니다. 저장된 JSON이 깨져 있으면 예외를 던지지 않고 빈 필기로 시작합니다. 필기 하나 때문에 악보를 못 여는 일은 없어야 하니까요.

이 형식은 Google 로그인 후 **클라우드 백업·복원**에도 그대로 쓰입니다. 같은 키 접두사(`anno_v1_`)를 가진 값들을 모아 Firestore에 올리면 되기 때문입니다.

## 배운 점

- 필기 기능의 핵심은 그리기보다 **레이어 분리**였습니다. `saveLayer` + `BlendMode.clear` 조합이면 아래 내용을 건드리지 않는 지우개를 만들 수 있습니다.
- 좌표는 **콘텐츠 기준**으로 저장해야 합니다. 그리는 레이어를 확대되는 콘텐츠와 같은 자식 안에 두면 Flutter가 좌표 변환을 대신해 줍니다.
- 같은 손가락 입력을 두 기능이 함께 원할 때는, **모드를 정하고 한쪽을 확실히 끄는 것**이 가장 예측하기 쉬웠습니다.
- 저장 형식을 직접 정하면 백업·복원·형식 변경까지 같은 데이터로 이어 갈 수 있습니다.
