# Jobs Feature — Setup Guide

Admin-only feature: an admin "Jobs" section that pulls listings daily from four free, keyless job board APIs (Remotive, RemoteOK, Arbeitnow, Jobicy), filters them against criteria you set, runs a free AI pass (Groq) to drop irrelevant/spam listings, and dedupes so you never see the same posting twice. Nothing is shown on the public site.

## 1. Get your free Groq API key (for AI filtering)

1. Go to https://console.groq.com and sign up (free).
2. Go to **API Keys** → **Create API Key**.
3. Copy it.
4. In `server/.env`, set:
   ```
   GROQ_API_KEY=your_key_here
   ```

If you skip this, the feature still works — it just skips the AI relevance pass and keeps everything that matched your keyword criteria (no smart filtering, but no extra junk removed either).

## 2. Generate a cron secret

This is a separate secret from your admin login — it's what the daily automated trigger uses to call your server, since that's a machine calling the API, not you logging in.

Generate one (any long random string works):
```bash
openssl rand -hex 32
```

Put it in `server/.env`:
```
JOB_CRON_SECRET=the_random_string_you_generated
```

## 3. Deploy your backend to Render

(You're already planning this — just make sure both `GROQ_API_KEY` and `JOB_CRON_SECRET` are set as environment variables in your Render service's dashboard, same as your other env vars like `MONGO_URI` and `JWT_SECRET`.)

Note your deployed backend URL, e.g. `https://your-app.onrender.com`.

## 4. Two different schedulers for two different situations

There are actually **two separate mechanisms** in this project, and they solve different problems:

### A) The local/always-on scheduler (automatic, works right now on localhost)
As of this update, the server itself checks every 30 seconds whether the current time matches the "Daily Schedule" time you set in **Jobs → Settings**, and if so, runs the fetch automatically — **as long as your `npm run dev` process keeps running**. This is what makes testing on localhost actually work: start your server, set a schedule time a couple minutes in the future, leave the terminal running, and watch it fire.

Important details:
- The time you set in **Jobs → Settings** is interpreted in the timezone set by `JOB_SCHEDULE_TIMEZONE` in your `.env` (defaults to UTC if not set — add `JOB_SCHEDULE_TIMEZONE=Asia/Karachi` to get Pakistan time).
- This only fires while the Node process is actually running and awake. If you stop the server, or later deploy to Render's free tier where it sleeps after 15 minutes idle, this timer simply can't fire while asleep — that's not a bug, it's just what "sleeping" means for a process.

