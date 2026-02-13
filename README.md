# GitHub Readme Widgets Generator
Generate SVG cards for your **GitHub contribution streak** and **skill set** to use in your profile or README. Self-hosted, customizable themes, deploy on Netlify or Vercel.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Features

- **GitHub Streak Card** – Current streak, longest streak, total contributions, top languages, and profile stats in one card (with or without avatar).
- **Skill Set Widget** – Badge-style card for your tech stack (skills from [Simple Icons](https://simpleicons.org/)).
- **Themes** – Preset themes (dark, ocean, sunset, forest, purple) and custom colors via query params.
- **API-first** – All cards are served as SVG from GET endpoints; no auth required.

---

## Live Demo

**[Open the generator →](https://github-readme-widget-generator.netlify.app)**

- **Streak card:** `/streak` — Enter a GitHub username, customize theme, copy the image URL for your README.
- **Skill set:** `/skill-set` — Add skills (comma-separated), pick a theme, copy the image URL.

---

## Quick Start

```bash
git clone https://github.com/your-username/GitHub-Streak-Card.git
cd GitHub-Streak-Card
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to the streak card generator.

---

## Use in Your README

Replace `YOUR_DEPLOYMENT_URL` with your deployed base URL (e.g. `https://github-readme-widget-generator.netlify.app`).

### Streak card (no avatar)

```markdown
<img src="YOUR_DEPLOYMENT_URL/api/card?username=YOUR_GITHUB_USERNAME" alt="GitHub Streak Card" width="100%" />
```

### Streak card (with avatar)

```markdown
<img src="YOUR_DEPLOYMENT_URL/api/card-with-avatar?username=YOUR_GITHUB_USERNAME" alt="GitHub Streak Card" width="100%" />
```

### Custom theme (JSON, URL-encoded)

```markdown
<img src="YOUR_DEPLOYMENT_URL/api/card?username=YOUR_GITHUB_USERNAME&theme=%7B%22backgroundColor%22%3A%22%230f172a%22%2C%22textColor%22%3A%22%23e2e8f0%22%2C%22accentColor%22%3A%22%230ea5e9%22%7D" alt="GitHub Streak Card" width="100%" />
```

### Skill set widget

```markdown
<img src="YOUR_DEPLOYMENT_URL/api/skill-set-card?skills=TypeScript,React,Next.js,Node.js,Tailwind CSS" alt="Skill Set" width="100%" />
```

With theme (optional):

```markdown
<img src="YOUR_DEPLOYMENT_URL/api/skill-set-card?skills=TypeScript,React&theme=%7B%22backgroundColor%22%3A%22%231a1b27%22%2C%22textColor%22%3A%22%23e2e8f0%22%7D" alt="Skill Set" width="100%" />
```

---

## API Reference

| Endpoint | Method | Query params | Returns |
|----------|--------|--------------|---------|
| `/api/card` | GET | `username` (required), `theme` (optional, JSON string) | SVG image |
| `/api/card-with-avatar` | GET | `username` (required), `theme` (optional) | SVG image |
| `/api/streak` | GET | `username` (required) | JSON (streak + profile data) |
| `/api/skill-set-card` | GET | `skills` (required, comma-separated), `theme` (optional), `username` (optional) | SVG image |

All card endpoints return **SVG** with `Content-Type: image/svg+xml`. They are forced dynamic and use `Cache-Control: no-store` so query parameters are respected on Netlify.

---

## Deploy (Netlify)

1. Connect this repo to [Netlify](https://www.netlify.com/).
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Ensure **@netlify/plugin-nextjs** is used (add to `netlify.toml` if needed).

Example `netlify.toml` (already in the repo):

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Set `NEXT_PUBLIC_APP_URL` to your Netlify URL (e.g. `https://your-site.netlify.app`) so “Copy README” links use the correct base URL.

---

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**, **TypeScript**, **Tailwind CSS**
- **Radix UI**, **Lucide** icons

---

## License

MIT © [web2and3](https://github.com/web2and3)
