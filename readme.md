# 🧠 Agent Suite

> **5 AI agents. 10+ RSS feeds each. 1 shared engine. $0 / month.**

This repository can runs **Every independent AI‑powered digest agents** that fetch, deduplicate, and rank the day’s most important stories — all automatically, every day, for free using GitHub Actions and Google Gemini 2.5 Flash.

---

## ✨ What’s Currently Inside

| Agent | File | Covers |
|-------|------|--------|
| 🌐 **Tech** | `index.js` | Consumer tech, gadgets, AI tools, software releases, hardware |
| 💹 **Finance** | `finance-agent.js` | Markets, central banks, earnings, macro economics, FX |
| 🥇 **Gold & Commodities** | `gold-agent.js` | Precious metals, mining, oil, gas, critical minerals |
| 🏥 **Health & Medicare** | `health-agent.js` | FDA approvals, drug pricing, Medicare/Medicaid, clinical trials |
| 🎓 **EdTech** | `edtech-agent.js` | AI in education, LMS platforms, policy, research, certifications |

Each agent runs independently — you can use one, two, or all five.
Creating an agent is simply pointing it to where it should get the info.

---

## 🚀 Key Features

- **🧹 Smart Deduplication** – Groups similar stories from multiple outlets using Jaccard similarity.
- **🤖 AI Ranking** – Gemini 2.5 Flash selects the most important 8–15 stories based on your criteria.
- **📧 HTML Email** – Beautiful, responsive email sent directly to your inbox (via Resend — optional).
- **📄 Markdown Archive** – Every digest is saved as a dated `.md` file, automatically committed to the repo.
- **📚 Auto‑Generated Index** – Each agent maintains its own `README.md` archive with links to every past edition.
- **🔧 Fully Customizable** – Edit feeds, keywords, ranking rules, and themes — no coding required beyond basic config.
- **🆓 Completely Free** – Gemini free tier + GitHub Actions free tier + Resend free tier = **$0/month**.

---

## 📦 Repository Structure

```
agent-suite/
├── core.js                     # Shared engine (dedup, RSS fetch, Gemini, email)
│
├── index.js                    # Tech agent (config only)
├── finance-agent.js            # Finance agent (config only)
├── gold-agent.js               # Gold & commodities agent (config only)
├── health-agent.js             # Health agent (config only)
├── edtech-agent.js             # EdTech agent (config only)
│
├── package.json                # Dependencies
├── .github/
│   ├── dependabot.yml          # Auto‑update dependencies weekly
│   └── workflows/
│       └── daily-digest.yml    # GitHub Actions schedule
│
└── digests/                    # Auto‑created on first run
    ├── tech/
    ├── finance/
    ├── commodities/
    ├── health/
    └── edtech/
```

---

## ⚡ Quick Start (5 Minutes)

1. **Clone or fork this repository**.
2. **Get a Gemini API key** – free from [Google AI Studio](https://aistudio.google.com/).
3. **Add secrets** in your GitHub repo:
   - `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
   - Add `GEMINI_API_KEY` (required).
   - (Optional) Add `RESEND_API_KEY` and `EMAIL_TO` for email delivery.
4. **Push the code** to GitHub.
5. **Run it** – Go to the `Actions` tab, select the workflow, and click `Run workflow`.

That's it. The first digest will be committed to `digests/tech/` within a minute.

---

## 📝 Customizing an Agent

Each agent is just a `CONFIG` object. Open any agent file (e.g., `index.js`) and edit these fields:

| Key | What it does |
|-----|--------------|
| `FEEDS` | Array of RSS feed URLs to fetch |
| `EXCLUDE_KEYWORDS` | Drop any article containing these words |
| `RANK_CRITERIA` | Ordered list of what Gemini should prioritise |
| `INCLUDE_RULES` / `EXCLUDE_RULES` | Prompt rules for story selection |
| `CATEGORIES` | Pipe‑separated list for labelling stories |
| `THEME_COLOR` | Accent colour for HTML emails |
| `TIME_WINDOW_HOURS` | How far back to look (24h, 48h, etc.) |
| `MIN_STORIES` / `MAX_STORIES` | Output bounds |

> **No need to touch `core.js`** – it's the shared engine and works for all agents.

---

## 📧 Email Setup (Optional)

1. Sign up at [Resend](https://resend.com/) (free tier: 3,000 emails/month).
2. Verify a domain.
3. Add `RESEND_API_KEY` and `EMAIL_TO` to your GitHub secrets.
4. In the agent config, set `EMAIL_FROM` to a verified address (e.g., `"Tech Digest <digest@yourdomain.com>"`).

If you skip email, the agents will still write markdown files to the repo – no other changes needed.

---

## 💰 Cost Breakdown

| Service | Free Tier | Usage for this project |
|---------|-----------|------------------------|
| Google Gemini 2.5 Flash | 1,500 requests/day | 1 request per agent per day |
| GitHub Actions | 2,000 min/month | ~1 min per run |
| Resend | 3,000 emails/month | Up to 5 per day |
| **Total** | **$0** | **$0 / month** |

---

## 🔁 Running All Five Agents

The default workflow runs only the **Tech** agent. To run all five:

1. Edit `.github/workflows/daily-digest.yml`.
2. Add a new `- name: Run ...` step for each agent, or copy the [full workflow from the setup guide](https://github.com/your-repo/agent-suite?tab=readme-ov-file#9-advanced-running-all-agents-in-one-workflow).
3. Commit and push.

Each agent writes to its own folder, and a single commit includes all digests.

---

## 🧪 Test Locally

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
node index.js          # Tech
# or
node finance-agent.js  # Finance
# etc.
```

The generated `.md` files will appear in `digests/`. The console logs every step.

---

## 📖 Read the Digests

- **In the repo** – browse to `digests/tech/2026-07-30.md`.
- **By email** – if configured, you'll receive a clean HTML newsletter each morning.
- **Archive** – `digests/tech/README.md` lists every past edition.

---

## 🤝 Contributing

Found a broken feed? Want to add a new agent? Pull requests are welcome.

1. Fork the repo.
2. Create a branch.
3. Make your changes.
4. Open a PR.

---

## 📄 License

MIT — use it, modify it, sell it, or just enjoy your daily digests.

---

## 🌟 Support

- ⭐ Star the repo if you find it useful.
- 🐛 Open an issue for bugs or questions.
- 💬 Share your customised agents with the community.
