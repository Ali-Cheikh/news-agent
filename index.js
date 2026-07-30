// index.js — Daily Tech Digest Bot
// Gemini 2.5 Flash + RSS · $0/month

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Parser  = require("rss-parser");
const { Resend } = require("resend");
const fs      = require("fs");
const path    = require("path");

const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model  = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const parser = new Parser();
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FEEDS = [
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
];

async function fetchRSS() {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const items  = [];
  for (const url of FEEDS) {
    try {
      const feed   = await parser.parseURL(url);
      const recent = feed.items
        .filter(i => i.pubDate && new Date(i.pubDate) > cutoff)
        .slice(0, 8)
        .map(i => `[${feed.title}] ${i.title}: ${
          (i.contentSnippet || i.summary || "").slice(0, 200)
        }`);
      items.push(...recent);
      console.log(`  ✓ ${feed.title} (${recent.length})`);
    } catch (e) {
      console.warn(`  ✗ ${url}: ${e.message}`);
    }
  }
  return items;
}

async function analyzeNews(raw, date) {
  const prompt = `Today is ${date}.

From the RSS headlines below (last 48h), pick the top 10-15 consumer-facing tech stories.

STRICT FILTER:
✓ phones, laptops, AI tools, chips, wearables, gaming, smart home, software features
✓ newly announced, released, shipping, or revealed
✗ EXCLUDE: enterprise/B2B, earnings, hiring, patents, crypto, rumors, gov investigations

Headlines:
${raw.join("\n")}

Return ONLY a valid JSON array — no markdown, no backticks, no preamble. Each object:
{
  "headline": "8 words max punchy title",
  "summary": "18 words max",
  "category": "Smartphone|Laptop|AI|Gaming|Chip|Wearable|Software|Auto|Home",
  "source": "outlet name",
  "why_it_matters": "one sentence consumer impact"
}`;

  for (let i = 1; i <= 3; i++) {
    try {
      const res  = await model.generateContent(prompt);
      const text = res.response.text().replace(/```(?:json)?/g, "").trim();
      return JSON.parse(text);
    } catch (e) {
      console.warn(`  Gemini attempt ${i} failed: ${e.message}`);
      if (i === 3) throw e;
      await new Promise(r => setTimeout(r, 2000 * i));
    }
  }
}

function buildHTML(stories, date) {
  const clr = {
    AI:"#22d3ee", Smartphone:"#a78bfa", Laptop:"#93c5fd",
    Gaming:"#34d399", Chip:"#f87171", Software:"#fbbf24",
    Wearable:"#f472b6", Auto:"#fb923c", Home:"#4ade80"
  };
  const rows = stories.map((s, i) => `
    <tr>
      <td style="padding:4px 12px;border-bottom:1px solid #1e2230;color:#2a3050;font-size:11px;vertical-align:top;">${i + 1}</td>
      <td style="padding:11px 16px;border-bottom:1px solid #1e2230;vertical-align:top;">
        <strong style="color:#d4dcf0;font-size:13px;">${s.headline}</strong><br>
        <span style="color:#8892a4;font-size:11px;margin-top:2px;display:block;">${s.summary}</span>
        <span style="color:#3a4468;font-size:10px;margin-top:4px;display:block;">💡 ${s.why_it_matters}</span>
      </td>
      <td style="padding:11px 10px;border-bottom:1px solid #1e2230;vertical-align:top;white-space:nowrap;">
        <span style="background:#1a1e2a;color:${clr[s.category] || "#8892a4"};border:1px solid #2a2e3e;border-radius:10px;padding:2px 7px;font-size:10px;font-weight:700;">${s.category}</span>
      </td>
      <td style="padding:11px 10px;border-bottom:1px solid #1e2230;vertical-align:top;color:#3a4468;font-size:10px;">${s.source}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="background:#0d0f14;margin:0;padding:24px 16px;font-family:system-ui,sans-serif;">
  <div style="max-width:680px;margin:0 auto;">
    <h1 style="color:#fff;font-size:18px;margin-bottom:4px;">🌐 Daily Tech Digest</h1>
    <p style="color:#4a5470;font-size:12px;margin-bottom:20px;">${date} · ${stories.length} stories · Gemini 2.5 Flash + RSS</p>
    <table style="width:100%;border-collapse:collapse;background:#13161e;border-radius:8px;overflow:hidden;">
      <thead><tr>
        <th style="background:#0f1220;color:#2a3050;font-size:9px;padding:8px 12px;text-align:left;">#</th>
        <th style="background:#0f1220;color:#2a3050;font-size:9px;padding:8px 16px;text-align:left;">STORY</th>
        <th style="background:#0f1220;color:#2a3050;font-size:9px;padding:8px 10px;text-align:left;">CAT</th>
        <th style="background:#0f1220;color:#2a3050;font-size:9px;padding:8px 10px;text-align:left;">SOURCE</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="color:#1a2040;font-size:10px;margin-top:14px;text-align:center;">
      auto-committed daily via GitHub Actions
    </p>
  </div>
</body></html>`;
}

function buildMarkdown(stories, date, slug) {
  return `# Tech Digest — ${date}\n\n` +
    `> Gemini 2.5 Flash + RSS · ${slug}\n\n` +
    `| # | Headline | Summary | Category | Source | Why It Matters |\n` +
    `|---|----------|---------|----------|--------|----------------|\n` +
    stories.map((s, i) =>
      `| ${i+1} | ${s.headline} | ${s.summary} | ${s.category} | ${s.source} | ${s.why_it_matters} |`
    ).join("\n") + "\n";
}

function updateIndex(date, slug) {
  const idxPath = path.join("digests", "README.md");
  const header  = "# 📰 Tech Digest Archive\n\n";
  const existing = fs.existsSync(idxPath)
    ? fs.readFileSync(idxPath, "utf8")
    : header;
  if (existing.includes(slug)) return;
  fs.writeFileSync(idxPath, existing + `- [${date}](./${slug}.md)\n`);
}

async function run() {
  const date = new Date().toLocaleDateString("en-US", {
    weekday:"long", month:"long", day:"numeric", year:"numeric"
  });
  const slug = new Date().toISOString().split("T")[0];

  console.log(`\n🌐 Tech Digest — ${date}\n`);

  console.log("📡 Fetching RSS...");
  const raw = await fetchRSS();
  console.log(`   ${raw.length} raw headlines\n`);

  console.log("🤖 Gemini analyzing...");
  const stories = await analyzeNews(raw, date);
  console.log(`   ${stories.length} stories selected\n`);

  if (resend && process.env.EMAIL_TO) {
    console.log("📧 Sending email...");
    const { data, error } = await resend.emails.send({
      from:    "Tech Digest <digest@yourdomain.com>",
      to:      process.env.EMAIL_TO.split(","),
      subject: `🌐 Tech Digest — ${date}`,
      html:    buildHTML(stories, date),
    });
    if (error) console.error("   Email error:", error);
    else        console.log(`   ✓ Sent ${data.id}\n`);
  }

  fs.mkdirSync("digests", { recursive: true });
  const outPath = path.join("digests", `${slug}.md`);
  fs.writeFileSync(outPath, buildMarkdown(stories, date, slug));
  console.log(`📄 Written → ${outPath}`);

  updateIndex(date, slug);
  console.log("\n✅ Done!\n");
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });