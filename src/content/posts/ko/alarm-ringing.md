---
title: 알림이 아니라 “알람”이 울리게 — Flutter에서 1분간 울리는 알람 만들기
description: 조용히 지나가던 알림을 진짜 알람처럼 만들기 위해 알림 채널, 전체 화면 알림, 네이티브 소리 재생, iOS 30초 제한을 하나씩 해결한 과정입니다.
date: 2026-11-26
category: native
project: mytodo
order: 12
draft: false
---

## 문제 상황

‘나의 할 일’ 1.6.0에 아침 깨우기·잘 때·일반 알람을 넣었습니다. 처음 버전은 **알람이라기보다 알림**에 가까웠습니다. 기기 기본 알람음에 기대는 평범한 알림이었고, 사람을 깨울 수 있을 만큼 확실하게 울리는 장치가 없었습니다.

1.6.1에서는 이것을 진짜 알람으로 바꾸는 데 집중했습니다. 목표는 단순했습니다.

- **알람 볼륨**으로, 앱에 포함된 같은 알람음이 울릴 것
- **1분 동안** 반복해서 울릴 것
- 잠금 화면 위에 알람 화면을 띄우고, **끄거나 1·5·10·30분 미룰 때까지** 화면을 차지할 것

## 1. Android: 알림 채널을 알람용으로

Android 8 이상에서 알림의 소리·중요도·진동은 **알림 채널**이 정합니다. 그리고 채널 설정은 **한 번 만들면 앱에서 바꿀 수 없습니다.** 처음 만든 채널은 기기 기본 알람음 URI를 쓰고 있었는데, 이것을 고치려고 설정값만 바꾸면 이미 설치한 사용자에게는 반영되지 않습니다. 그래서 채널 ID를 `alarm_channel_v2`로 바꿔 **새 채널**을 만들었습니다.

```dart
AndroidNotificationDetails(
  'alarm_channel_v2',
  '알람',
  channelDescription: '설정한 시간에 알람음으로 알려드립니다.',
  importance: Importance.max,
  priority: Priority.max,
  category: AndroidNotificationCategory.alarm,
  playSound: true,
  sound: const RawResourceAndroidNotificationSound('alarm'),
  audioAttributesUsage: AudioAttributesUsage.alarm,
  enableVibration: true,
  fullScreenIntent: true,
  timeoutAfter: ringDuration.inMilliseconds,
  // FLAG_INSISTENT(4): 알림이 남아 있는 동안 소리 반복
  additionalFlags: Int32List.fromList(const [4]),
  visibility: NotificationVisibility.public,
)
```

핵심 설정은 네 가지입니다.

| 설정 | 하는 일 |
|---|---|
| `sound` (앱에 포함된 `alarm` 파일) | 기기마다 다른 기본음 대신 항상 같은 알람음 |
| `audioAttributesUsage: alarm` | **알람 볼륨**으로 재생 |
| `FLAG_INSISTENT` | 알림이 남아 있는 동안 소리를 **반복** |
| `timeoutAfter: 1분` | 1분이 지나면 알림이 사라지며 소리도 멈춤 |

### R8이 알람음을 지우지 않게

알람음 파일은 코드에서 직접 참조하지 않고, 알림 채널에 **이름(`'alarm'`)으로만** 넘깁니다. 그래서 R8 리소스 축소가 “안 쓰는 파일”로 보고 지울 수 있습니다. `res/raw/keep.xml`로 지켜 줬습니다.

```xml
<!-- 알람음은 알림 채널에서 이름으로만 참조되므로 리소스 축소 시 지워지지 않도록 유지 -->
<resources xmlns:tools="http://schemas.android.com/tools"
    tools:keep="@raw/alarm" />
```

### 정확한 시각에, 절전 중에도

예약은 `AndroidScheduleMode.alarmClock`으로 합니다. 절전 모드에서도 정확한 시각에 울리고, 상태 표시줄에 알람 아이콘도 보입니다. 정확한 알람 권한이 없는 기기에서는 예외가 나므로, 그때는 조금 늦어도 울리는 방식으로 다시 예약합니다.

```dart
try {
  // 알람 시계 모드: 절전 중에도 정확한 시각에 울림
  await go(nid, at, AndroidScheduleMode.alarmClock);
} catch (e) {
  await go(nid, at, AndroidScheduleMode.inexactAllowWhileIdle);
}
```

## 2. 잠금 화면 위에 알람 화면 띄우기

`fullScreenIntent: true`를 주면 화면이 꺼져 있거나 잠겨 있을 때 알림이 **앱 화면을 바로 엽니다.** 하지만 잠금 화면 **위에** 보이려면 Activity에도 허락이 필요합니다.

