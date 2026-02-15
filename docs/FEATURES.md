# Features overview

GitStrength is split into **widget generators** (for your README) and **GitHub tools** (interactive, sign-in required).

---

## Widget generators

These produce **image URLs** you can embed in your GitHub profile or README. No sign-in required to generate or use the URLs.

### GitHub Streak Card

- **Route:** `/streak`
- **What it does:** Builds an SVG card with:
  - Current contribution streak and longest streak
  - Total contributions (all-time and this year)
  - Top languages (from public repos)
  - Optional embedded avatar
- **Output:** Image URL for `/api/card` or `/api/card-with-avatar` with optional `theme` for colors.
- **Use case:** Make your profile README stand out with a single, up-to-date stats card.

### Skill Set Widget

- **Route:** `/skill-set`
- **What it does:** Builds an SVG badge-style card listing your skills (e.g. TypeScript, React, Node.js). Icons from [Simple Icons](https://simpleicons.org/).
- **Output:** Image URL for `/api/skill-set-card` with `skills` and optional `theme`.
- **Use case:** Show your tech stack in your README or profile.

---

## GitHub tools

These are **interactive** and require **sign-in with GitHub** (OAuth).

### Followers Check

- **Route:** `/followers-check`
- **What it does:**
  - **Unfollowers** – People you follow who don’t follow you back
  - **Not mutuals** – Same as unfollowers; you can follow them from the app
  - **Followers / Following** – Full lists with search and filters
  - **Whitelist** – Users to hide from “unfollowers” (stored in browser)
  - **Actions:** Follow / Unfollow (and bulk) using GitHub API
- **Requirements:** GitHub OAuth with `read:user` and `user:follow` scopes.
- **Use case:** Clean up your following list and see who’s not following back.

---

## Summary

| Feature | Auth | Output / purpose |
|--------|------|-------------------|
| Streak card | No | SVG URL for README |
| Skill set | No | SVG URL for README |
| Followers check | Yes | Interactive lists and follow/unfollow |

For more product ideas (e.g. engagement tracking, repo cards), see [RECOMMENDED_CATEGORIES.md](RECOMMENDED_CATEGORIES.md).