### B) The GitHub Actions trigger (for when you deploy to a host that sleeps)
This is the `.github/workflows/daily-job-fetch.yml` + `/api/jobs-cron/run` endpoint described below. It exists specifically to solve the Render free-tier sleep problem, by having an external always-on service (GitHub's servers) wake your app and trigger the fetch.

**This cannot work against `localhost`** — GitHub's cloud runners have no network path to your own machine, so if you're not deployed anywhere publicly yet, this mechanism literally has nothing to reach. That's the actual reason nothing happened when you set a schedule and weren't connected to GitHub yet: it's not that the time was wrong, it's that this whole mechanism only makes sense once your backend has a public URL. Use scheduler (A) above for local testing instead.

Once you deploy to Render and push to GitHub, **both** schedulers will technically be active — the local one on Render only fires during the (sometimes long) windows the process happens to already be awake, and the GitHub Actions one is what reliably fires once daily regardless. You don't need to disable either; they call the same underlying pipeline and it's safe for both to exist.

## 5. Set up the GitHub Actions daily trigger (once you're deployed)

This is what wakes your sleeping Render free-tier service and runs the job fetch — one mechanism solves both problems.

The workflow file is already in your repo at `.github/workflows/daily-job-fetch.yml`. You just need to:

1. **Push this repo to GitHub** (if you haven't already).
2. In your GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret**, and add two secrets:
   - `RENDER_API_URL` → your backend's URL, e.g. `https://your-app.onrender.com` (no trailing slash)
   - `JOB_CRON_SECRET` → the exact same value you put in `server/.env`
3. Open `.github/workflows/daily-job-fetch.yml` and edit the cron time to match when you want it to run. GitHub Actions cron is always in **UTC**, so convert your local time:
   ```yaml
   - cron: '0 9 * * *'   # 09:00 UTC
   ```
   Example: if you want it to run at 9:00 AM Pakistan time (UTC+5), that's 4:00 AM UTC:
   ```yaml
   - cron: '0 4 * * *'
   ```
4. Commit and push. That's it — GitHub will now run this automatically every day.

### Testing it without waiting a day
Go to your repo's **Actions** tab → **Daily Job Fetch** workflow → **Run workflow** button. This runs it immediately (the `workflow_dispatch` trigger already in the file enables this) so you can confirm it works before trusting the schedule.

### What actually happens on each run
1. GitHub's server sends one `POST` request to `https://your-app.onrender.com/api/jobs-cron/run` with your secret in a header.
2. If Render was asleep, this request wakes it (cold start takes ~30-50s — the `--max-time 90 --retry 3` in the workflow already accounts for this).
3. Your server verifies the secret, then runs the same pipeline as the "Run Now" button in the admin panel: fetch → filter by your criteria → dedupe → AI pass → save new jobs.

## 6. Set your criteria

In the admin panel, go to **Jobs → Settings**: must-have keywords (hard filter), nice-to-have keywords (AI boost, doesn't exclude), exclude keywords, blocked companies, remote/on-site/both, location filters (country required, state and city optional — a job matches if it satisfies any one of your saved location rows), which sources to use, and your preferred daily time.

You can also block a company directly from a job card in **Jobs → Listings** — it hides all their current listings and adds them to your blocklist for future fetches.

## 7. Optional: get notified via Telegram

Free, no business verification needed (unlike WhatsApp's Business API — see note below on why Telegram was used instead).

1. Open Telegram, search for **@BotFather**, send `/newbot`, follow the prompts. You'll get a bot token.
2. Message your new bot anything (so it can see your chat), then visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser — find `"chat":{"id":...}` in the response, that's your chat ID.
3. Add both to `server/.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```
4. Leave both blank to skip notifications entirely — everything else still works.

**Why not WhatsApp?** WhatsApp's Business Cloud API requires a dedicated business phone number (can't be your personal WhatsApp), Meta Business verification, and only a limited number of free "service conversations" per month before per-message billing applies. Telegram has none of that friction and is unconditionally free, which is why notifications are built on Telegram. If you specifically want WhatsApp despite the setup overhead, let me know and it can be added as an alternative.

## 8. Optional: use Gemini instead of Groq

Every AI feature in this project (job filtering, Ask About My Work, AI project drafting) goes through one shared client, switchable via `AI_PROVIDER` in `server/.env`:
```
AI_PROVIDER=groq    # or "gemini"
```
If you set it to `gemini`, also set `GEMINI_API_KEY` (free from https://aistudio.google.com). This is useful if you want to spread usage across two separate free quotas, or if one provider's free tier runs low.

## 9. Share Access (Option B — read-only guest links)

From **Jobs → Share Access**, create a link with an optional label, optional expiry (in days), and an optional passcode. Copy the generated link and send it to whoever you want to see your job listings — they don't need an account or login. The link:
- Is completely read-only — no edit, delete, status-change, or Run Now capability
- Has zero access to any other admin section (Posts, Site Content, Messages, etc.)
- Can be revoked instantly from the same screen
- Shows you a view count and last-viewed time

## 10. Using it day-to-day

**Jobs → Listings** tab: filter by status (New / Interested / Applied / Rejected / Hidden), open the original posting, move a job through your pipeline, or delete it. Use the **Run Now** button any time to fetch immediately instead of waiting for the daily schedule.
