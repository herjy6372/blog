---
title: Managing five access tiers with one UserRole enum
description: How I kept "who can use what" in one place as features grew, by moving the role-to-feature mapping into enum getters in the model layer.
date: 2026-11-26
category: security
project: mytodo
order: 1
draft: true
---

## The problem

My To-Do started as a to-do list, then grew a ledger, a mood log, cloud sync and announcements. Not every feature could be open to everyone:

- Cloud sync costs money, so only beta testers and admins should get it.
- Only admins should post announcements or change user tiers.
- Students under 14 need parental consent.

Once screens start writing `if (role == 'BETA' || role == 'ADMIN')`, every new feature means editing several screens, and missing one opens a hole.

## The tiers

| Tier | Features |
|---|---|
| Signed out | Support · alarms · settings |
| Normal | To-dos · stats · mood · ledger · timer · world clock · alarms · memos · themes · language |
| Student | Same as Normal (under 14; cannot be Beta or Pro) |
| Pro | Same as Normal |
| Beta | Normal + cloud sync |
| Admin | Everything + announcements · user management |

## Let the role answer the question

The key idea: **ask the role itself whether it can use a feature.** Dart's enhanced enums make this easy.

```dart
enum UserRole {
  admin('ADMIN', '관리자'),
  beta('BETA', '베타'),
  pro('PRO', '프로'),
  student('STUDENT', '학생'),
  normal('NORMAL', '일반');

  const UserRole(this.code, this.label);
  final String code;
  final String label;

  static UserRole fromCode(String? code) {
    for (final r in UserRole.values) {
      if (r.code == code) return r;
    }
    // Unknown codes fall back to normal
    return UserRole.normal;
  }

  /// Cloud sync — Beta and Admin only
  bool get canSync => this == UserRole.beta || this == UserRole.admin;

  /// Create, edit and delete announcements — Admin only
  bool get canEditAnnouncements => this == UserRole.admin;

  /// Change other users' tiers — Admin only
  bool get canManageUsers => this == UserRole.admin;
}
```

Screens no longer need to know tier names:

```dart
final showSync = loggedIn && role.canSync;
```

When version 1.6.1 opened mood, ledger and themes to every tier, only the getters changed.

### Unknown values get the lowest privilege

`fromCode` returns `normal` for anything it doesn't recognise. In access control, **unknown should mean least privilege**. Defaulting the other way means one typo could make everyone an admin.

## The app's check is not security

The app runs on the user's device, so **anyone can modify it**. Hiding a button is UX; what actually protects data is the server's rules. The Firestore rules mirror the same decision, and a comment ties `canSync()` to the app's `canSync`.

```js
// Tiers allowed to back up and restore: BETA or ADMIN (same as the app's canSync)
function canSync() {
  return isLoggedIn() && (userRole() == 'BETA' || userRole() == 'ADMIN');
}
```

### Don't let users promote themselves

During a review I found a gap: users can edit their own `users/{uid}` document, and that document holds the `role` field. A modified app could set its own role to `ADMIN` — a **privilege escalation**.

The rule now lets users edit their own document but only keep their role or drop to `NORMAL`, and a disabled account cannot re-enable itself.

```js
allow update: if isAdmin() || (
  isOwner(uid) &&
  resource.data.get('disabled', false) == false &&
  request.resource.data.get('disabled', false) == false &&
  (
    request.resource.data.role == resource.data.role ||
    request.resource.data.role == 'NORMAL'
  )
);
```

## Takeaways

- Keep the role-to-feature mapping in **one place**. Enum getters are the lightest way to do that in Dart.
- App-side checks are for the UI; **server rules** protect the data. Naming them the same makes them easy to change together.
- If a user-writable document contains a permission field, check that the **rules lock that field down**.
