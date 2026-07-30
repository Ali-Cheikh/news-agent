// index.js — Consumer Tech Digest
// Run: node index.js

require("dotenv").config();
const { createAgent } = require("./core");

// ══════════════════════════════════════════════════════════
//  CONTROLS — only edit this block
// ══════════════════════════════════════════════════════════
const CONFIG = {
  AGENT_NAME:        "Daily Tech Digest",
  AGENT_EMOJI:       "🌐",
  THEME_COLOR:       "#22d3ee",
  DIGEST_DIR:        "digests/tech",
  TIME_WINDOW_HOURS: 24,
  ITEMS_PER_FEED:    10,
  SNIPPET_LENGTH:    400,
  MODEL:             "gemini-2.5-flash",
  MAX_RETRIES:       3,
  MIN_STORIES:       3,
  MAX_STORIES:       15,
  EMAIL_FROM:        "contact@tccards.tn",
  IMPACT_VERBS:      "Lets / Makes / Gives / Cuts / Adds / Brings",

  FEEDS: [
    "https://www.theverge.com/rss/index.xml",
    "https://www.engadget.com/rss.xml",
    "https://feeds.arstechnica.com/arstechnica/index",
    "https://techcrunch.com/feed/",
    "https://www.wired.com/feed/rss",
    "https://gizmodo.com/rss",
    "https://www.cnet.com/rss/news/",
    "https://feeds.feedburner.com/AndroidAuthority",
    "https://9to5mac.com/feed/",
    "https://9to5google.com/feed/",
  ],

  EXCLUDE_KEYWORDS: [
    "earnings", "quarterly results", "ipo", "acquires", "acquisition",
    "funding round", "series a", "series b", "valuation",
    "sec filing", "antitrust", "lawsuit", "layoffs", "laid off",
    "shares rose", "shares fell", "market cap", "analyst rating",
    "patent", "trademark", "merger",
  ],

  CATEGORIES: "Smartphone|Laptop|Tablet|AI|Gaming|Chip|Wearable|Software|Auto|Home|Camera|Audio|Other",

  RANK_CRITERIA: [
    "1. Major product launches with confirmed specs and price",
    "2. Major OS or platform releases available to download now",
    "3. AI tools or features consumers can use today",
    "4. Hardware announcements with confirmed ship dates",
    "5. Software features rolling out now",
    "6. Everything else",
  ].join("\n"),

  INCLUDE_RULES: [
    "- Directly affects everyday consumers, not businesses",
    "- Real product or feature someone can buy, use, or download",
    "- Announced or released within the last 48 hours",
    "- Has concrete details: specs, price, release date, or demo",
  ].join("\n"),

  EXCLUDE_RULES: [
    "- Business: acquisitions, earnings, IPO, funding, layoffs",
    "- Legal: lawsuits, regulation, antitrust",
    "- Speculation: reportedly, could, might, leaked, patents",
    "- Crypto / NFT / blockchain",
    "- Pure enterprise or B2B with no consumer version",
  ].join("\n"),
};
// ══════════════════════════════════════════════════════════

createAgent(CONFIG).run().catch(err => { console.error("Fatal:", err); process.exit(1); });