앱의 모든 실행에 잠금 화면 위 표시를 켜면, 일반 알림을 눌러 열었을 때도 잠금을 건너뛰게 됩니다. 그래서 **알람 알림으로 열렸을 때만** 켭니다.

```kotlin
/** 알람 알림(전체 화면 알림)으로 열린 경우에만 잠금 화면 위에 표시하고 화면을 켬. */
private fun showOverLockIfAlarm(intent: Intent?) {
    if (intent?.action != "SELECT_NOTIFICATION") return
    val payload = intent.getStringExtra("payload") ?: return
    if (payload.startsWith("alarm:") || payload.startsWith("todoalarm:") ||
        payload.startsWith("snooze:")
    ) setShowOverLock(true)
}
```

알람을 끄면 다시 `setShowOverLock(false)`로 돌려 놓습니다.

## 3. 알람 화면이 직접 소리 내기

알람 화면이 열리면 알림 쪽 소리는 끄고, **화면이 소리를 이어받습니다.** 알림 소리는 앱이 세밀하게 제어할 수 없지만, 네이티브 플레이어는 “중지”를 누르는 순간 확실히 멈출 수 있기 때문입니다.

Flutter와 네이티브는 `MethodChannel` 하나(`mytodo/alarm_sound`)로 `start`·`stop`만 주고받습니다.

```kotlin
/** 알람 볼륨으로 알람음을 반복 재생 (멈출 때까지). */
private fun startSound() {
    stopSound()
    player = MediaPlayer.create(
        this,
        R.raw.alarm,
        AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build(),
        0,
    )?.apply {
        isLooping = true
        start()
    }
    // 진동도 0.8초 울림 · 0.6초 쉼을 반복
    vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 800, 600), 0))
}
```

iOS는 `AVAudioPlayer`로 같은 일을 합니다. 오디오 세션을 `.playback`으로 두면 **무음 스위치를 켜 둬도** 알람음이 납니다.

```swift
/// 무음 스위치와 관계없이 알람음을 반복 재생합니다 (멈출 때까지).
private func startAlarmSound() {
  stopAlarmSound()
  guard let url = Bundle.main.url(
    forResource: "alarm", withExtension: "wav",
    subdirectory: "Frameworks/App.framework/flutter_assets/assets/sounds")
  else { return }
  try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
  try? AVAudioSession.sharedInstance().setActive(true)
  alarmPlayer = try? AVAudioPlayer(contentsOf: url)
  alarmPlayer?.numberOfLoops = -1
  alarmPlayer?.play()
}
```

화면에서는 남은 시간만큼 타이머를 걸어 1분이 지나면 소리를 멈추고, **중지** 또는 **1·5·10·30분 다시 울림**을 고를 수 있습니다. 다시 울림은 같은 알람 설정으로 새 알림을 예약하는 것입니다.

## 4. iOS의 30초 제한

iOS의 알림 소리는 **최대 30초**입니다. 더 긴 파일을 지정하면 기본음으로 바뀝니다. 1분을 채우려고 **30초 뒤에 알림을 한 번 더** 예약했습니다.

```dart
/// iOS 알림 소리는 최대 30초라서, 30초 뒤 한 번 더 울려 1분을 채웁니다.
static const iosFollowUpDelay = Duration(seconds: 30);

await both(id, when);
if (Platform.isIOS) await both(followUpId, when.add(iosFollowUpDelay));
```

후속 알림은 별도의 id(`followUpId`)를 가지므로, 사용자가 첫 알림에서 알람을 끄면 둘 다 함께 취소합니다. 그러지 않으면 껐는데 30초 뒤 또 울리게 됩니다.

또 iOS 알림 소리 파일은 앱 번들이나 `Library/Sounds` 폴더에 있어야 해서, 앱 에셋의 알람음을 처음 실행할 때 `Library/Sounds`로 복사해 둡니다.

## 배운 점

- 알림과 알람은 **다른 기능**입니다. 볼륨 종류, 반복, 잠금 화면 표시, 정확한 시각을 각각 챙겨야 “깨울 수 있는” 알람이 됩니다.
- Android 알림 채널은 한 번 만들면 앱에서 못 바꿉니다. 소리나 중요도를 바꿀 때는 **채널 ID를 새로** 만들어야 합니다.
- 알림이 울리기 시작하면 **소리의 주인을 앱 화면으로 넘기면** 끄기·미루기를 확실하게 제어할 수 있습니다.
- 이름으로만 참조하는 리소스는 R8이 지울 수 있습니다. 축소를 켰다면 **release 빌드로 알람을 실제로 울려 보기**까지가 테스트입니다.
