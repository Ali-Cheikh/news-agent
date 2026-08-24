# How to Activate nosey

This guide walks you through setting up and running your own AI-powered daily digest agents, whether locally or on GitHub Actions.  
You'll learn how to install, configure, and customize everything — no advanced coding required.

---

## Prerequisites

- **Node.js** (version 18 or higher) if you want to test locally.
- A **GitHub account** (for running on GitHub Actions).
- A **Gemini API key** – get one free at [Google AI Studio](https://aistudio.google.com/).
- (Optional) A **Resend API key** for email delivery – sign up at [Resend](https://resend.com/).

---

## Quick Start (Local)

1. **Clone the repository** to your machine:

   ```bash
   git clone https://github.com/your-username/agent-suite.git
   cd agent-suite
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root with your API key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   If you plan to send emails, also add:

   ```env
   RESEND_API_KEY=your_resend_api_key_here
   EMAIL_TO=you@example.com
   ```

4. **Run an agent**:

   ```bash
   node index.js            # Tech agent
   # or
   node finance-agent.js    # Finance agent
   # etc.
   ```

   The digest will be saved as a Markdown file inside the `digests/` folder.  
   Console output shows each step (fetching, filtering, ranking, writing).

---

## Quick Start (GitHub Actions)

1. **Fork or create a new repository** from this template (or upload the files).

2. **Add secrets** to your repository:
   - Go to **Settings → Secrets and variables → Actions → New repository secret**.
   - Add:
     - `GEMINI_API_KEY` (required)
     - `RESEND_API_KEY` and `EMAIL_TO` (optional)

3. **Run the workflow manually**:
   - Open the **Actions** tab.
   - Select the workflow (**Daily Tech Digest** by default).
   - Click **Run workflow**.

4. **Check the output**:
   - After about a minute, a new folder `digests/tech/` will appear with today’s digest as a `.md` file.
   - The workflow also commits the digest back to the repository.

The workflow is scheduled to run daily at 08:00 UTC. You can change the schedule later.

---

## Configuration Deep Dive

All agents are defined by a `CONFIG` object inside their respective `.js` file.  
The shared engine (`core.js`) does **not** need to be modified for normal use.

### Most Common Fields

| Field | Description | Example |
|-------|-------------|---------|
| `FEEDS` | Array of RSS feed URLs to fetch | `['https://example.com/rss', 'https://anotherexample.com/feed']` |
| `EXCLUDE_KEYWORDS` | Words that cause an article to be dropped (case‑insensitive) | `['sponsored', 'advertorial']` |
| `RANK_CRITERIA` | Ordered list of factors Gemini uses to rank stories | See below |
| `CATEGORIES` | Pipe‑separated list for labeling stories | `'AI\|Gadgets\|Software'` |
| `THEME_COLOR` | Accent color for HTML email | `'#22d3ee'` |
| `TIME_WINDOW_HOURS` | Only consider articles from the last N hours | `48` |
| `MIN_STORIES` / `MAX_STORIES` | How many stories the digest should contain | `10` / `15` |

### Understanding `RANK_CRITERIA`

`RANK_CRITERIA` is a list of instructions sent to Gemini.  
Order matters — put the most important criteria first.

**Example from the Tech agent:**

```javascript
RANK_CRITERIA: [
  'Major product launches or announcements',
  'Significant AI breakthroughs or policy changes',
  'High‑impact security incidents',
  'Big acquisitions or funding rounds',
  'Relevance to general tech audience'
],
```

You can change these lines to match your interests. For a finance agent, you might use:

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

These are extra prompt instructions that tell Gemini what to include or avoid.

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

You don’t have to use the five included agents. You can create as many as you want.

1. **Copy an existing agent file** (e.g. `index.js`):

   ```bash
   cp index.js sports-agent.js
   ```

2. **Edit the new file** (`sports-agent.js`) and change the `CONFIG`:
   - Update `AGENT_NAME`, `AGENT_EMOJI`, `DIGEST_DIR` (e.g. `digests/sports`).
   - Replace `FEEDS` with your chosen RSS feeds.
   - Adjust `RANK_CRITERIA`, `CATEGORIES`, and other fields.

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

5. **Commit and push**. The new agent will now run on schedule.

---

## Email Setup (Optional)

To receive the digest as an HTML email:

1. Sign up at [Resend](https://resend.com/) and verify a domain.
2. Copy your Resend API key.
3. In the agent config, set `EMAIL_FROM` to an address from your verified domain:

   ```javascript
   EMAIL_FROM: 'Your Digest <digest@yourdomain.com>'
   ```

4. Add the `RESEND_API_KEY` and `EMAIL_TO` secrets to GitHub (or include them in `.env` for local testing).

If you skip email configuration, agents will still save Markdown digests in the repository.

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| `node` command not found | Node.js not installed | Install Node.js from [nodejs.org](https://nodejs.org/) |
| `Error: 403` or `429` from Gemini | Invalid API key or quota exceeded | Check your key in [AI Studio](https://aistudio.google.com/) |
| No articles fetched | RSS feed URL is broken or down | Test the feed URL in a browser |
| Email not sent | Resend key missing or `EMAIL_FROM` not verified | Verify your domain in Resend and re‑check secrets |
| GitHub Actions workflow fails at commit | Missing `contents: write` permission | Ensure the workflow includes `permissions: contents: write` |

---

## Next Steps

- Read the [main README](../README.md) for a high‑level overview.
- Explore the `CONFIG` objects inside each agent file to see how they are set up.
- Star the repository if you find it useful!
