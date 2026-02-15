# API reference

Public and internal APIs used by GitStrength.

## Card endpoints (SVG)

All card endpoints return **SVG** with `Content-Type: image/svg+xml`. They are dynamic; responses are not cached long-term so query params are respected.

---

### GET `/api/card`

Streak card **without** avatar.

| Query param | Required | Description |
|-------------|----------|-------------|
| `username` | Yes | GitHub username (case-insensitive) |
| `theme` | No | JSON object, URL-encoded. Keys: `backgroundColor`, `textColor`, `accentColor`, etc. |

**Example**

```
GET /api/card?username=torvalds
GET /api/card?username=torvalds&theme=%7B%22backgroundColor%22%3A%22%230f172a%22%2C%22textColor%22%3A%22%23e2e8f0%22%7D
```

---

### GET `/api/card-with-avatar`

Streak card **with** embedded avatar image.

| Query param | Required | Description |
|-------------|----------|-------------|
| `username` | Yes | GitHub username |
| `theme` | No | Same as `/api/card` |

**Example**

```
GET /api/card-with-avatar?username=torvalds
```

---

### GET `/api/skill-set-card`

Skill set widget SVG.

| Query param | Required | Description |
|-------------|----------|-------------|
| `skills` | Yes | Comma-separated list (e.g. `TypeScript,React,Next.js`). Spaces in names allowed (e.g. `Tailwind CSS`). |
| `theme` | No | JSON, URL-encoded. e.g. `backgroundColor`, `textColor` |
| `username` | No | If provided, can be used for branding or link |

**Example**

```
GET /api/skill-set-card?skills=TypeScript,React,Node.js
```

---

## Data endpoints (JSON)

---

### GET `/api/streak`

Streak and profile data for a user (used by the streak card generator).

| Query param | Required | Description |
|-------------|----------|-------------|
| `username` | Yes | GitHub username |

**Response (success)**  
JSON with fields such as: `username`, `totalContributions`, `contributionsThisYear`, `currentStreak`, `longestStreak`, `streakStartDate`, `longestStreakStart`, `longestStreakEnd`, `languages`, `stargazersCount`, `forksCount`, `avatarUrl`, etc.

**Response (error)**  
`{ "error": "User not found" }` or similar with HTTP 4xx/5xx.

---

### POST `/api/github-contributions`

Internal endpoint used to fetch contribution and streak data. Accepts JSON body with `username`. Returns a slim payload (e.g. `totalContributions`, `currentStreak`, `longestStreak`, `dataSource`) rather than the full contribution array. Used by the app; not required for README embed URLs.

---

## Auth and tools

- **Followers Check** uses authenticated API routes (e.g. `/api/followers-check`, `/api/followers-check/follow`) that require a valid NextAuth session (GitHub OAuth). Not documented as public REST APIs; use the web UI.

---

## Caching and limits

- Card endpoints: `Cache-Control` is set to avoid long-term caching so theme and username changes take effect.
- GitHub API: The app respects GitHub rate limits; unauthenticated requests are limited. For heavy use, consider deploying your own instance.
