---
title: Cutting install size by 38% with R8 and Dart obfuscation
description: A Play Console optimization warning led me to enable R8 shrinking and Dart obfuscation, taking the fresh install size from 19.7 MB to 12.1 MB.
date: 2026-11-26
category: deploy
project: mytodo
order: 2
draft: false
---

## The problem

After uploading My To-Do, Play Console showed a warning:

> DEX code below the optimization threshold (2% obfuscated)

The fresh install size was 19.7 MB, large for what the app does. Nothing was broken, but size affects installs, and unobfuscated code shows its internals to anyone who looks.

## The cause

Shrinking and obfuscation were off for release builds. A Flutter app ships two kinds of code:

- **Java/Kotlin** (the engine's Android side and plugins) → handled by Android's **R8**
- **Dart** (the app itself) → handled by Flutter's `--obfuscate`

Turning on only one is half the job.

## Fix 1: enable R8

```kotlin
buildTypes {
    release {
        // R8: remove unused code and resources, obfuscate Java/Kotlin
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro",
        )
    }
}
```

### Keep only what uses reflection

R8 removes code that looks unused and renames the rest. Code found through reflection breaks when that happens. Most Flutter plugins ship their own rules, so I only added `keep` rules for the one that needed them here: `flutter_local_notifications`, which stores scheduled notifications with Gson.

```proguard
# flutter_local_notifications: stores scheduled notifications with Gson (needs generic type info)
-keep class com.dexterous.** { *; }
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken

# Keep line numbers in crash reports, hide original file names
-keepattributes LineNumberTable
-renamesourcefileattribute SourceFile
```

Then I tested with a **release build**: schedule a notification, restart the app, and check it still fires. Debug builds don't run R8, so they never show these problems.

## Fix 2: obfuscate Dart

```bash
flutter build appbundle --release \
  --obfuscate \
  --split-debug-info=symbols/
```

`--split-debug-info` moves debug info out of the app, but **without those symbol files you can't read obfuscated stack traces.**

- Symbols are kept per version **outside** the repository and listed in `.gitignore`; publishing them would undo the obfuscation.
- The R8 mapping file and native debug symbols are included in the App Bundle so Play Console can decode crashes.

## Result

- The Play Console warning is gone.
- Fresh install size went from **19.7 MB to 12.1 MB**, about 38% smaller (v1.6.2).

## Takeaways

- Obfuscation raises the cost of analysis; it does not hide secrets. API keys don't belong in the app at all.
- R8 issues only show up in release builds. Retest anything that uses reflection (scheduled notifications, JSON serialization) **in release**.
- Symbol files are an operational asset, not a build by-product. Keep them with each version.
