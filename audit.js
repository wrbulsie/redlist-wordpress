const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");
const headers = { Authorization: `Basic ${credentials}` };

const ENTRIES = [
  { id: 9222,  slug: "preventive-maintenance-pm" },
  { id: 9547,  slug: "condition-based-maintenance-cbm" },
  { id: 9202,  slug: "mean-time-between-failures-mtbf" },
  { id: 13057, slug: "maintenance-repair-and-operations-mro" },
  { id: 9207,  slug: "predictive-maintenance-pdm" },
  { id: 16464, slug: "maintenance-sop-standard-operating-procedure" },
  { id: 5665,  slug: "computerized-maintenance-management-system" },
  { id: 9224,  slug: "overall-equipment-effectiveness-oee" },
  { id: 9255,  slug: "failure-mode-and-effects-analysis-fmea" },
  { id: 9920,  slug: "asset-criticality-ranking-acr" },
  { id: 10981, slug: "preventive-maintenance-compliance-pmc" },
  { id: 11114, slug: "spalling" },
  { id: 13225, slug: "pao-oil-polyalphaolefin" },
  { id: 12900, slug: "corrective-maintenance-cm" },
  { id: 10415, slug: "mean-time-to-repair-mttr" },
  { id: 9399, slug: "total-productive-maintenance-tpm" },
  { id: 9517, slug: "reliability-centered-maintenance-rcm" },
];

const REQUIRED_ANCHORS = [
  "why-it-matters",
  "how-it-works",
  "by-industry",
  "common-failures",
  "vs-other-strategies",
  "faq",
  "related-terms",
  "cta",
];

const INDUSTRY_SLUGS = [
  "manufacturing/",
  "mining/",
  "oil-and-gas/",
  "crane-and-rigging/",
];

const SOLUTION_PILLARS = [
  "getredlist.com/cmms/",
  "getredlist.com/enterprise-asset-management/",
  "getredlist.com/lubrication-management/",
];

const SUNSET_SLUGS = [
  "health-safety-environmental",
  "field-service-management",
];

const FORBIDDEN_PHRASES = [
  "our cmms",
  "we believe",
  "click here",
  "learn more",
  "streamline your",
  "best-in-class",
];

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function wordCount(html) {
  return stripTags(html).split(/\s+/).filter(Boolean).length;
}

function getIds(html) {
  const ids = [];
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.push(m[1]);
  return ids;
}

function getLinks(html) {
  // Returns array of { href, target, rel, text }
  const links = [];
  for (const m of html.matchAll(/<a\s([^>]+)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1];
    const hrefM  = attrs.match(/href="([^"]+)"/);
    const targetM = attrs.match(/target="([^"]+)"/);
    const relM   = attrs.match(/rel="([^"]+)"/);
    links.push({
      href:   hrefM   ? hrefM[1]   : "",
      target: targetM ? targetM[1] : "",
      rel:    relM    ? relM[1]    : "",
      text:   stripTags(m[2]),
    });
  }
  return links;
}

function getFirstSentence(html) {
  // Get text of first <p>
  const m = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!m) return "";
  const text = stripTags(m[1]);
  return text.split(/(?<=[.!?])\s+/)[0] ?? text;
}

function getExcerpt(data) {
  if (data.yoast_head_json?.description) return data.yoast_head_json.description.trim();
  if (data.excerpt?.raw) return data.excerpt.raw.trim();
  if (data.excerpt?.rendered) return stripTags(data.excerpt.rendered).trim();
  return "";
}

