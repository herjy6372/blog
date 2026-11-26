---
title: Adding membership to a serverless static site with GitHub Pages and Firebase
description: How a church website on GitHub Pages got a members-only area and a no-login sign-up form using Firebase Auth and Firestore, protected by security rules.
date: 2026-11-26
category: security
project: church-website
order: 5
draft: false
---

## Why a static site needed membership

The church website is mostly service times, history and a photo album, so static HTML/CSS/JS was enough: no server, little cost, little to maintain. Two things didn't fit:

1. A **members-only area**: sign up → admin approval → a tier (pastor, deacon, youth)
2. A **tester sign-up form** for the Bible & Hymns app: Google account, name and phone number

## Structure: static pages + Firebase

- Every page is static HTML on GitHub Pages.
- Only login, sign-up, my-page and admin use **Firebase Auth and Firestore**.
- `auth-nav.js` just swaps the menu between “Log in” and “Members”.

One important fact: **the Firebase config, API key included, is visible in the page source.** A web Firebase key is an identifier, not a secret. What protects the data is not hiding the key but the **Firestore security rules**.

## Rules for a no-login form

The tester form had to work without signing in. A collection anyone can write to is the riskiest part of the system, so the rules are tight:

- **Create only.** Only admins can read, update or delete.
- **The document ID is the lower-cased email.** Writing again with the same account becomes an `update` and is rejected, so each account can apply once.
- **Whitelisted fields only.**
- **Format checks**: email and phone by regex, name 1–30 characters, consent required.
- **Status must be `pending`** and the timestamp must be the **server time**, so applicants can't mark themselves approved.

The skeleton looks like this (the real fields and regexes live in the site's repository):

```js
match /testerRequests/{email} {
  allow create: if
    email == request.resource.data.email.lower() &&
    request.resource.data.keys().hasOnly(['email', 'name', 'phone', 'consent', 'status', 'createdAt']) &&
    request.resource.data.consent == true &&
    request.resource.data.status == 'pending' &&
    request.resource.data.createdAt == request.time;
  allow read, update, delete: if isAdmin();
}
```

I verified the whole path — submit, appear in the admin list, delete — and added a note to delete applications after testing ends.

### Who is the first admin?

“Only admins can appoint admins” leaves no way to create the first one. The first admin is set **by hand in the Firebase console** (a bootstrap); after that, only existing admins can appoint new ones.

## Privacy and visibility

The site holds about 1,225 photos of real members, so **who can see it** mattered more than technical polish.

- Photos are resized for the web (~1600 px) before upload and organised by year and event.
- An image-upload board would need Firebase Storage on a paid plan, so it was left out. Fewer features can mean less personal data handled.
- The site's visibility is reviewed regularly, and its code is not public, even in the portfolio.

## Takeaways

- A static site can get **lightweight membership**. With no server code, the **security rules are the backend**.
- Collections writable without login should allow create only, whitelist fields and validate values.
- A web Firebase API key can't be hidden and doesn't need to be. The rules are what you protect.
