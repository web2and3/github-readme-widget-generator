# Deployment

Deploy GitStrength to Netlify or Vercel.

## Netlify

1. **Connect repository**  
   Link your Git repo in the Netlify dashboard.

2. **Build settings**
   - **Build command:** `pnpm build` or `npm run build`
   - **Publish directory:** `.next`
   - **Base directory:** (leave empty unless monorepo)

3. **Plugin**  
   Netlify should use the Next.js plugin. Ensure `netlify.toml` contains:

   ```toml
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

4. **Environment variables** (Site settings → Environment variables)

   | Variable | Value | Notes |
   |----------|--------|--------|
   | `GITHUB_ID` | Your OAuth Client ID | From GitHub OAuth App |
   | `GITHUB_SECRET` | Your OAuth Client Secret | Secret |
   | `NEXTAUTH_SECRET` | Random string | e.g. `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://your-site.netlify.app` | Your Netlify site URL |
   | `NEXT_PUBLIC_APP_URL` | `https://your-site.netlify.app` | Same as `NEXTAUTH_URL` (for copy-README links, sitemap, SEO) |

5. **GitHub OAuth callback**  
   In the GitHub OAuth App, set **Authorization callback URL** to:
   `https://your-site.netlify.app/api/auth/callback/github`

---

## Vercel

1. **Import project**  
   Import the repo; Vercel detects Next.js.

2. **Build**  
   Default build command is `next build` (or `pnpm build` / `npm run build`). No need to set publish directory.

3. **Environment variables** (Project → Settings → Environment Variables)

   Set the same variables as in the Netlify table above. Use your Vercel URL for `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` (e.g. `https://your-project.vercel.app`).

4. **GitHub OAuth callback**  
   Set **Authorization callback URL** to:
   `https://your-project.vercel.app/api/auth/callback/github`

---

## Post-deploy

- Visit `/` and try “Continue with GitHub” and `/followers-check` to confirm auth.
- Visit `/streak` and generate a card; use “Copy README” and paste in a repo README to confirm the image URL uses your `NEXT_PUBLIC_APP_URL`.
- Submit `https://your-domain.com/sitemap.xml` in Google Search Console if you care about SEO.
