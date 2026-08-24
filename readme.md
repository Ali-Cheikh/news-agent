<img src="/assets/Tnosey-sniffing.png" align="right" />

# Nosey

> The AI that snoops your RSS feeds so you don't have to.

Nosey is a lightweight, zero‑cost framework that turns your curated RSS feeds into a daily, AI‑ranked digest. It fetches, deduplicates, ranks, and delivers the most relevant stories — all via GitHub Actions and the Gemini free tier.

Why *Nosey*? Because it pokes into every feed, sniffs out duplicates, and digs up the stories that actually matter. The included agents are just examples — swap in your own feeds and rules, and Nosey adapts instantly.

![clones](https://raw.githubusercontent.com/Ali-Cheikh/Ali-Cheikh/traffic/traffic-news-agent/clones.svg)
![clones per week](https://raw.githubusercontent.com/Ali-Cheikh/Ali-Cheikh/traffic/traffic-news-agent/clones_per_week.svg)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-2088FF?logo=github-actions)](https://github.com/features/actions)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?logo=google)](https://ai.google.dev/)

---

## Overview

Nosey is a collection of independent agents. Each one:

- Pulls articles from your RSS feeds
- Removes near‑duplicates across sources
- Ranks content with Google Gemini 2.5 Flash
- Generates a structured Markdown digest
- Optionally sends a responsive HTML email via Resend
- Archives every edition in the repository

All agents share a common engine (`core.js`). Individual agents are defined by simple configuration files — no advanced coding required.

> [!IMPORTANT]
> You are **not** required to use the five default agents. They are working examples. To create your own Nosey, just open any agent file (e.g. `index.js`), replace the `FEEDS` array with your favourite RSS URLs, and let Nosey do the rest — the LLM handles everything automatically.

---

## Available Agents (Examples)

These pre‑built examples are ready to run. Swap their feeds and rules to make them your own.

| Agent | File | Coverage |
|-------|------|----------|
| Tech | `index.js` | Consumer tech, gadgets, AI, software, hardware |
| Finance | `finance-agent.js` | Markets, central banks, earnings, macro |
| Gold & Commodities | `gold-agent.js` | Precious metals, mining, oil, gas, minerals |
| Health & Medicare | `health-agent.js` | FDA, drug pricing, clinical trials, policy |
| EdTech | `edtech-agent.js` | AI in education, LMS, research, certifications |

Each agent runs independently. Enable one, several, or all of them.

---

## Key Features

- **Near‑duplicate detection** — groups similar stories using Jaccard similarity.
- **AI ranking** — Gemini picks the 8–15 most important stories per your criteria.
- **Email delivery** — clean, responsive HTML via Resend (optional).
- **Markdown archive** — every digest saved as `YYYY-MM-DD.md` and committed.
- **Auto‑generated index** — each agent maintains its own `README.md` archive.
- **Low‑code** — edit a config object; never touch the core engine.
- **Zero operating cost** — free tiers of Gemini, GitHub Actions, and Resend.

---

## Repository Structure

```
nosey/
├── core.js                     # Shared engine (don't touch)
├── index.js                    # Tech agent (example – edit this)
├── finance-agent.js            # Finance agent (example)
├── gold-agent.js               # Gold & commodities agent (example)
├── health-agent.js             # Health agent (example)
├── edtech-agent.js             # EdTech agent (example)
├── package.json
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       └── daily-digest.yml    # GitHub Actions schedule
└── digests/                    # Created on first run
    ├── tech/
    ├── finance/
    ├── commodities/
    ├── health/
    └── edtech/
```

---

<img src="/assets/Tnosey-sleeping.png" align="right" />

## Quick Start
> [!NOTE]
> *You might want to check [#How-to-use](https://github.com/Ali-Cheikh/nosey-agent/blob/main/SUPPORT.md) and [#Setup.md](https://github.com/Ali-Cheikh/nosey-agent/blob/main/setup.md)*
1. **Clone or fork** this repository.
2. **Get a Gemini API key** from [Google AI Studio](https://aistudio.google.com/) (free tier works).
3. **Add secrets** in your GitHub repo:
   - `GEMINI_API_KEY` (required)
   - `RESEND_API_KEY` and `EMAIL_TO` (optional)
4. **Push** to GitHub.
5. **Run the workflow** manually from the Actions tab.

Your first digest will appear in `digests/` within minutes.

---

## Customizing an Agent

Open any agent file and edit the `CONFIG` object. Key fields:

| Key | Purpose |
|-----|---------|
| `FEEDS` | List of RSS URLs |
| `EXCLUDE_KEYWORDS` | Drop articles containing these terms |
| `RANK_CRITERIA` | Ordered priorities for Gemini |
| `INCLUDE_RULES` / `EXCLUDE_RULES` | Extra prompt instructions |
| `CATEGORIES` | Pipe‑separated labels |
| `THEME_COLOR` | Accent for HTML email |
| `TIME_WINDOW_HOURS` | How far back to look |
| `MIN_STORIES` / `MAX_STORIES` | Digest size |

### Using Your Own Feeds

You don't have to keep the default agents. To repurpose one:

1. Open an agent file (e.g. `index.js`).
2. Replace the `FEEDS` array with your own RSS URLs.
3. Tweak `RANK_CRITERIA` and other fields if you like.
4. Save and push.

Nosey will automatically fetch, deduplicate, rank, and deliver from your new sources.

---

## Email Setup (Optional)

1. Sign up at [Resend](https://resend.com/) and verify a domain.
2. Add `RESEND_API_KEY` and `EMAIL_TO` to GitHub secrets.
3. In the agent config, set `EMAIL_FROM` to a verified address.

No email? No problem — Nosey still saves Markdown digests.

---

## Cost Breakdown

| Service | Free Tier | Nosey Usage |
|---------|-----------|-------------|
| Gemini 2.5 Flash | 1,500 req/day | 1 req/agent/day |
| GitHub Actions | 2,000 min/month | ~1 min/run |
| Resend | 3,000 emails/month | up to 5/day |
| **Total** | — | **$0 / month** |

---

## Running All Agents

Edit `.github/workflows/daily-digest.yml` and add a step for each agent. Example:

<img src="/assets/Tnosey-tapping.png" align="right" />

```yaml
- name: Run Finance agent
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: node finance-agent.js
```
Repeat for `gold-agent.js`, `health-agent.js`, `edtech-agent.js`, etc.

**You can also locally test it by running the following**:

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
node index.js            # Tech
node finance-agent.js    # Finance
# ... etc.
```

Digests appear in `digests/`.

---

## Viewing Digests

- **Repository**: browse `digests/<agent>/YYYY-MM-DD.md`.
- **Email**: if configured, get a formatted newsletter.
- **Archive**: `digests/<agent>/README.md` lists all past editions.

---

## Contributing

PRs are welcome. Fork, branch, change, open a pull request. Bug reports and new agent configs are especially appreciated.

---

## License

MIT – do whatever you want with it.

---

## Support

- ⭐ the repo if you like it.
- 🐛 open an issue for bugs or questions.
- 📢 share your custom Nosey agents with the world.

