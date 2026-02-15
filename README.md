# GitStrength – GitHub README Widgets & Profile Tools

Make your **GitHub profile** beautiful and attractive with README widgets. Free **streak cards**, **skill set** badges, and **followers check**—open source, self-hosted. Deploy on Netlify or Vercel.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Features

### Widget generators (for your README)

- **GitHub Streak Card** – Current streak, longest streak, total contributions, top languages, and profile stats in one SVG card (with or without avatar).
- **Skill Set Widget** – Badge-style card for your tech stack (icons from [Simple Icons](https://simpleicons.org/)).
- **Themes** – Preset themes and custom colors via query params. API-first: all cards are served as SVG; no auth required for public card URLs.

### GitHub tools (sign in with GitHub)

- **Followers Check** – See unfollowers, not mutuals, followers, following. Whitelist users, follow/unfollow from the app. Requires GitHub OAuth.

---

## Live demo

**[Open the app →](https://gitstrength.netlify.app)**

| Page | Description |
|------|-------------|
| **/** | Home – Continue with GitHub to get started |
| **/streak** | Streak card generator – Enter username, customize theme, copy image URL for README |
| **/skill-set** | Skill set widget – Add skills, pick theme, copy image URL |
| **/followers-check** | Followers tool – Unfollowers, not mutuals, follow/unfollow (requires sign-in) |

---

## Quick start

```bash
git clone https://github.com/web2and3/gitstrength-github-improver.git
cd gitstrength-github-improver
pnpm install
cp .env.example .env
# Edit .env: add GITHUB_ID, GITHUB_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL (see docs/SETUP.md)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Documentation

| Doc | Description |
|-----|-------------|
| [**Setup**](docs/SETUP.md) | Local development, environment variables |
| [**Deployment**](docs/DEPLOYMENT.md) | Netlify & Vercel, production env |
| [**API reference**](docs/API.md) | Card and data endpoints |
| [**Features**](docs/FEATURES.md) | Overview of widgets and tools |
| [**Contributing**](docs/CONTRIBUTING.md) | How to contribute |
| [**Recommended categories**](docs/RECOMMENDED_CATEGORIES.md) | Ideas for new widgets/tools |

---

## Use in your README

Replace `YOUR_DEPLOYMENT_URL` with your deployed base URL (e.g. `https://gitstrength.netlify.app`).

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
<img src="YOUR_DEPLOYMENT_URL/api/card?username=YOUR_GITHUB_USERNAME&theme=%7B%22backgroundColor%22%3A%22%230f172a%22%2C%22textColor%22%3A%22%23e2e8f0%22%2C%22accentColor%22%3A%220ea5e9%22%7D" alt="GitHub Streak Card" width="100%" />
```

### Skill set widget

```markdown
<img src="YOUR_DEPLOYMENT_URL/api/skill-set-card?skills=TypeScript,React,Next.js,Node.js,Tailwind%20CSS" alt="Skill Set" width="100%" />
```

---

## API overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/card` | GET | Streak card SVG (no avatar) |
| `/api/card-with-avatar` | GET | Streak card SVG (with avatar) |
| `/api/streak` | GET | JSON streak + profile data |
| `/api/skill-set-card` | GET | Skill set SVG |
| `/api/github-contributions` | POST | Contribution/streak data (used internally) |

See [docs/API.md](docs/API.md) for query parameters and response formats.

---

## Deploy

- **Netlify:** Connect repo, build command `pnpm build` (or `npm run build`), publish `.next`. Use [@netlify/plugin-nextjs](https://docs.netlify.com/frameworks/next-js/). Set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your site URL.
- **Vercel:** Connect repo; Next.js is detected. Set env vars in the dashboard.

Details: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS**
- **NextAuth.js** (GitHub OAuth), **Radix UI**, **Lucide** icons

---

## License

MIT © [web2and3](https://github.com/web2and3)
