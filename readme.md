# Agent Suite

Build your own AI-powered daily digest agent.  
The included examples are just starting points — swap in your own RSS feeds and rules.

A collection of independent AI-powered daily digest agents that fetch, deduplicate, rank, and deliver the most relevant stories from curated RSS feeds. Built with Node.js, Google Gemini, GitHub Actions, and optional email delivery through Resend.

The entire system runs on free service tiers — no paid subscription is required.

![views](https://raw.githubusercontent.com/Ali-Cheikh/Ali-Cheikh/traffic/traffic-news-agent/views.svg)
![views per week](https://raw.githubusercontent.com/Ali-Cheikh/Ali-Cheikh/traffic/traffic-news-agent/views_per_week.svg)
![clones](https://raw.githubusercontent.com/Ali-Cheikh/Ali-Cheikh/traffic/traffic-news-agent/clones.svg)
![clones per week](https://raw.githubusercontent.com/Ali-Cheikh/Ali-Cheikh/traffic/traffic-news-agent/clones_per_week.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

This repository contains a set of configurable news digest agents. Each agent:

- Pulls articles from a defined list of RSS feeds
- Removes near-duplicate stories across sources
- Ranks content using Google Gemini 2.5 Flash
- Generates a structured Markdown digest
- Optionally sends a responsive HTML email
- Archives every edition in the repository

All agents share a common engine (`core.js`). Individual agents are defined by simple configuration files.

> **Important:** You are **not** required to use the five default agents included in this repository. They are provided as working examples.  
> To create your own digest, simply open any agent file (for example, `index.js`) and replace the `FEEDS` array with your preferred RSS feed URLs. The LLM will automatically process the collected articles and deliver a ranked, deduplicated digest — no further coding is needed.

---

## Available Agents (Examples)

These are pre-built examples to get you started. Replace their feeds and rules to make them your own.

| Agent | File | Coverage |
|-------|------|----------|
| Tech | `index.js` | Consumer technology, gadgets, AI tools, software releases, hardware |
| Finance | `finance-agent.js` | Markets, central banks, earnings, macroeconomics, foreign exchange |
| Gold & Commodities | `gold-agent.js` | Precious metals, mining, oil, gas, critical minerals |
| Health & Medicare | `health-agent.js` | FDA approvals, drug pricing, Medicare/Medicaid, clinical trials |
| EdTech | `edtech-agent.js` | AI in education, LMS platforms, policy, research, certifications |

Each agent runs independently. You can enable one, several, or all of them. Creating a new agent only requires specifying the sources and selection criteria.

---

## Key Features

- **Near-duplicate detection** — Groups similar stories from multiple outlets using Jaccard similarity.
- **AI-based ranking** — Gemini 2.5 Flash selects the 8–15 most important stories according to your criteria.
- **HTML email delivery** — Sends a clean, responsive email digest through Resend (optional).
- **Markdown archive** — Saves every digest as a dated `.md` file and commits it to the repository.
- **Auto-generated index** — Each agent maintains its own `README.md` archive linking to all past editions.
- **Low-code customization** — Agents are configured by editing simple objects; no changes to the core engine are required.
- **Zero operating cost** — Uses the free tiers of Gemini, GitHub Actions, and Resend.

---

## Repository Structure

```
agent-suite/
├── core.js                     # Shared engine: RSS fetching, deduplication, Gemini ranking, email
│
│
├── index.js                    # Tech agent configuration (example/to edit making your own)
│
├── finance-agent.js            # Finance agent configuration (example)
├── gold-agent.js               # Gold & commodities agent configuration (example)
├── health-agent.js             # Health agent configuration (example)
├── edtech-agent.js             # EdTech agent configuration (example)
│
│
├── package.json                # Dependencies
├── .github/
│   ├── dependabot.yml          # Weekly dependency updates
│   └── workflows/
│       └── daily-digest.yml    # Scheduled GitHub Actions workflow
│
└── digests/                    # Generated on first run
    ├── tech/
    ├── finance/
    ├── commodities/
    ├── health/
    └── edtech/
```

---

## Quick Start

1. **Clone or fork this repository.**

2. **Obtain a Gemini API key** from [Google AI Studio](https://aistudio.google.com/). The free tier is sufficient.

3. **Add repository secrets** in GitHub:
   - Go to **Settings → Secrets and variables → Actions → New repository secret**.
   - Add `GEMINI_API_KEY` (required).
   - If email delivery is desired, also add `RESEND_API_KEY` and `EMAIL_TO`.

4. **Push the code** to GitHub.

5. **Run the workflow manually**:
   - Open the **Actions** tab.
   - Select the workflow.
   - Click **Run workflow**.

The first digest will be generated and committed to the appropriate directory under `digests/` within a few minutes.

---

## Customizing an Agent

Each agent is defined by a `CONFIG` object. Open the relevant file and adjust the values shown below.

| Key | Purpose |
|-----|---------|
| `FEEDS` | List of RSS feed URLs to fetch |
| `EXCLUDE_KEYWORDS` | Articles containing any of these terms are discarded |
| `RANK_CRITERIA` | Ordered list of factors Gemini should prioritize |
| `INCLUDE_RULES` / `EXCLUDE_RULES` | Prompt instructions for story selection |
| `CATEGORIES` | Pipe-separated list used to label stories |
| `THEME_COLOR` | Accent color for HTML email output |
| `TIME_WINDOW_HOURS` | How far back to look, e.g. `24` or `48` |
| `MIN_STORIES` / `MAX_STORIES` | Bounds for the number of stories included |

### Using Your Own Feeds

You do not have to keep the default five agents. To repurpose an agent:

1. Open an agent file, e.g. `index.js`.
2. Locate the `FEEDS` array.
3. Replace the URLs with your preferred RSS feeds.
4. Adjust `CATEGORIES`, `RANK_CRITERIA`, or other fields if desired.
5. Save and push the file to GitHub.

The existing engine will automatically fetch, deduplicate, rank, and deliver the content from your chosen feeds. The LLM handles the entire processing pipeline — no additional code changes are required.

The shared engine in `core.js` does not need to be modified.

---

## Email Setup (Optional)

1. Create an account at [Resend](https://resend.com/).
2. Verify a sending domain.
3. Add `RESEND_API_KEY` and `EMAIL_TO` to GitHub Actions secrets.
4. In the agent configuration, set `EMAIL_FROM` to a verified address, for example:

```js
EMAIL_FROM: 'Tech Digest <digest@yourdomain.com>'
```

If email is not configured, agents will still produce and archive Markdown digests.

---

## Cost Breakdown

| Service | Free Tier | Project Usage |
|---------|-----------|----------------|
| Google Gemini 2.5 Flash | 1,500 requests/day | 1 request per agent per day |
| GitHub Actions | 2,000 minutes/month | Approximately 1 minute per run |
| Resend | 3,000 emails/month | Up to 5 emails per day |
| **Total** | — | **$0 / month** |

---

## Running All Agents

The default workflow runs only the Tech agent. To enable all agents, edit `.github/workflows/daily-digest.yml` and add a step for each agent.

Example:

```yaml
- name: Run Finance agent
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: node finance-agent.js
```

Repeat this pattern for `gold-agent.js`, `health-agent.js`, and `edtech-agent.js`.

Each agent writes to its own directory, and all digests can be committed in a single workflow run.

---

## Local Testing

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env

node index.js            # Tech
node finance-agent.js    # Finance
node gold-agent.js       # Gold & commodities
node health-agent.js     # Health
node edtech-agent.js     # EdTech
```

Generated Markdown files will appear in `digests/`. The console logs each step of execution.

---

## Viewing Digests

- **Repository**: Browse to `digests/<agent>/YYYY-MM-DD.md`.
- **Email**: If configured, a formatted HTML newsletter is sent each morning.
- **Archive**: `digests/<agent>/README.md` contains links to all previous editions.

---

## Contributing

Pull requests are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Open a pull request.

Bug reports, broken feed fixes, and new agent configurations are appreciated.

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute it.

---

## Support

- **Star the repository** if you find it useful.
- **Open an issue** for bugs or questions.
- **Share your custom agents** with the community.
