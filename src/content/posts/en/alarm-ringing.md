---
title: "Make it an alarm, not a notification: a one-minute alarm in Flutter"
description: Turning a quiet notification into a real alarm — notification channels, full-screen intents, native sound playback, and iOS's 30-second sound limit, one by one.
date: 2026-11-26
category: native
project: mytodo
order: 12
draft: false
---

## The problem

Version 1.6.0 of My To-Do added wake-up, bedtime and general alarms. The first version was **more notification than alarm**: an ordinary notification leaning on the device's default alarm sound, with nothing that would reliably wake someone up.

Version 1.6.1 focused on turning it into a real alarm. The goals were simple:

- Play the app's own alarm sound at **alarm volume**
- Ring repeatedly for **one minute**
- Show an alarm screen over the lock screen that stays **until you stop it or snooze for 1, 5, 10 or 30 minutes**

## 1. Android: an alarm-grade notification channel

On Android 8+, a notification's sound, importance and vibration are set by its **notification channel**, and **an app can't change a channel after creating it.** The original channel used the device's default alarm-sound URI; changing the settings in code wouldn't reach existing installs. So the channel ID became `alarm_channel_v2`, creating a **new channel**.

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
  // FLAG_INSISTENT(4): repeat the sound while the notification is showing
  additionalFlags: Int32List.fromList(const [4]),
  visibility: NotificationVisibility.public,
)
```

Four settings do the work:

| Setting | What it does |
|---|---|
| `sound` (the bundled `alarm` file) | Always the same sound, not each device's default |
| `audioAttributesUsage: alarm` | Plays at **alarm volume** |
| `FLAG_INSISTENT` | **Repeats** the sound while the notification is up |
| `timeoutAfter: 1 min` | After a minute the notification — and its sound — goes away |

### Don't let R8 delete the sound

The sound file isn't referenced from code; it's passed to the channel **by name only** (`'alarm'`). R8 resource shrinking can treat it as unused and remove it. `res/raw/keep.xml` protects it:

```xml
<!-- The alarm sound is referenced only by name from the notification channel, so keep it during resource shrinking -->
<resources xmlns:tools="http://schemas.android.com/tools"
    tools:keep="@raw/alarm" />
```

### On time, even in Doze

Alarms are scheduled with `AndroidScheduleMode.alarmClock`: exact even in power-saving mode, with the alarm icon in the status bar. Devices without exact-alarm permission throw, so those fall back to a slightly less precise schedule:

```dart
try {
  // Alarm-clock mode: exact time even while idle
  await go(nid, at, AndroidScheduleMode.alarmClock);
} catch (e) {
  await go(nid, at, AndroidScheduleMode.inexactAllowWhileIdle);
}
```

## 2. Showing the alarm over the lock screen

`fullScreenIntent: true` makes the notification **open the app directly** when the screen is off or locked. To appear **on top of** the lock screen, the Activity must allow it too.

Allowing that for every launch would let ordinary notifications bypass the lock as well, so it's switched on **only when opened by an alarm notification**:

```kotlin
/** Show over the lock screen and turn the screen on only when opened by an alarm (full-screen) notification. */
private fun showOverLockIfAlarm(intent: Intent?) {
    if (intent?.action != "SELECT_NOTIFICATION") return
    val payload = intent.getStringExtra("payload") ?: return
    if (payload.startsWith("alarm:") || payload.startsWith("todoalarm:") ||
        payload.startsWith("snooze:")
    ) setShowOverLock(true)
}
```

Stopping the alarm sets it back with `setShowOverLock(false)`.

## 3. The alarm screen plays the sound itself

When the alarm screen opens, the notification's sound is cleared and **the screen takes over the sound**. Apps can't finely control notification sounds, but a native player stops the instant you tap “Stop”.

Flutter and native code talk over one `MethodChannel` (`mytodo/alarm_sound`) with just `start` and `stop`:

```kotlin
/** Loop the alarm sound at alarm volume (until stopped). */
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
    // Vibrate 0.8 s on, 0.6 s off, repeating
    vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 800, 600), 0))
}
```

iOS does the same with `AVAudioPlayer`. With the audio session set to `.playback`, the alarm sounds **even with the silent switch on**:

```swift
/// Loop the alarm sound regardless of the silent switch (until stopped).
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

The screen sets a timer for the remaining time and stops the sound after a minute; you can **Stop** or **snooze for 1, 5, 10 or 30 minutes**. Snoozing schedules a new notification with the same alarm settings.

## 4. iOS's 30-second limit

iOS notification sounds are capped at **30 seconds**; longer files fall back to the default sound. To fill a minute, a **second notification is scheduled 30 seconds later**:

```dart
/// iOS notification sounds max out at 30 s, so ring once more after 30 s to fill a minute.
static const iosFollowUpDelay = Duration(seconds: 30);

await both(id, when);
if (Platform.isIOS) await both(followUpId, when.add(iosFollowUpDelay));
```

The follow-up has its own id (`followUpId`), so stopping the alarm cancels both. Otherwise it would ring again 30 seconds after you turned it off.

iOS also requires notification sounds to live in the app bundle or `Library/Sounds`, so the bundled alarm sound is copied to `Library/Sounds` on first launch.

## Takeaways

- Notifications and alarms are **different features**. Volume type, repetition, lock-screen display and exact timing all need handling before an alarm can actually wake someone.
- Android channels are immutable once created. To change sound or importance, create a **new channel ID**.
- Once the alarm fires, **hand the sound over to the app's screen** so stop and snooze are fully under your control.
- Resources referenced only by name can be removed by R8. With shrinking on, testing means **actually ringing an alarm in a release build**.
