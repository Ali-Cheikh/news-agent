# Setup Guide — Nosey

Nosey is the nosy AI that pokes into your RSS feeds and serves up a daily digest.  
This guide shows exactly how to set it up, customize it, and run it — all for free.

---

**Workflow (how Nosey snoops):**
```text
+------------------+     +------------------+     +------------------+
|   RSS Feeds      | --> |  Fetch & Dedup   | --> |  Gemini Ranking  |   <-- GitHub Actions
+------------------+     +------------------+     +------------------+
                                                      |
                    +---------------------------------+---------------------------------+
                    |                                 |                                 |
                    v                                 v                                 v
             +-------------+                 +-------------+                 +-------------+
             | Markdown    |                 | HTML Email  |                 | Archive     |
             | Digest      |                 | (Resend)    |                 | Index       |
             +-------------+                 +-------------+                 +-------------+
```

---

## Prerequisites

- GitHub account (free)
- Gemini API key – get it at [Google AI Studio](https://aistudio.google.com/)
- (Optional) Resend API key for email – sign up at [Resend](https://resend.com/)

---

## Quick Start

1. **Fork or clone** this repository to your GitHub account.

2. **Add secrets** in your repository:
   - Go to **Settings → Secrets and variables → Actions → New repository secret**
   - Add:
     - `GEMINI_API_KEY` (required)
     - `RESEND_API_KEY` and `EMAIL_TO` (optional)

3. **Run the workflow manually**:
   - Open the **Actions** tab
   - Select **Daily Tech Digest**
   - Click **Run workflow**

4. **Check the result**:
   - After ~1 minute, a new folder `digests/tech/` appears with a Markdown file named after today’s date.

That’s it. Nosey will now run daily at 08:00 UTC.

---

## Workflow File Example

Full content of `.github/workflows/daily-digest.yml` (currently runs only the Tech agent):

```yaml
name: Daily Tech Digest

on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run digest
        run: node index.js         # change to another agent if you want
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}
      - name: Commit digests
        run: |
          git config user.name "digest-bot[bot]"
          git config user.email "digest-bot@noreply.github.com"
          git add digests/
          git diff --cached --quiet || (
            git commit -m "digest: $(date +%Y-%m-%d) [skip ci]" &&
            git push
          )
```

To run a different agent, replace `node index.js` with `node finance-agent.js`, etc.  
To run multiple agents, duplicate the `Run digest` step.

---

## `index.js` Config Example

Open `index.js` (or any agent file) – you'll see a `CONFIG` object like this:

```javascript
const CONFIG = {
  AGENT_NAME: 'Daily Tech Digest',
  AGENT_EMOJI: '🌐',
  THEME_COLOR: '#22d3ee',
  DIGEST_DIR: 'digests/tech',

  TIME_WINDOW_HOURS: 48,
  ITEMS_PER_FEED: 10,
  SNIPPET_LENGTH: 350,

  MODEL: 'gemini-2.5-flash',
  MAX_RETRIES: 3,

  MIN_STORIES: 10,
  MAX_STORIES: 15,

  EMAIL_FROM: 'Nosey Tech <digest@yourdomain.com>',   // optional

  IMPACT_VERBS: 'Lets / Makes / Gives / Cuts',

  FEEDS: [
    'https://www.theverge.com/rss/index.xml',
    'https://techcrunch.com/feed/',
    'https://arstechnica.com/feed/'
  ],

  EXCLUDE_KEYWORDS: [
    'sponsored',
    'advertorial',
    'subscribe'
  ],

  CATEGORIES: 'AI|Gadgets|Software|Hardware|Startups',

  RANK_CRITERIA: [
    'Major product launches or announcements',
    'Significant AI breakthroughs or policy changes',
    'High‑impact security incidents',
    'Big acquisitions or funding rounds',
    'Relevance to general tech audience'
  ],

  INCLUDE_RULES: [
    'Must be published within the last 48 hours',
    'Must be substantive – not just a rumour or minor update'
  ],

  EXCLUDE_RULES: [
    'Exclude purely promotional content',
    'Exclude stock tips or investment advice',
    'Exclude articles that require a subscription to read the full text'
  ]
};

module.exports = CONFIG;
```

- **To change sources:** edit `FEEDS`.
- **To change ranking:** edit `RANK_CRITERIA`.
- **To filter topics:** add words to `EXCLUDE_KEYWORDS`.
- **To change output size:** adjust `MIN_STORIES` and `MAX_STORIES`.

**Never edit `core.js`** – that's the engine; you just configure the agents.

---

## Running Multiple Agents

In the workflow file, add another step for each agent. For example:

```yaml
- name: Run Finance
  run: node finance-agent.js
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
    EMAIL_TO: ${{ secrets.EMAIL_TO }}
```

Repeat for `gold-agent.js`, `health-agent.js`, or any custom agent.

---

## Local Testing

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
node index.js
```

The Markdown file will appear in `digests/tech/`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Git push fails | Ensure workflow has `permissions: contents: write` |
| Gemini API error | Check secret and quota |
| No articles fetched | Test RSS URL in browser |
| No email received | Verify Resend domain and `EMAIL_TO` / `EMAIL_FROM` |

---

## Cost: $0 / month

Gemini, GitHub Actions, and Resend free tiers cover daily runs of all agents. Nosey doesn't cost a penny.
