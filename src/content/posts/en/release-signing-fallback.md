---
title: "Pre-release self-audit: my release builds were signed with the debug key"
description: Findings from auditing My Recipe before closed testing — a silent debug-signing fallback, Firestore rules without field checks, and cached data left behind after sign-out.
date: 2026-11-26
category: security
project: my-recipe
order: 8
draft: true
---

## Why audit my own app

Before putting My Recipe into Play closed testing, I set aside time to **re-read everything for security and bugs**. Solo projects have no reviewer, so I read the code asking “where would an attacker look?”

## 1. Release builds silently signed with the debug key

### Finding

`android/app/build.gradle.kts` had this:

```kotlin
signingConfig = if (hasReleaseKey) {
    signingConfigs.getByName("release")
} else {
    // fall back to the debug key without key.properties (for convenience)
    signingConfigs.getByName("debug")
}
```

On a machine without `key.properties` (a new laptop, CI), a release build **didn't fail**; it produced a release app signed with the debug key. Debug keys are effectively public, so such an app proves nothing about who built it.

### Fix: make the silent failure loud

```kotlin
signingConfig = when {
    hasReleaseKey -> signingConfigs.getByName("release")
    project.hasProperty("allowDebugSigning") -> signingConfigs.getByName("debug")
    else -> throw GradleException(
        "key.properties is missing. Pass -PallowDebugSigning for a debug-signed build."
    )
}
```

> Tidied up to show the structure; the real code is in the repository's `build.gradle.kts`.

## 2. Firestore rules didn't check fields

The `users/{uid}` rule only checked ownership:

```js
allow read, write: if request.auth.uid == uid;
```

A modified app could write any field, up to 1 MB, into its own document. I rewrote it with `hasOnly()` and per-field type and size checks:

```js
allow write: if request.auth.uid == uid &&
  request.resource.data.keys().hasOnly(['photoBase64', 'birthDate', 'phoneNumber']) &&
  (!('photoBase64' in request.resource.data) || request.resource.data.photoBase64.size() < 200 * 1024) &&
  (!('phoneNumber' in request.resource.data) || request.resource.data.phoneNumber.size() <= 30);
```

> The real rule also checks types; this is a summary of its shape.

Deployed with `firebase deploy --only firestore:rules` and verified.

## 3. Previous user's data left on the device

`signOut()` signed out of Firebase and Google but left Firestore's **offline cache** intact, so the previous user's profile and favourites stayed on the device. Sign-out now also calls `terminate()` and `clearPersistence()`.

## Other fixes from the same pass

- Cancelling the account picker **closed the login screen as if signed in** → the sign-in function now returns a `bool`
- Corrupt profile photo data **crashed the whole page** → fall back to a default avatar
- Favourites **spun forever** when signed out → emit an empty list instead of an empty stream

## Takeaways

- “Convenience” settings become dangerous when they **quietly apply on the release path**. Default to failure; make exceptions explicit.
- Ownership checks aren't enough: rules should check **which fields, and how big**.
- Signing out means **cleaning up data on the device**, not just ending the session.
