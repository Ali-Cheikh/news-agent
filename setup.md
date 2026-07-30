
// ─────────────────────────────────────────────────────────────────
"Setup": `REPO STRUCTURE (create these files exactly)
══════════════════════════════════════════

your-repo/
├── index.js
├── package.json
└── .github/
    ├── dependabot.yml
    └── workflows/
        └── daily-digest.yml

digests/ folder is auto-created on first run.


STEP 1 — Create the repo
  github.com → New repository → push these 4 files

STEP 2 — Add your Gemini API key
  → aistudio.google.com → Get API key (free, no card)
  → GitHub repo → Settings → Secrets → Actions → New secret
  ┌─────────────────┬─────────────────────────────────┐
  │ GEMINI_API_KEY  │  AIza...  (required)             │
  │ RESEND_API_KEY  │  re_...   (optional — email)     │
  │ EMAIL_TO        │  you@email.com  (optional)       │
  └─────────────────┴─────────────────────────────────┘

STEP 3 — Enable Actions
  → Actions tab → "I understand my workflows" → Enable

STEP 4 — Test immediately (don't wait for 8 AM)
  → Actions → "Daily Tech Digest" → Run workflow ▶

STEP 5 — Dependabot wires itself
  → After push, GitHub detects .github/dependabot.yml
  → Next Monday: auto-PRs appear for outdated packages
  → Merge or ignore — it's that simple

WHAT HAPPENS DAILY AT 08:00 UTC
  1. GitHub Actions spins up runner
  2. index.js fetches 10 RSS feeds (last 48h)
  3. Gemini 2.5 Flash filters to top 10–15 stories
  4. HTML email sent (if RESEND_API_KEY set)
  5. digests/2026-07-29.md committed to repo
  6. digests/README.md archive index updated
  7. Runner shuts down

COST
  Gemini 2.5 Flash  →  free  (1,500 req/day)
  RSS feeds         →  free  (no API key)
  GitHub Actions    →  free  (2,000 min/month)
  Resend email      →  free  (3,000 emails/month)
  ────────────────────────────────
  Total             →  $0 / month

CRON OPTIONS  (change in daily-digest.yml)
  '0 8 * * *'      8 AM UTC daily       ← default
  '0 6 * * 1-5'    6 AM weekdays only
  '0 8 * * 1'      8 AM Mondays only    (weekly digest)
  '0 8,20 * * *'   twice a day`
};