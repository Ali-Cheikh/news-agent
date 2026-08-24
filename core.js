const { GoogleGenerativeAI } = require("@google/generative-ai");
const Parser                 = require("rss-parser");
const { Resend }             = require("resend");
const fs                     = require("fs");
const path                   = require("path");

function createAgent(CONFIG) {
  const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model  = genAI.getGenerativeModel({ model: CONFIG.MODEL || "gemini-2.5-flash" });
  const parser = new Parser();
  const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY) : null;

  // RSS Fetch 
  async function fetchRSS() {
    const cutoff = Date.now() - (CONFIG.TIME_WINDOW_HOURS || 48) * 3600000;
    const items  = [];
    for (const url of CONFIG.FEEDS) {
      try {
        const feed   = await parser.parseURL(url);
        const recent = feed.items
          .filter(i => i.pubDate && new Date(i.pubDate) > cutoff)
          .slice(0, CONFIG.ITEMS_PER_FEED || 10)
          .map(i => ({
            title:   (i.title   || "").trim(),
            source:  feed.title,
            pubDate: i.pubDate,
            link:    i.link || "",
            snippet: (i.contentSnippet || i.summary || "")
                       .slice(0, CONFIG.SNIPPET_LENGTH || 350).trim(),
          }));
        items.push(...recent);
        console.log("  ✓ " + feed.title + " (" + recent.length + ")");
      } catch (e) { console.warn("  ✗ " + url + ": " + e.message); }
    }
    return items;
  }

  // Filter - presetting harcoded filter ;)
  function preFilter(items) {
    const kw     = (CONFIG.EXCLUDE_KEYWORDS || []).map(k => k.toLowerCase());
    const before = items.length;
    const out    = kw.length
      ? items.filter(i => !kw.some(k => (i.title + " " + i.snippet).toLowerCase().includes(k)))
      : items;
    console.log("  Pre-filter: " + before + " → " + out.length + " (−" + (before - out.length) + ")");
    return out;
  }

  // Dups remover and jokers ditector, sort by source count
  function wordSet(s) {
    return new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(w=>w.length>3));
  }
  function jaccard(a, b) {
    const sA = wordSet(a), sB = wordSet(b);
    if (!sA.size && !sB.size) return 1;
    return [...sA].filter(w => sB.has(w)).length / new Set([...sA,...sB]).size;
  }
  function deduplicate(items) {
    const groups = [];
    for (const item of items) {
      const match = groups.find(g => jaccard(item.title, g.title) >= 0.45);
      if (match) {
        match.sources.add(item.source);
        if (item.snippet) match.snippets.push(item.snippet);
      } else {
        groups.push({ title: item.title, link: item.link, pubDate: item.pubDate,
          sources: new Set([item.source]),
          snippets: item.snippet ? [item.snippet] : [] });
      }
    }
    // Most-covered stories first
    return groups.sort((a, b) => b.sources.size - a.sources.size);
  }

  // prompt Builder (can be prettier)
  function buildPromptInput(groups) {
    return groups.map((g, i) => {
      const src = g.sources.size > 1
        ? "[" + g.sources.size + " outlets: " + [...g.sources].join(", ") + "]"
        : "[" + [...g.sources][0] + "]";
      return (i+1) + ". " + g.title + "\n   " + src + "\n   " + (g.snippets[0] || "(no snippet)");
    }).join("\n\n");
  }

  // let GEM give us its opinion
  async function analyzeNews(groups, rawCount, date) {
    const MIN = CONFIG.MIN_STORIES || 8;
    const MAX = CONFIG.MAX_STORIES || 12;
    const prompt = [
      "You are a senior " + CONFIG.AGENT_NAME + " editor. Today is " + date + ".",
      groups.length + " unique stories deduplicated from " + rawCount + " RSS entries.",
      "Stories with more outlets are more newsworthy.\n",
      "TASK: Select " + MIN + "–" + MAX + " most important stories, ranked #1 first.\n",
      "RANKING CRITERIA:\n" + CONFIG.RANK_CRITERIA + "\n",
      "INCLUDE (story must meet ALL):\n" + CONFIG.INCLUDE_RULES + "\n",
      "EXCLUDE (any of these = skip immediately):\n" + CONFIG.EXCLUDE_RULES + "\n",
      "RULES:",
      "- Base decisions ONLY on information in the snippets.",
      "- If you are unsure, leave the story out rather than guess.",
      "- Headlines: present tense, max 8 words, no 'reportedly/could/might/leaked'.",
      "- Summaries: max 15 words, state what happened, not what might happen.",
      "- why_it_matters: must start with a verb — " + (CONFIG.IMPACT_VERBS || "Lets / Makes / Gives / Cuts / Adds") + ".\n",
      "STORIES:\n" + buildPromptInput(groups) + "\n",
      "OUTPUT — critical: return ONLY a JSON array. Start with [ and end with ].",
      "No markdown. No backticks. No explanation. No text before or after.",
      'Schema: {"rank":1,"headline":"...","summary":"...","category":"' + CONFIG.CATEGORIES + '","source":"outlet","link":"https://...","source_count":2,"why_it_matters":"verb..."}',
    ].join("\n");

    const MAX_R = CONFIG.MAX_RETRIES || 3;
    for (let i = 1; i <= MAX_R; i++) {
      try {
        const res   = await model.generateContent(prompt);
        const text  = res.response.text().replace(/\`\`\`(?:json)?/g, "").trim();
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) throw new Error("No JSON array found in response");
        return JSON.parse(match[0]);
      } catch (e) {
        console.warn("  Attempt " + i + " failed: " + e.message);
        if (i === MAX_R) throw e;
        await new Promise(r => setTimeout(r, 2000 * i));
      }
    }
  }

  // HTML Email Builder
  function buildHTML(stories, date) {
    const top = stories[0];
    const tc  = CONFIG.THEME_COLOR || "#8892a4";

    const topBlock =
      '<div style="background:#111620;border:1px solid #2a3050;border-radius:10px;padding:16px 18px;margin-bottom:18px;">' +
      '<div style="font-size:9px;font-weight:700;color:' + tc + ';letter-spacing:.1em;margin-bottom:7px;">🔥 TOP STORY TODAY</div>' +
      '<a href="' + top.link + '" style="text-decoration:none;">' +
      '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:5px;">' + top.headline + '</div></a>' +
      '<div style="font-size:11px;color:#8892a4;margin-bottom:7px;">' + top.summary + '</div>' +
      '<div style="font-size:10px;color:#3a4468;">💡 ' + top.why_it_matters + '</div>' +
      (top.source_count > 1 ? '<div style="font-size:9px;color:#2a3a50;margin-top:6px;">' + top.source_count + ' outlets</div>' : '') +
      '</div>';

    const rows = stories.slice(1).map((s, i) =>
      '<tr>' +
      '<td style="padding:4px 10px;border-bottom:1px solid #1e2230;color:#2a3050;font-size:10px;vertical-align:top;">' + (i+2) + '</td>' +
      '<td style="padding:9px 14px;border-bottom:1px solid #1e2230;vertical-align:top;">' +
      '<a href="' + s.link + '" style="text-decoration:none;"><strong style="color:#d4dcf0;font-size:12px;">' + s.headline + '</strong></a><br>' +
      '<span style="color:#8892a4;font-size:11px;">' + s.summary + '</span><br>' +
      '<span style="color:#3a4468;font-size:10px;">💡 ' + s.why_it_matters + '</span></td>' +
      '<td style="padding:9px 8px;border-bottom:1px solid #1e2230;white-space:nowrap;vertical-align:top;">' +
      '<span style="background:#1a1e2a;color:' + tc + ';border:1px solid #2a2e3e;border-radius:8px;padding:2px 6px;font-size:9px;font-weight:700;">' + s.category + '</span>' +
      (s.source_count > 1 ? '<div style="font-size:8px;color:#2a3a50;">' + s.source_count + '×</div>' : '') +
      '</td>' +
      '<td style="padding:9px 8px;border-bottom:1px solid #1e2230;color:#2a3468;font-size:9px;">' + s.source + '</td>' +
      '</tr>'
    ).join("");

    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
      '<body style="background:#0d0f14;margin:0;padding:20px 14px;font-family:system-ui,sans-serif;">' +
      '<div style="max-width:680px;margin:0 auto;">' +
      '<h1 style="color:#fff;font-size:17px;margin-bottom:3px;">' + CONFIG.AGENT_EMOJI + ' ' + CONFIG.AGENT_NAME + '</h1>' +
      '<p style="color:#3a4468;font-size:10px;margin-bottom:16px;">' + date + ' · ' + stories.length + ' stories · Gemini</p>' +
      topBlock +
      '<table style="width:100%;border-collapse:collapse;background:#13161e;border-radius:8px;overflow:hidden;">' +
      '<thead><tr>' +
      '<th style="background:#0f1220;color:#1e2640;font-size:8px;padding:7px 10px;text-align:left;">#</th>' +
      '<th style="background:#0f1220;color:#1e2640;font-size:8px;padding:7px 14px;text-align:left;">STORY</th>' +
      '<th style="background:#0f1220;color:#1e2640;font-size:8px;padding:7px 8px;text-align:left;">CAT</th>' +
      '<th style="background:#0f1220;color:#1e2640;font-size:8px;padding:7px 8px;text-align:left;">SOURCE</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p style="color:#1a2040;font-size:9px;margin-top:12px;text-align:center;">auto-committed daily · Gemini 2.5 Flash + RSS</p>' +
      '</div></body></html>';
  }

  // Markdown Files Builder
  function buildMarkdown(stories, date, slug) {
    const top  = stories[0];
    const rows = stories.map((s, i) =>
      "| " + (i+1) + " | [" + s.headline + "](" + s.link + ") | " + s.summary +
      " | " + s.category + " | " + (s.source_count > 1 ? s.source_count + " outlets" : s.source) +
      " | " + s.why_it_matters + " |"
    ).join("\n");
    return "# " + CONFIG.AGENT_EMOJI + " " + CONFIG.AGENT_NAME + " — " + date + "\n\n" +
      "> " + stories.length + " stories · " + slug + "\n\n" +
      "## 🔥 Top Story\n\n" +
      "**[" + top.headline + "](" + top.link + ")**  \n" +
      top.summary + "  \n💡 " + top.why_it_matters + "\n\n---\n\n" +
      "| # | Headline | Summary | Category | Sources | Why It Matters |\n" +
      "|---|----------|---------|----------|---------|----------------|\n" +
      rows + "\n";
  }

  // pretty styling
  function updateIndex(date, slug, count) {
    const dir = CONFIG.DIGEST_DIR || "digests";
    const p   = path.join(dir, "README.md");
    const h   = "# " + CONFIG.AGENT_EMOJI + " " + CONFIG.AGENT_NAME + " — Archive\n\n";
    const e   = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : h;
    if (!e.includes(slug))
      fs.writeFileSync(p, e + "- [" + date + "](./" + slug + ".md) — " + count + " stories\n");
  }

  // the supreme exe 
  async function run() {
    const date = new Date().toLocaleDateString("en-US",
      { weekday:"long", month:"long", day:"numeric", year:"numeric" });
    const slug = new Date().toISOString().split("T")[0];

    console.log("\n" + CONFIG.AGENT_EMOJI + "  " + CONFIG.AGENT_NAME + " — " + date + "\n");

    console.log("📡 Fetching RSS...");
    const raw = await fetchRSS();
    console.log("   " + raw.length + " raw articles\n");

    console.log("🧹 Pre-filtering...");
    const filtered = preFilter(raw);
    console.log();

    console.log("🔗 Deduplicating...");
    const deduped = deduplicate(filtered);
    const multi   = deduped.filter(g => g.sources.size > 1).length;
    console.log("   " + deduped.length + " unique topics · " + multi + " covered by 2+ outlets\n");

    console.log("🤖 Gemini analyzing...");
    const stories = await analyzeNews(deduped, raw.length, date);
    console.log("   " + stories.length + " stories selected\n");

    if (resend && process.env.EMAIL_TO) {
      console.log("📧 Sending email...");
      const from = CONFIG.EMAIL_FROM || (CONFIG.AGENT_NAME + " news@tccards.tn");
      const { data, error } = await resend.emails.send({
        from, to: process.env.EMAIL_TO.split(","),
        subject: CONFIG.AGENT_EMOJI + " " + CONFIG.AGENT_NAME + " — " + date,
        html: buildHTML(stories, date),
      });
      if (error) console.error("   Email error:", error);
      else        console.log("   ✓ Sent " + data.id + "\n");
    }

    const dir = CONFIG.DIGEST_DIR || "digests";
    fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, slug + ".md");
    fs.writeFileSync(outPath, buildMarkdown(stories, date, slug));
    console.log("📄 Written → " + outPath);
    updateIndex(date, slug, stories.length);
    console.log("\n✅ Done! " + stories.length + " stories · " + deduped.length + " unique · " + raw.length + " fetched\n");
  }

  return { run };
}

module.exports = { createAgent };