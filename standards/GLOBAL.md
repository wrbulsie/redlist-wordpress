# Global Publishing Standards — Redlist

Applies to all content types: glossary entries (`dictionary`), blog posts (`post`), and any other post type published via the REST API.

---

## Brand Voice

### Core principles
- **Direct.** Say what you mean in the fewest words that don't sacrifice precision. Cut throat-clearing. Cut hedges.
- **Industrial.** Write for maintenance engineers, reliability managers, and operations leads — not a general audience. Use industry terminology correctly and without apology.
- **Authoritative without being academic.** Redlist is a practitioner brand. Content should read like it was written by someone who has been on a plant floor, not someone who read about one.
- **No fluff.** Do not open sections with restatements of what was just said. Do not close sections with summaries of what was just written. Each sentence should add information.

### Tone by section type
| Section type | Tone |
|---|---|
| Definitions and explanations | Precise, neutral, factual |
| Industry applications | Specific, grounded in operational reality |
| Failure modes / pitfalls | Direct, frank — name the problem clearly |
| FAQs | Conversational but substantive — answer the question fully |
| CTAs | Confident, not pushy |

### Language rules
- Use **em dashes** for asides and pivots. In source HTML, write `--` and WordPress will convert to `&#8212;` automatically.
- Use **plain numbers** for statistics and benchmarks (e.g., "10 percent", not "10%") unless the percentage is part of a proper name (e.g., "the 10 Percent Rule").
- Do not use first person ("we", "our") in glossary entries. Use second person ("you", "your") sparingly and only in instructional content (how-to sections, FAQs).
- Do not use exclamation points except in CTAs where the brand voice calls for energy.
- Spell out acronyms on first use: "CMMS (Computerized Maintenance Management System)". On subsequent uses, the abbreviation alone is fine.

---

## Link Standards

### Required attributes on all links
Every link in published content must include both attributes:
```html
<a href="URL" target="_blank" rel="noopener noreferrer">Anchor text</a>
```
No exceptions — applies to internal and external links alike.

### Anchor text rules
- **Descriptive.** Never use "click here", "learn more", or "read more" as anchor text.
- **Natural.** The anchor text should read as part of the sentence, not interrupt it.
- **Specific.** Link on the term name or the specific concept being referenced, not on a surrounding clause.

Good: `See: <a href="...">Asset Criticality Ranking (ACR)</a>.`
Bad: `<a href="...">Click here</a> to learn about Asset Criticality Ranking.`

### Internal link targets
| Destination type | URL pattern |
|---|---|
| Dictionary entry | `https://www.getredlist.com/dictionary/[slug]/` |
| Industry page | `https://www.getredlist.com/[industry-slug]/` |
| Blog post | `https://www.getredlist.com/[post-slug]/` |
| Product page | `https://www.getredlist.com/cmms/` |
| Demo page | `https://www.getredlist.com/cmms/demo/` |

**Industry page slugs:** `manufacturing` · `mining` · `oil-and-gas` · `crane-and-rigging`

### Link frequency
- Link a term or page **once per section**, on its first meaningful mention.
- Do not repeat the same link within the same `<h2>` section.
- Exception: CTA links (product page, demo page) exist solely in the CTA section and are not subject to the one-link-per-section rule.

---

## Anchor ID Format

Every `<h2>` and `<h3>` element in published content must carry an `id` attribute.

### Rules
- Lowercase only
- Hyphens as word separators — no underscores, no camelCase
- Short and semantic — name the concept, not the heading text verbatim
- Must be unique within the page
- FAQ `<h3>` IDs are prefixed with `faq-`

### Format
```html
<h2 id="section-name">Section Heading Text</h2>
<h3 id="subsection-name">Subsection Heading Text</h3>
<h3 id="faq-question-topic">FAQ Question Text?</h3>
```

### Examples
```
why-it-matters
how-it-works
by-industry
common-failures
vs-other-strategies
faq
faq-preventive-vs-predictive
faq-build-schedule
faq-compliance-rate
related-terms
cta
```

### Verification
WordPress may strip custom `id` attributes depending on theme or plugin configuration. After every update, verify anchor IDs survived by fetching `content.rendered` from the API:
```bash
node --env-file=.env -e "
const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(\`\${WP_USER}:\${WP_APP_PASSWORD}\`).toString('base64');
fetch(\`\${WP_URL}/wp-json/wp/v2/[type]/[id]\`, { headers: { Authorization: \`Basic \${credentials}\` } })
  .then(r => r.json())
  .then(d => console.log(d.content.rendered));
"
```

---

## AIO Optimization Requirements

AIO (AI Overview) optimization targets Google's AI-generated search summaries and other LLM-driven content retrieval. Content that is well-structured for AIO also performs better in featured snippets and People Also Ask boxes.

### Definition sentences
- Every entry or post that defines a term must include a standalone definitional sentence as the **first sentence of the first paragraph**.
- Pattern: `[Term] is [concise definition].`
- The definition sentence must be self-contained — it should make sense if extracted with no surrounding context.

### Structured answers
- FAQ answers must open with a direct answer to the question in the first sentence, then expand.
- Do not bury the answer in the middle of a paragraph.
- Ideal FAQ answer length: 60–120 words. Long enough to be complete, short enough to be extractable.

### Explicit benchmarks and numbers
- State specific numbers, thresholds, and benchmarks wherever they exist (e.g., "90 percent compliance", "10 percent unplanned work threshold").
- Numbers increase extractability and citation likelihood in AI overviews.

### Comparison framing
- When a term is commonly confused with another, include an explicit comparison section or FAQ question (e.g., "What is the difference between X and Y?").
- Use a clear structural contrast: state what X is, then what Y is, then the key distinction.

### Semantic heading structure
- `<h2>` for major sections, `<h3>` for subsections within them. Do not skip levels.
- Heading text should be descriptive enough to stand alone as a summary of the section below it.
- Avoid clever or vague headings — "Why It Matters" is acceptable; "The Power of Planning" is not.

### No duplicate content
- Do not repeat the definition in multiple sections.
- Do not summarize what was just covered at the end of a section.
- Each paragraph should introduce new information.

---

## Publish Commands

### Create a new draft
```bash
node --env-file=.env publish.js
```
Posts to `/wp-json/wp/v2/{type}` with `status: draft`. Prints the draft preview URL.

### Update an existing entry
```bash
node --env-file=.env publish.js --update <id>
```
PATCHes `/wp-json/wp/v2/{type}/{id}`. Does not change the entry's current publish status.

### Look up an entry ID by slug
```bash
node --env-file=.env -e "
const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(\`\${WP_USER}:\${WP_APP_PASSWORD}\`).toString('base64');
fetch(\`\${WP_URL}/wp-json/wp/v2/dictionary?slug=SLUG-HERE\`, { headers: { Authorization: \`Basic \${credentials}\` } })
  .then(r => r.json())
  .then(d => console.log('ID:', d[0]?.id, '| Status:', d[0]?.status));
"
```

### List all dictionary entries (paginated)
```bash
node --env-file=.env -e "
const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(\`\${WP_USER}:\${WP_APP_PASSWORD}\`).toString('base64');
fetch(\`\${WP_URL}/wp-json/wp/v2/dictionary?per_page=100&page=1\`, { headers: { Authorization: \`Basic \${credentials}\` } })
  .then(r => r.json())
  .then(data => data.forEach(e => console.log(\`[\${e.id}] \${e.slug} (\${e.status})\`)));
"
```

---

## Theme Configuration

A `scroll-margin-top: 100px` CSS rule is applied site-wide via **Appearance > Customize > Additional CSS** to prevent sticky-header anchor jumping. When a user navigates to a fragment URL, this offset pushes the target element below the fixed header so the heading is not obscured.

If the header height changes (e.g., after a theme update or layout change), this value will need to be adjusted to match the new header height.

---

## Sunset Pillars — Do Not Link

The following pillars are sunset and must not receive any editorial support:

- **Health & Safety** — `https://www.getredlist.com/health-safety-environmental/`
- **Field Service Management** — `https://www.getredlist.com/field-service-management-software/`

Never link to these URLs in any content. Never create new glossary entries, blog posts, or other content whose primary purpose is to support these pillars.

---

## Credentials

WordPress credentials are stored in `.env` at the project root.

The Application Password was generated under the label **"Claude Content"** in **WordPress Dashboard > Users > Profile > Application Passwords**.

If authentication fails (401 errors from the REST API), the Application Password may have been revoked or expired. To fix:
1. Go to WordPress Dashboard > Users > Profile > Application Passwords.
2. Revoke the old "Claude Content" password if it exists.
3. Generate a new one under the same label.
4. Update `WP_APP_PASSWORD` in `.env` with the new value.

---

## WordPress Behaviour Notes

| Input | WordPress output | Effect |
|---|---|---|
| `--` | `&#8212;` | Em dash — renders correctly |
| `&` in title | `&#038;` | Ampersand — renders correctly |
| `"..."` straight quotes | `&#8220;...&#8221;` | Curly quotes — renders correctly |
| Custom `id` on headings | May be stripped | Verify after every publish |
| `excerpt` field | Maps to Yoast meta description | Keep under 160 characters |
