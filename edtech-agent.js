// edtech-agent.js — EdTech & AI Education Brief
// Run: node edtech-agent.js

require("dotenv").config();
const { createAgent } = require("./core");

const CONFIG = {
  AGENT_NAME:        "EdTech + AI Education Brief",
  AGENT_EMOJI:       "🎓",
  THEME_COLOR:       "#a78bfa",
  DIGEST_DIR:        "digests/edtech",
  TIME_WINDOW_HOURS: 24,
  ITEMS_PER_FEED:    5,
  SNIPPET_LENGTH:    150,
  MODEL:             "gemini-2.5-flash",
  MAX_RETRIES:       3,
  MIN_STORIES:       3,
  MAX_STORIES:       10,
  EMAIL_FROM:        "contact@tccards.tn",
  IMPACT_VERBS:      "Lets students / Helps teachers / Gives learners / Brings / Enables / Reduces / Expands",

  FEEDS: [
    "https://www.edsurge.com/feed",
    "https://www.edweek.org/ew/rss/latest.xml",
    "https://thejournal.com/rss-feeds/all-articles.aspx",
    "https://www.insidehighered.com/rss.xml",
    "https://eschoolnews.com/feed/",
    "https://techcrunch.com/tag/education/feed/",
    "https://www.educationdive.com/feeds/news/",
    "https://www.classcentral.com/report/feed/",
  ],

  EXCLUDE_KEYWORDS: [
    "sports score", "celebrity", "entertainment",
    "stock price", "fashion", "horoscope",
  ],

  CATEGORIES: "K-12|Higher Ed|AI Tools|LMS Platform|Policy|Research|Certification|Skills|Accessibility|International|Tutoring|Other",

  RANK_CRITERIA: [
    "1. New AI tools or features students and teachers can use right now",
    "2. Major platform launches or updates: Google Classroom, Canvas, Khan Academy, Duolingo",
    "3. Policy changes affecting access to education at federal, state, or district level",
    "4. Research findings on AI in education, learning outcomes, or equity",
    "5. New free certifications, skills programs, or open course announcements",
    "6. Accessibility improvements making education more inclusive",
    "7. International developments affecting global learners or institutions",
  ].join("\n"),

  INCLUDE_RULES: [
    "- Directly affects students, teachers, parents, or educational institutions",
    "- About a specific tool, platform, policy decision, or research result",
    "- Published within the last 48 hours",
    "- Has concrete details: launch date, grade level, institution, or pricing",
  ].join("\n"),

  EXCLUDE_RULES: [
    "- Funding rounds with no product or feature announcement",
    "- Pure opinion with no new data, tool, or policy announcement",
    "- Sports, celebrity, entertainment, lifestyle",
    "- Rumors without official confirmation from institution or company",
  ].join("\n"),
};

createAgent(CONFIG).run().catch(err => { console.error("Fatal:", err); process.exit(1); });