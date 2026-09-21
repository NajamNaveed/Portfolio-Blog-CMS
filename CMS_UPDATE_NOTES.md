# CMS Conversion & Redesign — What Changed

## 1. Setup (new steps only — your existing `.env` files still work)

```bash
# Backend
cd server
npm install
npm run seed            # creates your admin user (if not already done)
npm run seed:content    # NEW — migrates your old hardcoded hero/about/skills/projects into the CMS
npm run dev

# Frontend
cd client
npm install              # picks up framer-motion, three.js, react-icons, etc.
npm run dev
```

No new environment variables are required. `npm run seed:content` is safe to run once — it skips seeding if `SiteContent` or `Project` documents already exist.

## 2. New backend (fully CMS-controlled)

| Model | Purpose | Public route | Admin routes |
|---|---|---|---|
| `SiteContent` (singleton) | Hero, About, Focus Areas, Skills, Social Links, Contact Info, Footer | `GET /api/site-content` | `GET/PUT /api/admin/site-content` |
| `Project` | Portfolio projects | `GET /api/projects`, `GET /api/projects/:slug` | full CRUD + publish/unpublish under `/api/admin/projects` |
| `Message` | Contact form submissions | `POST /api/contact` (rate-limited) | list/view/status/delete under `/api/admin/messages` |

All three follow the exact same `asyncHandler` / whitelist-validator / `protect`+`requireAdmin` middleware pattern as your existing `Post` model, so nothing about your auth flow, error handling, or existing Post CRUD changed.

## 3. New admin panel pages

- **Site Content** (`/admin/site-content`) — one form controlling literally every piece of text/link on the public site: hero headline & rotating role tags, About intro/approach/stats, the "What I Build" focus cards, the technology list (used by both the marquee and the 3D globe), social links, contact info, and footer tagline.
- **Projects** (`/admin/projects`) — create/edit/publish/delete projects, same UX as your Posts admin.
- **Messages** (`/admin/messages`) — inbox for contact form submissions.
- Dashboard now shows post/project/message counts.

## 4. Frontend redesign

- New dark theme built around `#12100F`, with a lime-green accent, Fraunces (display) + Inter (body) + JetBrains Mono (labels).
- Navbar: no logo — Home / About / Projects / Blogs, with a Contact CTA button on the right.
- New **Contact** page with a working form → `/api/contact`.
- Framer Motion throughout: staggered entrances, hover states, page transitions.
- Clicking a "What I Build" card or a Project card pops open an animated modal with more detail — nothing is a dead click anymore.
- About page includes an interactive **3D technology globe** (Three.js via react-three-fiber): icons distributed evenly on a sphere, auto-rotating, drag to spin freely, hover to highlight. Which technologies appear is fully controlled from the Site Content admin page.
- Home page has an animated tech marquee, rotating hero role text, and a real CTA banner.

## 5. Notes / things worth doing next

- The 3D globe's technology icons are matched from a curated list (`client/src/utils/iconMap.js`) for bundle-size reasons — Simple Icons has 3,400+ logos and importing all of them would bloat the build. If you add a technology whose icon isn't in that curated list, it falls back to a generic icon; add it to `iconMap.js` if you want the exact logo.
- `about.resumeUrl` in Site Content lets you link a hosted résumé PDF — leave blank to hide the download button.
## 6. Ask About My Work — usage limiting

Since there's no account system, the public "Ask about my work" widget limits usage per visitor by IP address, tracked in the database (not in-memory) so the limit survives server restarts and isn't reset by refreshing the page. Default is 15 questions/day per IP, configurable via `ASK_DAILY_LIMIT` in `server/.env`. This is deliberately simple (no CAPTCHA, no accounts, no added latency beyond one small DB lookup) — it won't stop someone determined to rotate IPs, but it stops casual abuse from burning through your AI provider's free quota, which is the realistic threat for a personal portfolio.

