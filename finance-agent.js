require("dotenv").config();
const { createAgent } = require("./core");

const CONFIG = {
  AGENT_NAME:        "Finance Brief",
  AGENT_EMOJI:       "💹",
  THEME_COLOR:       "#34d399",
  DIGEST_DIR:        "digests/finance",
  TIME_WINDOW_HOURS: 24,
  ITEMS_PER_FEED:    5,
  SNIPPET_LENGTH:    150,
  MODEL:             "gemini-2.5-flash",
  MAX_RETRIES:       3,
  MIN_STORIES:       3,
  MAX_STORIES:       10,
  EMAIL_FROM:        "contact@tccards.tn",
  IMPACT_VERBS:      "Moves / Signals / Pushes / Cuts / Raises / Affects / Shifts",

  FEEDS: [
    "https://feeds.reuters.com/reuters/businessNews",
    "https://feeds.reuters.com/reuters/topNews",
    "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    "https://feeds.marketwatch.com/marketwatch/topstories/",
    "https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_articles",
    "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
    "https://www.ft.com/rss/home/us",
    "https://finance.yahoo.com/news/rssindex",
  ],

  // Finance WANTS earnings, rates, moves — only exclude irrelevant lifestyle
  EXCLUDE_KEYWORDS: [
    "celebrity", "entertainment", "sports score", "lifestyle",
    "fashion", "food recipe", "travel guide", "horoscope",
  ],

  CATEGORIES: "Markets|Macro|Earnings|Rates|Commodities|FX|Banking|Real Estate|Policy|Crypto|Tech|Other",

  RANK_CRITERIA: [
    "1. Central bank decisions and rate changes (Fed, ECB, BoE, BoJ)",
    "2. Major market moves — index moves >1%, major sector rotation",
    "3. Significant earnings beats or misses from large-cap companies",
    "4. Key economic data releases: CPI, jobs report, GDP, PMI",
    "5. Major commodity moves: oil, gold, metals >2%",
    "6. Currency and FX developments, geopolitical market impact",
    "7. Regulatory changes directly affecting financial markets",
  ].join("\n"),

  INCLUDE_RULES: [
    "- Directly affects financial markets, investors, or household finances",
    "- Contains confirmed numbers, rates, prices, or official statements",
    "- Published within the last 24 hours",
    "- Actionable or market-moving — not generic commentary",
  ].join("\n"),

  EXCLUDE_RULES: [
    "- Celebrity news, sports, entertainment, lifestyle",
    "- Pure opinion with no new data or official statements",
    "- Rumors or speculation without confirmed sources",
    "- Travel, food, fashion, horoscopes",
  ].join("\n"),
};

createAgent(CONFIG).run().catch(err => { console.error("Fatal:", err); process.exit(1); });