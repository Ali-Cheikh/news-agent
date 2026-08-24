require("dotenv").config();
const { createAgent } = require("./core");

const CONFIG = {
  AGENT_NAME:        "Commodities & Metals Brief",
  AGENT_EMOJI:       "🥇",
  THEME_COLOR:       "#fbbf24",
  DIGEST_DIR:        "digests/commodities",
  TIME_WINDOW_HOURS: 24,
  ITEMS_PER_FEED:    5,
  SNIPPET_LENGTH:    150,
  MODEL:             "gemini-2.5-flash",
  MAX_RETRIES:       3,
  MIN_STORIES:       3,
  MAX_STORIES:       10,
  EMAIL_FROM:        "contact@tccards.tn",
  IMPACT_VERBS:      "Pushes / Signals / Drives / Supports / Pressures / Lifts / Weighs on",

  FEEDS: [
    "https://www.kitco.com/rss/kitco-news.rss",
    "https://www.mining.com/feed/",
    "https://www.resourceworld.com/feed/",
    "https://feeds.reuters.com/reuters/businessNews",
    "https://oilprice.com/rss/main",
    "https://silverseek.com/rss.xml",
    "https://www.miningweekly.com/rss",
    "https://www.gold.org/news-and-events/press-releases/rss",
  ],

  EXCLUDE_KEYWORDS: [
    "celebrity", "entertainment", "sports", "lifestyle",
    "smartphone", "laptop", "gaming", "software app",
    "fashion", "travel",
  ],

  CATEGORIES: "Gold|Silver|Copper|Lithium|Uranium|Iron|Oil|Gas|Mining|Trading|Macro|Policy|Other",

  RANK_CRITERIA: [
    "1. Spot gold or silver price moves with confirmed data and context",
    "2. Central bank gold buying, selling, or reserve changes",
    "3. Major mining project announcements, discoveries, or shutdowns",
    "4. Production or supply disruptions affecting metal availability",
    "5. Geopolitical events directly impacting commodity supply chains",
    "6. Energy metals news: lithium, copper, uranium supply and demand",
    "7. Macro data affecting precious metals: inflation, dollar, rate expectations",
  ].join("\n"),

  INCLUDE_RULES: [
    "- Directly affects gold, silver, minerals, or energy metals markets",
    "- Contains confirmed prices, volumes, production data, or official statements",
    "- Published within the last 24 hours",
    "- Relevant to traders, mining professionals, or precious metals investors",
  ].join("\n"),

  EXCLUDE_RULES: [
    "- Consumer tech, software, lifestyle, entertainment",
    "- Equity markets unrelated to mining or commodities",
    "- Generic opinion with no supporting data or source",
    "- Crypto (unless directly tied to gold-backed tokens with price data)",
  ].join("\n"),
};

createAgent(CONFIG).run().catch(err => { console.error("Fatal:", err); process.exit(1); });