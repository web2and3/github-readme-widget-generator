# Local setup

Run GitStrength on your machine for development.

## Prerequisites

- **Node.js** 18+ (recommend 20+)
- **pnpm** (or npm/yarn)

## Steps

1. **Clone and install**

   ```bash
   git clone https://github.com/web2and3/gitstrength-github-improver.git
   cd gitstrength-github-improver
   pnpm install
   ```

2. **Environment variables**

   Copy the example env file and fill in values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `GITHUB_ID` | Yes (for sign-in & Followers Check) | GitHub OAuth App **Client ID**. Create at [GitHub OAuth Apps](https://github.com/settings/developers). |
   | `GITHUB_SECRET` | Yes (for sign-in & Followers Check) | GitHub OAuth App **Client Secret**. |
   | `NEXTAUTH_SECRET` | Yes | Random string for NextAuth. Generate: `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | Yes | App URL. Local: `http://localhost:3000` |
   | `NEXT_PUBLIC_APP_URL` | Optional | Same as `NEXTAUTH_URL` for local; in production set to your public URL (used for “Copy README” links and sitemap). |

   **GitHub OAuth:** In your OAuth App settings set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github` (or your `NEXTAUTH_URL` + `/api/auth/callback/github`).

3. **Run dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build locally |
| `pnpm lint` | Run ESLint |

## Without GitHub OAuth

You can run the app without `GITHUB_ID` / `GITHUB_SECRET`. The **Streak Card** and **Skill Set** generators and all public card APIs work. **Followers Check** and “Continue with GitHub” on the home page require a valid GitHub OAuth app.
