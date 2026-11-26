---
title: Why Google sign-in worked in debug but failed in the store build
description: Play App Signing changed the SHA-1 fingerprint of the distributed app, breaking Firebase Google sign-in. Plus notes on migrating to google_sign_in v7.
date: 2026-11-26
category: deploy
project: bible-praise
order: 4
draft: true
---

## The problem

After putting Bible & Hymns (then called Church Hymnal) into Play closed testing, testers reported that Google sign-in failed. Debug builds worked, and so did release builds I built myself. Only the **app installed from Play** failed:

```text
clientConfigurationError
Account reauth failed
```

## The cause: Play re-signs your app

Android apps prove who made them with a signing certificate, and Firebase Google sign-in only works when the app's **SHA-1 fingerprint** is registered.

Play uses **Play App Signing**:

1. You upload an AAB signed with your **upload key**.
2. Google verifies it, then re-signs the APKs users get with an **app signing key Google keeps**.

So the SHA-1 on users' devices is **different** from my key's. Firebase only knew mine, so the store build looked like a stranger.

## The fix

1. In Play Console → **App integrity → App signing**, copy the SHA-1 of the *app signing key certificate*.
2. In Firebase → Project settings → the Android app, **add** that SHA-1. (Keep the upload key's SHA-1 too, for testing your own release builds.)
3. Download a fresh `google-services.json` and rebuild.

> Three fingerprints to register: debug key, upload key, Play app signing key.

## Bonus: migrating to google_sign_in v7

Around the same time, upgrading `google_sign_in` to v7 broke the build: the `GoogleSignIn()` constructor and `accessToken` were removed in favour of a singleton. Firebase only needs the `idToken`:

```dart
// v7
await GoogleSignIn.instance.initialize(
  clientId: '...',
  serverClientId: '...',
);
final googleUser = await GoogleSignIn.instance.authenticate();
final credential = GoogleAuthProvider.credential(
  idToken: googleUser.authentication.idToken,
);
```

## Takeaways

- “Works on my device” proves little: a store build can be **signed differently**.
- Closed testing exists to catch this before launch. Test anything that depends on signing **with the app installed from the store**.
- Signing keys and keystore passwords stay out of the repository, in a git-ignored file such as `key.properties`.
