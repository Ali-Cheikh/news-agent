require("dotenv").config();
const { createAgent } = require("./core");

const CONFIG = {
  AGENT_NAME:        "Medicare & Health Brief",
  AGENT_EMOJI:       "🏥",
  THEME_COLOR:       "#f87171",
  DIGEST_DIR:        "digests/health",
  TIME_WINDOW_HOURS: 24,
  ITEMS_PER_FEED:    5,
  SNIPPET_LENGTH:    150,
  MODEL:             "gemini-2.5-flash",
  MAX_RETRIES:       3,
  MIN_STORIES:       3,
  MAX_STORIES:       10,
  EMAIL_FROM:        "contact@tccards.tn",
  IMPACT_VERBS:      "Expands / Approves / Reduces / Covers / Improves / Affects / Enables / Restricts",

  FEEDS: [
    "https://kffhealthnews.org/feed/",
    "https://www.statnews.com/feed/",
    "https://www.medpagetoday.com/rss/heretodaynews.rss",
    "https://www.modernhealthcare.com/section/rss",
    "https://feeds.reuters.com/reuters/healthNews",
    "https://www.fiercehealthcare.com/rss/xml",
    "https://www.healthline.com/rss/news",
    "https://www.cms.gov/rss/news-feed.rss",
  ],

  EXCLUDE_KEYWORDS: [
    "celebrity diet", "fitness trend", "beauty product",
    "sports injury", "entertainment", "lifestyle hack",
    "horoscope", "weight loss gimmick",
  ],

  CATEGORIES: "Medicare|Medicaid|FDA Approval|Drug Pricing|Clinical Trial|Insurance|Hospital|Mental Health|Policy|Research|Public Health|Other",

  RANK_CRITERIA: [
    "1. FDA drug or device approvals and rejections",
    "2. Medicare or Medicaid coverage changes affecting beneficiaries",
    "3. Drug pricing changes — Medicare negotiation, copay, out-of-pocket caps",
    "4. Major clinical trial results changing treatment standards",
    "5. Federal or major state healthcare policy decisions",
    "6. Hospital system mergers or closures affecting patient access",
    "7. Mental health parity, coverage expansions, or access changes",
  ].join("\n"),

  INCLUDE_RULES: [
    "- Directly affects patients, Medicare/Medicaid beneficiaries, or healthcare workers",
    "- Contains confirmed data: approvals, coverage decisions, or official statements",
    "- Published within the last 48 hours",
    "- Actionable health, coverage, or treatment information",
  ].join("\n"),

  EXCLUDE_RULES: [
    "- Generic wellness tips, diet fads, or fitness trends",
    "- Celebrity health without broader public health significance",
    "- Speculation without official confirmation or clinical evidence",
    "- Cosmetic or elective procedures without public health relevance",
    "- Sports injuries without systemic public health impact",
  ].join("\n"),
};

createAgent(CONFIG).run().catch(err => { console.error("Fatal:", err); process.exit(1); });