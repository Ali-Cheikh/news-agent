# Setup Guide — News Agent with GitHub Actions

This guide walks you through every detail of setting up, customizing, and running the **News Agent** (5 AI-powered RSS digest agents) on GitHub Actions — completely free.

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Pre‑requisites](#2-pre%E2%80%91requisites)
3. [Step‑by‑Step Setup](#3-step%E2%80%91by%E2%80%91step-setup)
   - [3.1 Create the Repository](#31-create-the-repository)
   - [3.2 Add API Secrets](#32-add-api-secrets)
   - [3.3 Enable GitHub Actions](#33-enable-github-actions)
   - [3.4 First Run (Manual)](#34-first-run-manual)
4. [Understanding the Workflow](#4-understanding-the-workflow)
   - [4.1 Workflow File Explained](#41-workflow-file-explained)
   - [4.2 Running a Different Agent](#42-running-a-different-agent)
   - [4.3 Running Multiple Agents](#43-running-multiple-agents)
5. [Customizing an Agent](#5-customizing-an-agent)
   - [5.1 CONFIG Object Reference](#51-config-object-reference)
   - [5.2 Changing Feeds, Keywords, and Rules](#52-changing-feeds-keywords-and-rules)
   - [5.3 Modifying the Prompt or Output](#53-modifying-the-prompt-or-output)
6. [Local Testing](#6-local-testing)
   - [6.1 Install Dependencies](#61-install-dependencies)
   - [6.2 Run an Agent Locally](#62-run-an-agent-locally)
   - [6.3 Preview Email HTML](#63-preview-email-html)
7. [Reading the Digests](#7-reading-the-digests)
   - [7.1 Markdown Files](#71-markdown-files)
   - [7.2 Archive Index](#72-archive-index)
8. [Troubleshooting](#8-troubleshooting)
   - [8.1 Actions Fails with “Git push” Error](#81-actions-fails-with-git-push-error)
   - [8.2 Gemini API Key Invalid / Quota Exceeded](#82-gemini-api-key-invalid--quota-exceeded)
   - [8.3 RSS Feeds Not Returning Articles](#83-rss-feeds-not-returning-articles)
   - [8.4 Email Not Sent](#84-email-not-sent)
   - [8.5 Workflow Not Triggered at Scheduled Time](#85-workflow-not-triggered-at-scheduled-time)
9. [Advanced: Running All Agents in One Workflow](#9-advanced-running-all-agents-in-one-workflow)
10. [Maintenance & Monitoring](#10-maintenance--monitoring)

---

## 1. Repository Structure

Your repository must contain exactly these files at the root:

```
your-repo/
├── core.js                 # Shared engine – DO NOT EDIT unless you know what you're doing
├── index.js                # Tech digest agent
├── finance-agent.js        # Finance digest agent
├── gold-agent.js           # Gold & commodities digest agent
├── health-agent.js         # Medicare & health digest agent
├── edtech-agent.js         # EdTech digest agent
├── package.json            # Dependencies & scripts
└── .github/
    ├── dependabot.yml      # Automated dependency updates
    └── workflows/
        └── daily-digest.yml   # GitHub Actions workflow (currently runs Tech)
```

**Important:** `digests/` folder is **created automatically** on the first successful run – you do not need to create it manually.

---

## 2. Pre‑requisites

- A **GitHub account** (free).
- A **Google Gemini API key** – required. Get it from [Google AI Studio](https://aistudio.google.com/) (free tier: 1,500 requests/day).
- (Optional) A **Resend API key** – if you want email delivery. Sign up at [Resend](https://resend.com/), verify a domain, and create an API key (free tier: 3,000 emails/month).
- Basic familiarity with Git and GitHub.

---

## 3. Step‑by‑Step Setup

### 3.1 Create the Repository

1. Go to [GitHub](https://github.com/new) and create a new **public or private** repository (private is fine).
2. Clone it locally or use the web interface to upload the files.
   - If using the web interface:
     - Click **"Add file" → "Upload files"**.
     - Upload all files from the agent‑suite project.
     - Commit directly to `main` (or `master`).
3. Ensure the folder structure matches exactly (especially the `.github/` folder).
4. Push if you cloned locally.

### 3.2 Add API Secrets

1. Navigate to your repository on GitHub.
2. Click **Settings** (tab) → **Secrets and variables** (in left sidebar) → **Actions**.
3. Click **New repository secret** and add these three secrets:

| Secret Name       | Value                                            | Required? |
|-------------------|--------------------------------------------------|-----------|
| `GEMINI_API_KEY`  | Your Gemini API key (starts with `AIza...`)      | **Yes**   |
| `RESEND_API_KEY`  | Your Resend API key (starts with `re_...`)       | No        |
| `EMAIL_TO`        | One or more email addresses, comma‑separated     | No        |

> **Tip:** If you omit the Resend secrets, the workflow will still run and generate the markdown digests – it just won’t send emails. That’s perfectly fine.

### 3.3 Enable GitHub Actions

- GitHub Actions is usually enabled by default. If you see a banner saying "Workflows aren’t being run on this fork" or similar, go to the **Actions** tab and click **"I understand my workflows, go ahead and enable them"**.

### 3.4 First Run (Manual)

1. Go to the **Actions** tab of your repository.
2. On the left sidebar, click the workflow named **"Daily Tech Digest"** (the name comes from the workflow file).
3. Click the **"Run workflow"** dropdown button (right side).
4. Click the **"Run workflow"** button again to start a manual run.
5. Wait about 30‑60 seconds – you’ll see a yellow dot turning green (success) or red (failure).
6. If successful, check your repository – a new folder `digests/tech/` should appear with a `.md` file named after today’s date, e.g., `2026-07-30.md`. Also, a `README.md` inside that folder serves as an archive index.

> **Note:** The first run might take a bit longer because `npm ci` installs all dependencies.

---

## 4. Understanding the Workflow

### 4.1 Workflow File Explained

The `.github/workflows/daily-digest.yml` file contains the automation logic. Let’s break it down:

```yaml
name: Daily Tech Digest                # Display name in Actions UI

on:
  schedule:
    - cron: '0 8 * * *'              # 08:00 UTC daily
  workflow_dispatch:                  # Allow manual trigger

permissions:
  contents: write                     # Needed to commit digests back to repo

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4     # Check out your code
      - uses: actions/setup-node@v4   # Setup Node.js 20
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci                  # Install dependencies exactly as in package-lock.json
      - name: Run digest
        run: node index.js           # <-- This runs the Tech agent
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}
      - name: Commit to repo
        run: |
          git config user.name "digest-bot[bot]"
          git config user.email "digest-bot@noreply.github.com"
          git add digests/
          git diff --cached --quiet || (
            git commit -m "digest: $(date +%Y-%m-%d) [skip ci]" &&
            git push
          )
```

**Key points:**
- **`schedule`** uses cron syntax – you can change the time or frequency.
- **`workflow_dispatch`** allows manual triggering – useful for testing.
- **`permissions: contents: write`** gives the workflow permission to push commits.
- The **`Run digest`** step sets environment variables from secrets – these are passed to your Node.js script.
- The **`Commit to repo`** step adds all changes in `digests/` and commits them with a `[skip ci]` message to avoid infinite loops.

### 4.2 Running a Different Agent

To run, say, the **Finance** agent instead of Tech, simply change the `run: node index.js` line to:

```yaml
run: node finance-agent.js
```

Then commit that change – the next scheduled run will use the Finance agent.

### 4.3 Running Multiple Agents

You have several options:

**Option A — One workflow with multiple steps**  
Add more steps after the first one, each running a different agent:

```yaml
- name: Run Tech digest
  run: node index.js
  env: { ... }
- name: Run Finance digest
  run: node finance-agent.js
  env: { ... }
- name: Run Gold digest
  run: node gold-agent.js
  env: { ... }
# ... and so on
```

**Option B — Separate workflow files**  
Create separate `.yml` files for each agent, e.g., `finance-digest.yml`, `gold-digest.yml`, etc. Each can have its own schedule (e.g., Finance at 6 AM, Tech at 8 AM).

**Option C — Use a matrix** (advanced) – but simpler is best.

---

## 5. Customizing an Agent

Each agent file (e.g., `index.js`) exports a `CONFIG` object. You can edit this to control every aspect of that digest.

### 5.1 CONFIG Object Reference

| Key                | Description                                                                 | Example                         |
|--------------------|-----------------------------------------------------------------------------|---------------------------------|
| `AGENT_NAME`       | Display name used in emails and markdown                                   | `"Daily Tech Digest"`           |
| `AGENT_EMOJI`      | Emoji shown in subject and headers                                         | `"🌐"`                          |
| `THEME_COLOR`      | Hex color for email accents                                                | `"#22d3ee"`                     |
| `DIGEST_DIR`       | Subfolder inside `digests/` where files are saved                         | `"digests/tech"`                |
| `TIME_WINDOW_HOURS`| Only consider articles published within this many hours                   | `48`                            |
| `ITEMS_PER_FEED`   | Max articles fetched per RSS feed                                          | `10`                            |
| `SNIPPET_LENGTH`   | Max characters for article snippet                                         | `350`                           |
| `MODEL`            | Gemini model to use – `"gemini-2.5-flash"` is fast and free                | `"gemini-2.5-flash"`            |
| `MAX_RETRIES`      | How many times to retry Gemini API calls on failure                       | `3`                             |
| `MIN_STORIES`      | Minimum number of stories Gemini should output (may output fewer)         | `10`                            |
| `MAX_STORIES`      | Maximum number of stories Gemini should output                             | `15`                            |
| `EMAIL_FROM`       | Sender email address (must be verified in Resend)                          | `"Tech <digest@yourdomain.com>"`|
| `IMPACT_VERBS`     | Verbs Gemini must start `why_it_matters` with (space‑separated)           | `"Lets / Makes / Gives / Cuts"` |
| `FEEDS`            | Array of RSS feed URLs                                                     | (see examples)                  |
| `EXCLUDE_KEYWORDS` | Words that, if present in title or snippet, cause the article to be dropped| (see examples)                  |
| `CATEGORIES`       | Pipe‑separated list of categories for Gemini to choose from                | `"Smartphone\|Laptop\|AI"`      |
| `RANK_CRITERIA`    | Lines describing how Gemini should prioritise stories                     | (see examples)                  |
| `INCLUDE_RULES`    | Lines describing what stories **must** have to be included                | (see examples)                  |
| `EXCLUDE_RULES`    | Lines describing what stories should be **excluded**                      | (see examples)                  |

### 5.2 Changing Feeds, Keywords, and Rules

- **Adding a feed**: Add its RSS URL to the `FEEDS` array.  
- **Removing a feed**: Delete or comment out the line.  
- **Excluding keywords**: Add words to `EXCLUDE_KEYWORDS` – any article containing these (case‑insensitive) in title or snippet will be filtered out **before** Gemini even sees it.  
- **Adjusting ranking criteria**: Edit the `RANK_CRITERIA` array. Order matters – Gemini will use the numbered list as its priority guide.  
- **Tightening include/exclude rules**: Edit the `INCLUDE_RULES` and `EXCLUDE_RULES` arrays – these become part of the prompt sent to Gemini.

### 5.3 Modifying the Prompt or Output

If you want deeper changes (e.g., change the JSON schema or prompt structure), you would need to edit `core.js`. However, the current design is intentionally flexible – most use cases are covered by the `CONFIG` object.

**Important:** If you edit `core.js`, be careful – it’s shared across all agents. Changes there affect every agent.

---

## 6. Local Testing

Before pushing changes to GitHub, you can test any agent locally on your machine.

### 6.1 Install Dependencies

```bash
npm install
```

This reads `package.json` and installs all required packages (`@google/generative-ai`, `rss-parser`, `resend`, `dotenv`).

### 6.2 Run an Agent Locally

Create a `.env` file in the project root with:

```env
GEMINI_API_KEY=AIza...
RESEND_API_KEY=re_...
EMAIL_TO=you@example.com
```

Then run:

```bash
node index.js          # Tech
# or
node finance-agent.js
# etc.
```

Watch the console output – it logs each step (fetching, filtering, Gemini analysis, writing files). The generated markdown file will appear in the respective `digests/` subfolder.

### 6.3 Preview Email HTML

If you want to see the email HTML without actually sending it, you can temporarily add a `console.log(buildHTML(...))` in `core.js` – but it’s easier to trust the code. Alternatively, the `core.js` already constructs the HTML; if you have Resend set, it sends the email. For local testing, you might comment out the email sending part (or just rely on the markdown).

---

## 7. Reading the Digests

### 7.1 Markdown Files

Each digest is saved as `digests/<agent>/YYYY-MM-DD.md` (e.g., `digests/tech/2026-07-30.md`).  
The markdown includes:

- A header with the agent’s name and date.
- A **Top Story** section with a link.
- A table with all stories (rank, headline, summary, category, sources, and "why it matters").

This file is human‑readable and can be viewed directly in GitHub’s UI.

### 7.2 Archive Index

Inside each agent’s digest folder (e.g., `digests/tech/`), there is a `README.md` that automatically grows with a list of all past digests (linked by date). This gives you a chronological archive.

---

## 8. Troubleshooting

### 8.1 Actions Fails with “Git push” Error

- **Symptom:** The workflow fails at the commit step with `fatal: not a git repository` or `Permission denied`.
- **Cause:** The `contents: write` permission is missing, or the repository is protected (branch protection rules).
- **Fix:**
  - Ensure the workflow has `permissions: contents: write` (included by default).
  - If you have branch protection rules (e.g., require PR for `main`), you need to either disable them or push to a different branch. For a personal repo, it’s easiest to allow direct pushes.

### 8.2 Gemini API Key Invalid / Quota Exceeded

- **Symptom:** `Error: 403 Permission denied` or `429 Quota exceeded`.
- **Cause:** API key missing, incorrect, or daily free quota used up.
- **Fix:**
  - Double‑check the secret name (`GEMINI_API_KEY`) and value.
  - Visit [AI Studio](https://aistudio.google.com/) to verify your key and see usage.

### 8.3 RSS Feeds Not Returning Articles

- **Symptom:** Console shows `0 raw articles` or `No RSS entries`.
- **Cause:** Some feeds may be down, require a user‑agent, or have changed.
- **Fix:**
  - Test a feed URL manually in your browser to see if it still works.
  - Add a user‑agent header in `core.js` if needed (but the default parser usually works).
  - Switch to a different feed URL (e.g., many sites offer multiple RSS endpoints).

### 8.4 Email Not Sent

- **Symptom:** The workflow runs successfully but you receive no email.
- **Causes:**
  - `RESEND_API_KEY` secret is missing or invalid.
  - `EMAIL_TO` secret not set or malformed.
  - The sender email (`EMAIL_FROM` in CONFIG) is not verified in Resend.
- **Fix:**
  - Verify your domain in Resend and use an email address from that domain as `EMAIL_FROM`.
  - Check Resend dashboard for sending logs.

### 8.5 Workflow Not Triggered at Scheduled Time

- **Symptom:** The scheduled cron does not run.
- **Causes:**
  - The workflow file might be in a branch other than `main` (only default branch schedules are active).
  - GitHub Actions cron jobs may have slight delays – they are not guaranteed at exact seconds, but usually within a few minutes.
- **Fix:**
  - Ensure your workflow file is on the default branch (usually `main` or `master`).
  - Use `workflow_dispatch` to manually trigger and confirm it works.

---

## 9. Advanced: Running All Agents in One Workflow

If you’d like to run **all five agents** in a single scheduled run, you can extend your workflow like this:

```yaml
name: Full Daily Digest Suite

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

      - name: Run Tech Digest
        run: node index.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}

      - name: Run Finance Digest
        run: node finance-agent.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}

      - name: Run Gold Digest
        run: node gold-agent.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}

      - name: Run Health Digest
        run: node health-agent.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}

      - name: Run EdTech Digest
        run: node edtech-agent.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}

      - name: Commit all digests
        run: |
          git config user.name "digest-bot[bot]"
          git config user.email "digest-bot@noreply.github.com"
          git add digests/
          git diff --cached --quiet || (
            git commit -m "digest: $(date +%Y-%m-%d) [skip ci]" &&
            git push
          )
```

This will run all agents sequentially, each using the same secrets. Each will produce its own markdown file. The single commit will include all new digests.

---

## 10. Maintenance & Monitoring

- **Dependabot** (if you included the `.github/dependabot.yml`) will automatically open pull requests for dependency updates. Review them and merge when convenient.
- **Monitor Actions** – check the workflow run logs for any errors. The logs are retained for 90 days.
- **Adjust schedules** – if you find 8 AM UTC doesn’t suit your timezone, change the cron expression.
- **Consider adding a badge** – you can add a GitHub Actions status badge to your repository’s README by copying the Markdown from the Actions tab → "…" (three dots) → "Create status badge".
