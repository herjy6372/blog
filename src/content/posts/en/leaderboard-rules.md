---
title: Stopping fake scores in a no-login web game with anonymous auth and Firestore rules
description: Protecting the card-flip game's live leaderboard with Firebase anonymous auth and server rules, and being clear about what a free plan can and can't stop.
date: 2026-11-26
category: security
project: card-flip
order: 9
draft: false
---

## Background

Heart-Pounding Card Flip is a web mini-game I built with ChatGPT Codex during a 2026 Gyeongbuk Game Development Academy course. It has **live leaderboards** per difficulty, and you start playing without signing in.

A leaderboard with no login is the easiest thing to tamper with: open the browser dev tools and you can craft the score request yourself.

## Threats

1. **Impossible scores**: more than 50 rounds could ever give, or a game finished in zero seconds
2. **Spam**: flooding the board with rapid submissions
3. **Editing or deleting other people's records**

## 1. Anonymous auth: know who sent it

Firebase **anonymous auth** gives each browser a unique `uid` without asking for anything. That lets the rules use `request.auth.uid` to:

- reject unauthenticated requests, and
- store the author's `uid` so people can only touch **their own** records.

## 2. Consistency checks in server rules

The game's own limits move into the rules: time limits per difficulty, how rounds relate to score, the maximum time bonus. Records that exceed **limits derived from the game design** are not saved.

```js
// Concept example: the real fields and values follow the game's repository.
allow create: if request.auth != null &&
  request.resource.data.uid == request.auth.uid &&
  request.resource.data.score is int &&
  request.resource.data.score >= 0 &&
  request.resource.data.score <= maxScore(request.resource.data.difficulty) &&
  request.resource.data.createdAt == request.time;
```

## 3. Submission rate limits

Server rules check the **interval between submissions** and reject ones that come too fast. On the client:

- Records are **kept locally first** and synced when the connection returns.
- **Duplicate submissions** of the same record are blocked.

## Write down what you can't stop

The free (Spark) plan has no Cloud Functions, so there's no server-side **replay of the game** to verify a run. Rules alone can't catch **made-up scores that stay within plausible limits**.

That limitation is stated in the portfolio and here. In security, saying exactly **how far your protection goes** matters more than claiming you stopped everything.

## Takeaways

- Even without login, **anonymous auth** gives the rules an identity to work with.
- **Limits from the game design** become validation conditions in the rules.
- Separate what a free plan can stop from what it can't, and **state the gaps**.