function auditEntry(entry, data) {
  const html    = data.content.rendered;
  const excerpt = getExcerpt(data);
  const slug    = data.slug;
  const issues  = [];
  const passes  = [];
  const info    = [];

  const ids   = getIds(html);
  const links = getLinks(html);
  const lower = html.toLowerCase();

  // 1. Word count
  const wc = wordCount(html);
  if (wc >= 600) {
    passes.push(`Word count: ${wc}`);
  } else {
    issues.push(`Word count: ${wc} (target 600+)`);
  }

  // 2. Required anchor IDs
  const missingAnchors = REQUIRED_ANCHORS.filter(a => !ids.includes(a));
  if (missingAnchors.length === 0) {
    passes.push(`All 8 required anchor IDs present`);
  } else {
    issues.push(`Missing anchor IDs: ${missingAnchors.join(", ")}`);
  }

  // 3. FAQ question count (faq- prefix, exclude bare "faq")
  const faqIds = ids.filter(id => id.startsWith("faq-"));
  if (faqIds.length >= 3) {
    passes.push(`FAQ questions: ${faqIds.length}`);
  } else {
    issues.push(`FAQ questions: ${faqIds.length} (target 3+${faqIds.length ? ", found: " + faqIds.join(", ") : ""})`);
  }

  // 4. Industry pillar links
  const linkHrefs = links.map(l => l.href);
  const missingIndustry = INDUSTRY_SLUGS.filter(s => !linkHrefs.some(h => h.includes(s)));
  if (missingIndustry.length === 0) {
    passes.push(`All 4 industry pillar links present`);
  } else {
    issues.push(`Missing industry links: ${missingIndustry.join(", ")}`);
  }

  // 5. Solution pillar CTA link
  const hasPillar = SOLUTION_PILLARS.some(p => linkHrefs.some(h => h.includes(p)));
  if (hasPillar) {
    passes.push(`Solution pillar CTA link present`);
  } else {
    issues.push(`No solution pillar CTA link (expected cmms/, enterprise-asset-management/, or lubrication-management/)`);
  }

  // 6. No sunset pillar links
  const sunsetFound = SUNSET_SLUGS.filter(s => linkHrefs.some(h => h.includes(s)));
  if (sunsetFound.length === 0) {
    passes.push(`No sunset pillar links`);
  } else {
    issues.push(`Sunset pillar links found: ${sunsetFound.join(", ")}`);
  }

  // 7. No forbidden phrases (word-boundary match on text content only)
  const textOnly = stripTags(html).toLowerCase();
  const foundPhrases = FORBIDDEN_PHRASES.filter(p => {
    const re = new RegExp(`(?<![a-z])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z])`, "i");
    return re.test(textOnly);
  });
  if (foundPhrases.length === 0) {
    passes.push(`No forbidden phrases`);
  } else {
    issues.push(`Forbidden phrases: ${foundPhrases.map(p => `"${p}"`).join(", ")}`);
  }

  // 8. No self-referencing links
  const selfLinks = links.filter(l => l.href.includes(`/${slug}/`));
  if (selfLinks.length === 0) {
    passes.push(`No self-referencing links`);
  } else {
    issues.push(`Self-referencing links: ${selfLinks.length} (href contains /${slug}/)`);
  }

  // 9. All links have target="_blank" and rel="noopener noreferrer"
  const badLinks = links.filter(l => {
    return l.target !== "_blank" || !l.rel.includes("noopener") || !l.rel.includes("noreferrer");
  });
  if (badLinks.length === 0) {
    passes.push(`All links have correct target/rel attributes`);
  } else {
    const examples = badLinks.slice(0, 3).map(l => l.href).join(", ");
    issues.push(`${badLinks.length} link(s) missing target="_blank" rel="noopener noreferrer": ${examples}${badLinks.length > 3 ? " ..." : ""}`);
  }

  // 10. Opens with standalone definition sentence
  const firstSentence = getFirstSentence(html);
  if (/^[A-Z].+ (is|are) /.test(firstSentence)) {
    passes.push(`Opens with definition sentence`);
  } else {
    issues.push(`First sentence may not follow "[Term] is ..." pattern: "${firstSentence.slice(0, 100)}"`);
  }

  // 11. Excerpt length (informational — Yoast auto-generates from opening paragraph)
  const excerptLen = excerpt.length;
  if (excerptLen >= 120 && excerptLen <= 220) {
    passes.push(`Excerpt length: ${excerptLen} chars (Yoast auto-generated)`);
  } else {
    const dir = excerptLen < 120 ? "short" : "long";
    info.push(`Excerpt ${dir}: ${excerptLen} chars (note: Yoast auto-generates from opening paragraph; not directly settable via REST API)`);
  }

  // 12. Minimum 5 internal links
  const internalLinks = links.filter(l => l.href.includes("getredlist.com"));
  if (internalLinks.length >= 5) {
    passes.push(`Internal links: ${internalLinks.length}`);
  } else {
    issues.push(`Internal links: ${internalLinks.length} (target 5+)`);
  }

  return { slug, passes, issues, info };
}

async function fetchEntry(id) {
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/dictionary/${id}?context=edit`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log("=".repeat(70));
  console.log(" DICTIONARY ENTRY AUDIT");
  console.log("=".repeat(70));

  let totalPass = 0;
  let totalFail = 0;

  for (const entry of ENTRIES) {
    console.log(`\n${"─".repeat(70)}`);
    console.log(` ${entry.slug}  (ID ${entry.id})`);
    console.log(`${"─".repeat(70)}`);

    let data;
    try {
      data = await fetchEntry(entry.id);
    } catch (err) {
      console.log(` ✗ FETCH ERROR: ${err.message}`);
      continue;
    }

    const { passes, issues, info } = auditEntry(entry, data);

    for (const p of passes) console.log(` ✓  ${p}`);
    for (const f of issues)  console.log(` ✗  ${f}`);
    for (const i of info)    console.log(` ℹ  ${i}`);

    const result = issues.length === 0
      ? "PASS"
      : `FAIL (${issues.length} issue${issues.length !== 1 ? "s" : ""})`;
    console.log(`\n    Result: ${result}`);

    totalPass += passes.length;
    totalFail += issues.length;
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(` SUMMARY: ${totalPass} checks passed, ${totalFail} checks failed`);
  console.log("=".repeat(70));
}

main().catch(err => { console.error(err); process.exit(1); });
