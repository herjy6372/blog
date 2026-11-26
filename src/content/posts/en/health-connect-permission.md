---
title: "Why Health Connect kept denying access: a hidden permission in the plugin source"
description: Fixing health-data access that was denied even after users allowed it, by reading the health plugin's source — plus an iOS HealthKit entitlement issue and a world-readable Firestore collection.
date: 2026-11-26
category: native
project: routiny
order: 10
draft: true
---

## The problem

Routiny reads steps, distance and weight from Samsung Health and Apple Health. In the Play closed-testing build, users tapped **Allow all**, and the app still said:

> Access was denied.

## Cause 1: a permission I never asked for

Reading the `health` plugin's source showed that requesting `WORKOUT` makes the plugin **also request two more permissions internally**:

- `READ_DISTANCE`
- `READ_TOTAL_CALORIES_BURNED`

The calories permission wasn't in my manifest. If any requested permission isn't declared, Health Connect **rejects the whole request**, so whatever the user tapped, the answer was “denied”.

```xml
<uses-permission android:name="android.permission.health.READ_TOTAL_CALORIES_BURNED" />
```

## Cause 2: iOS-only data types

`DISTANCE_WALKING_RUNNING` and `DISTANCE_SWIMMING` are **HealthKit-only**, and querying them on Android threw. Data types are now split by platform:

- iOS: `DISTANCE_WALKING_RUNNING`, `DISTANCE_SWIMMING`
- Android: `DISTANCE_DELTA`, plus distance from swimming sessions

The screen merges both into the same shape.

## Polishing along the way

- If permissions are already granted, continue without a prompt.
- If Health Connect is missing or outdated, guide the user to install it.
- Auto-sync (on launch, on resume, every 15 minutes) runs in **silent mode**, never re-prompting.
- Play Console's **health permissions declaration** was updated so each permission's purpose matches the real feature.

## HealthKit failing on a real iPhone

It worked in the simulator but not on a device. `Runner.entitlements` existed but **wasn't linked** to the target's `CODE_SIGN_ENTITLEMENTS`, so the signed app lacked HealthKit. Linking it for Debug, Release and Profile put `com.apple.developer.healthkit` into the signed app.

## Bonus: a pre-publication security review

Before making the repository public, I found a bigger problem. For a signed-out “find my ID” feature, the `account_lookup` collection was open with `allow read: if true`. Firestore rules can't enforce “only when name and birth date match”, so **anyone with the public web API key could read every member's ID, email, name and birth date.**

On the free plan there are no server functions to return a masked ID, and names and birth dates are easy to guess, so hashing wouldn't fully protect them. So:

- The rules now allow **owner-only** reads and writes.
- “Find my ID” was removed, leaving **password-reset email**.
- New versions delete the user's old index document on sign-in.
- I confirmed that unauthenticated requests are **rejected with 403**.

## Takeaways

- When a permission problem makes no sense, read **the plugin source**. What you request and what is actually requested can differ.
- Declare only what you use, read-only — but reflect what plugins add across the **manifest, store declaration and privacy policy**.
- `allow read: if true` for one convenience feature can expose **every member**. Sometimes removing the feature is the safest fix.
