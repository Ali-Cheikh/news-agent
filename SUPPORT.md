<img src="/assets/Tnosey-confused.png" align="right" />

# How to Activate Nosey
This Support doc holds how you configure **Nosey**
Step by step through setting up and running your own digest agents — _locally or on GitHub Actions_.
All you need is just a bit of curiosity.

You'll point your nosey agent at a few **RSS** feeds, tell it which words to ignore, give it a ranked list of what matters, and it will fetch, deduplicate, and deliver a tidy digest. Want a specific accent color in the email? Set it. Only care about the **last 48 hours**? Done. Prefer 10 to 15 stories per day? That's just a couple of fields.

All of it lives in one simple config object inside each agent file. Tweak a few values and your nosey agent is ready to go.

## Prerequisites

- **Node.js** (v18+) – only if testing locally.
- A **GitHub account** (for Actions).
- A **Gemini API key** – free from [Google AI Studio](https://aistudio.google.com/).
- (Optional) A **Resend API key** for email – sign up at [Resend](https://resend.com/).

---

## Quick Start (Local)

1. **Clone the repo** and move in:

   ```bash
   git clone https://github.com/your-username/nosey.git
   cd nosey
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create a `.env` file** with your Gemini key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   For email, also add:

   ```env
   RESEND_API_KEY=your_resend_key
   EMAIL_TO=you@example.com
   ```

4. **Run an agent**:

   ```bash
   node index.js            # Tech
   node finance-agent.js    # Finance
   # etc.
   ```

   The digest saves as a Markdown file in `digests/`. Console logs show every step — Nosey is transparent about its snooping.

---

## Quick Start (GitHub Actions)

1. **Fork or create a new repo** from this template (or upload the files).

2. **Add secrets** in your repository:
   - **Settings → Secrets and variables → Actions → New repository secret**
   - Required: `GEMINI_API_KEY`
   - Optional: `RESEND_API_KEY`, `EMAIL_TO`

3. **Run the workflow manually**:
   - Go to **Actions** → select **Daily Tech Digest** → **Run workflow**.

4. **Check the output**:
   - After ~1 minute, a new `digests/tech/` folder appears with today's `.md` file.
   - The workflow commits the digest back to the repo.

The workflow is scheduled to run daily at 08:00 UTC by default. But you can change that easily — see the next section.

---

## The Workflow File and Cron Schedule

The automation lives in `.github/workflows/daily-digest.yml`. This is the file that tells GitHub when to wake up Nosey and what to do.

Here's the full default workflow:

```yaml
name: Daily Tech Digest

on:
  schedule:
    - cron: '59 5 * * *'      # 5:59 UTC every day
  workflow_dispatch:          # allows manual trigger from GitHub UI

permissions:
  contents: write            # needed to commit the digest files

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
        run: node index.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO:       ${{ secrets.EMAIL_TO }}

      - name: Commit to repo
        run: |
          git config user.name  "digest-bot[bot]"
          git config user.email "digest-bot@noreply.github.com"
          git add digests/
          git diff --cached --quiet || (
            git commit -m "digest: $(date +%Y-%m-%d) [skip ci]" &&
            git push
          )
```

### Changing the Schedule

The `cron` line controls when the workflow runs. The syntax is:

```
┌───────── minute (0–59)
│ ┌───────── hour (0–23)
│ │ ┌───────── day of month (1–31)
│ │ │ ┌───────── month (1–12)
│ │ │ │ ┌───────── day of week (0–6, Sunday=0)
│ │ │ │ │
* * * * *
```

Examples:

- `'0 8 * * *'` → every day at 08:00 UTC
- `'59 5 * * *'` → every day at 05:59 UTC
- `'0 */6 * * *'` → every 6 hours
- `'0 9 * * 1-5'` → weekdays at 09:00 UTC

To change the schedule, edit the `cron` line and commit the file. That's it.

---

## Configuration Deep Dive

Every agent is defined by a `CONFIG` object in its `.js` file.  
The shared engine (`core.js`) is off‑limits — don't touch it unless you know what you're doing.

### Most Common Fields

| Field | Description | Example |
|-------|-------------|---------|
| `FEEDS` | Array of RSS feed URLs | `['https://example.com/rss']` |
| `EXCLUDE_KEYWORDS` | Words that drop an article (case‑insensitive) | `['sponsored', 'advertorial']` |
| `RANK_CRITERIA` | Ordered list of factors Gemini uses to rank stories | See below |
| `CATEGORIES` | Pipe‑separated labels for stories | `'AI\|Gadgets\|Software'` |
| `THEME_COLOR` | Accent color for HTML email | `'#22d3ee'` |
| `TIME_WINDOW_HOURS` | Only consider articles from the last N hours | `48` |
| `MIN_STORIES` / `MAX_STORIES` | Bounds for digest size | `10` / `15` |

### Understanding `RANK_CRITERIA`

This is a list of instructions sent to Gemini. Order matters — put the most important criteria first.

**Tech agent example:**

```javascript
RANK_CRITERIA: [
  'Major product launches or announcements',
  'Significant AI breakthroughs or policy changes',
  'High‑impact security incidents',
  'Big acquisitions or funding rounds',
  'Relevance to general tech audience'
],
```

For a finance agent, you might use:

```javascript
RANK_CRITERIA: [
  'Central bank decisions or policy changes',
  'Major earnings reports that beat/miss expectations',
  'Geopolitical events affecting markets',
  'Significant mergers and acquisitions',
  'Changes in commodity prices or inflation data'
],
```

### `INCLUDE_RULES` and `EXCLUDE_RULES`

Extra prompt instructions that tell Gemini what to keep or avoid.

```javascript
INCLUDE_RULES: [
  'Must be published within the last 48 hours',
  'Must be substantive – not just a rumour or minor update'
],

EXCLUDE_RULES: [
  'Exclude purely promotional content',
  'Exclude articles that require a subscription to read the full text'
],
```

---

## Creating Your Own Agent

You don't have to stick with the five provided agents — Nosey loves new noses.

1. **Copy an existing agent file** (e.g. `index.js`):

   ```bash
   cp index.js sports-agent.js
   ```

2. **Edit the new file** (`sports-agent.js`) and change the `CONFIG`:
   - Update `AGENT_NAME`, `AGENT_EMOJI`, `DIGEST_DIR` (e.g. `digests/sports`).
   - Replace `FEEDS` with your preferred RSS feeds.
   - Tweak `RANK_CRITERIA`, `CATEGORIES`, etc.

3. **Run it locally** to test:

   ```bash
   node sports-agent.js
   ```

4. **Add it to the GitHub Actions workflow** (if using Actions):
   - Open `.github/workflows/daily-digest.yml`.
   - Add a new step:

     ```yaml
     - name: Run Sports Agent
       run: node sports-agent.js
       env:
         GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
         RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
         EMAIL_TO: ${{ secrets.EMAIL_TO }}
     ```

5. **Commit and push** — your new agent will now run on schedule.

---

## Email Setup (Optional)

To receive digests as HTML emails:

1. Sign up at [Resend](https://resend.com/) and verify a domain.
2. Copy your Resend API key.
3. In the agent config, set `EMAIL_FROM` to an address from your verified domain:

   ```javascript
   EMAIL_FROM: 'Nosey Digest <digest@yourdomain.com>'
   ```

4. Add `RESEND_API_KEY` and `EMAIL_TO` secrets to GitHub (or `.env` for local).

If you skip email, Nosey still saves Markdown digests in the repository — no worries.

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| `node` not found | Node.js not installed | Install from [nodejs.org](https://nodejs.org/) |
| `403` / `429` from Gemini | Invalid key or quota exceeded | Check key in [AI Studio](https://aistudio.google.com/) |
| No articles fetched | Feed URL broken or down | Test the URL in a browser |
| Email not sent | Resend key missing or `EMAIL_FROM` unverified | Verify domain in Resend and re‑check secrets |
| GitHub Actions commit fails | Missing `contents: write` permission | Ensure workflow includes `permissions: contents: write` |

---

## Next Steps

- Read the [main README](../README.md) for the big picture.
- Explore the `CONFIG` objects inside each agent file to see how they're set up.
- Star the repo if Nosey made you smile — and share your custom agents!
