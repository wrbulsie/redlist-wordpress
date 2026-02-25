# Glossary Entry Standards — Redlist Dictionary

Standards specific to the `dictionary` post type at `getredlist.com/dictionary/`. For link rules, anchor ID format, AIO requirements, and publish commands, see [GLOBAL.md](./GLOBAL.md).

---

## content.json Structure

```json
{
  "type": "dictionary",
  "title": "Term Name (Abbreviation)",
  "slug": "term-name-abbreviation",
  "excerpt": "One to two sentence meta description. Define the term and state what the reader learns.",
  "category": "CMMS",
  "content": "..."
}
```

| Field | Required | Notes |
|---|---|---|
| `type` | Yes | Always `dictionary` for glossary entries |
| `title` | Yes | Term name with abbreviation in parentheses if one exists |
| `slug` | Yes | Lowercase, hyphenated. Must match the live URL slug exactly when updating |
| `excerpt` | Yes | Included in `content.json` for record-keeping, but the `dictionary` CPT does not support the WordPress excerpt field — the value is not stored. Yoast auto-generates the meta description from the opening paragraph of the entry. The first sentence of the opening paragraph therefore serves double duty: it is the AIO definition signal and the search result meta description. First sentence should be 120–160 characters for optimal SERP display. |
| `category` | Yes | Must match an existing WordPress category name (case-insensitive) |
| `content` | Yes | Full HTML body per section structure below |

---

## Section Order

All sections are required unless noted as optional. Use this order exactly.

```
1.  Opening paragraph (no heading)
2.  Why [Term] Matters               <h2 id="why-it-matters">
3.  How It Works in Practice         <h2 id="how-it-works">
4.  [Term] by Industry               <h2 id="by-industry">
5.  Common [Term] Failures           <h2 id="common-failures">
6.  [Term] vs. Other Strategies      <h2 id="vs-other-strategies">
7.  Frequently Asked Questions       <h2 id="faq">
8.  Related Terms                    <h2 id="related-terms">
9.  CTA                              <h2 id="cta">
```

---

## Section Specifications

### 1. Opening Paragraph
- No `<h2>` before this block.
- First sentence must be a standalone definition: `[Term] is [definition].`
  - Use `"[Term] is"` exactly. Do not use "refers to", "describes", "involves", or similar constructions.
  - This sentence doubles as the Yoast auto-generated meta description (the `dictionary` CPT does not support the WordPress excerpt field). Write it to stand alone in a search result.
  - Target 120–160 characters for optimal SERP display.
- 2–3 paragraphs. Establish what the term is, why it exists, and the operational stakes.
- Do not use subheadings here.

### 2. Why [Term] Matters
```html
<h2 id="why-it-matters">Why [Term] Matters</h2>
```
- Business case: cost of not doing it, measurable consequences, industry benchmarks.
- Link to any supporting Redlist blog posts that quantify the stakes.
- 2–4 paragraphs.

### 3. How It Works in Practice
```html
<h2 id="how-it-works">How It Works in Practice</h2>
```
- Break into `<h3>` subsections for each step, component, or phase.
- `<h3>` IDs: short, lowercase, hyphenated (e.g., `id="criticality-ranking"`, `id="task-development"`).
- Link to related dictionary entries on first use of each defined term.
- 3–5 subsections.

### 4. [Term] by Industry
```html
<h2 id="by-industry">[Term] by Industry</h2>
```
- Cover the four core Redlist industries where applicable: Manufacturing, Mining, Oil and Gas, Crane and Rigging.
- Omit an industry only if the term has no meaningful application to it.
- Each industry opens with a bolded, linked industry name followed by a colon:
  ```html
  <p><strong><a href="https://www.getredlist.com/[industry-slug]/" target="_blank" rel="noopener noreferrer">[Industry]:</a></strong> ...</p>
  ```
- Each industry paragraph: 2–4 sentences. Specific to that industry's operational context — not generic.

### 5. Common [Term] Failures
```html
<h2 id="common-failures">Common [Term] Failures</h2>
```
- 3–5 failure modes, each as a bold-labelled `<p>`:
  ```html
  <p><strong>Failure label:</strong> Description of the failure mode and why it occurs.</p>
  ```
- Name the failure pattern directly. Describe why it happens and what it costs.
- Where applicable, link to supporting content (e.g., the 10 Percent Rule post).

### 6. [Term] vs. Other Strategies
```html
<h2 id="vs-other-strategies">[Term] vs. Other Maintenance Strategies</h2>
```
- `<ul>` list. One `<li>` per strategy.
- Format: `<strong>[Strategy name]:</strong> One-sentence description. See: <a href="...">linked term</a>.`
- Include the entry's own term in the list (bolded, no link) to anchor its position in the taxonomy.
- Always link to the dictionary entry for each compared term if one exists.

### 7. Frequently Asked Questions
```html
<h2 id="faq">Frequently Asked Questions</h2>
```
- Minimum 3 questions, maximum 5.
- Each question is an `<h3>` with an `id` prefixed `faq-`:
  ```html
  <h3 id="faq-[topic]">Question text?</h3>
  <p>Answer paragraph.</p>
  ```
- Required question types (every entry must include at least one of each):
  - **Definition/comparison:** "What is the difference between X and Y?"
  - **How-to:** "How do you build / implement / measure [term]?"
  - **Benchmark/metric:** "What is a good [metric] rate?" or "What does [threshold] mean?"
- Answer each question in 60–120 words. First sentence must directly answer the question.
- See [GLOBAL.md § AIO Optimization](./GLOBAL.md) for answer structure requirements.

### 8. Related Terms
```html
<h2 id="related-terms">Related Terms</h2>
```
- `<ul>` of 4–8 dictionary entry links.
- All links: `target="_blank" rel="noopener noreferrer"`.
- Prioritize terms that were linked in the body of the entry.
- Do not link to terms that do not have a published dictionary entry.

### 9. CTA
```html
<h2 id="cta">Strengthen Your [Program Area] With Redlist</h2>
```
- One sentence specific to the term's operational domain.
- Final `<p>` contains two CTA links separated by `&nbsp;|&nbsp;`.
- **The pillar URL must match the entry's primary topic:**
  | Entry topic | Pillar URL | Demo URL |
  |---|---|---|
  | Maintenance strategy terms | `https://www.getredlist.com/cmms/` | `https://www.getredlist.com/cmms/demo/` |
  | Lubrication terms | `https://www.getredlist.com/lubrication-management/` | `https://www.getredlist.com/lubrication-management/demo/` |
  | Asset management terms | `https://www.getredlist.com/enterprise-asset-management/` | `https://www.getredlist.com/enterprise-asset-management/demo/` |

Example (maintenance strategy / CMMS entry):
  ```html
  <p>
    <a href="https://www.getredlist.com/cmms/" target="_blank" rel="noopener noreferrer">Explore the Redlist CMMS</a>
    &nbsp;|&nbsp;
    <a href="https://www.getredlist.com/cmms/demo/" target="_blank" rel="noopener noreferrer">Request a Demo</a>
  </p>
  ```

---

## Word Count Targets

| Entry tier | Target word count | Sections required |
|---|---|---|
| Tier 1 (primary terms) | 1,500–2,500 words | All 9 sections, 4–5 FAQ items |
| Tier 2 (supporting terms) | 800–1,500 words | All 9 sections, 3 FAQ items minimum |
| Tier 3 (referenced terms) | 400–800 words | Opening, Why It Matters, How It Works, Related Terms, CTA |

Word count is measured on the rendered text content, not the HTML source.

---

## Tier Prioritization

### Tier 1 — Primary terms
High-volume, high-intent search terms that represent core product categories or foundational reliability concepts. These entries compete for top rankings and should be treated as landing pages.

Examples: `preventive-maintenance-pm`, `cmms`, `lubrication-management`, `predictive-maintenance-pdm`

Requirements:
- All 9 sections at full depth
- 4–5 FAQ items targeting high-volume PAA questions
- All four industry sections covered
- Minimum 3 internal links to other dictionary entries in the body
- Linked from relevant blog posts and product pages

### Tier 2 — Supporting terms
Mid-volume terms that are important to the Redlist content ecosystem but are typically referenced from Tier 1 entries rather than targeted directly.

Examples: `preventive-maintenance-compliance-pmc`, `asset-criticality-ranking-acr`, `mean-time-between-failures-mtbf`

Requirements:
- All 9 sections
- 3 FAQ items minimum
- At least 2 internal links to other dictionary entries in the body

### Tier 3 — Referenced terms
Low-volume or highly specific terms that exist primarily to support internal linking from Tier 1 and Tier 2 entries. Shorter entries are acceptable.

Examples: `corrective-maintenance-cm`, `maintenance-sop-standard-operating-procedure`

Requirements:
- Opening, Why It Matters, How It Works, Related Terms, CTA at minimum
- 1–2 internal links to higher-tier entries
- No FAQ section required, but recommended if the term generates How/What questions

---

## Execution Queue

Tier A entries must be completed before moving to Tier B. Within each tier, work top to bottom.

### Tier A — Complete first

| # | Slug | Notes |
|---|---|---|
| 1 | `preventive-maintenance-pm` | DONE |
| 2 | `condition-based-maintenance-cbm` | |
| 3 | `mean-time-between-failures-mtbf` | |
| 4 | `maintenance-repair-and-operations-mro` | |
| 5 | `predictive-maintenance-pdm` | |
| 6 | `maintenance-sop-standard-operating-procedure` | |
| 7 | `computerized-maintenance-management-system` | |
| 8 | `overall-equipment-effectiveness-oee` | |
| 9 | `failure-mode-and-effects-analysis-fmea` | |
| 10 | `asset-criticality-ranking-acr` | |
| 11 | `risk-based-maintenance-rbm` | |
| 12 | `preventive-maintenance-compliance-pmc` | |
| 13 | `spalling` | Already ranking — expand carefully |
| 14 | `pao-oil-polyalphaolefin` | Already ranking — expand carefully |

### Tier B — Complete after Tier A

| # | Slug | Notes |
|---|---|---|
| 15 | `condition-monitoring-cm` | |
| 16 | `deferred-maintenance` | |
| 17 | `total-cost-of-ownership-tco` | |
| 18 | `asset-performance-management` | |
| 19 | `vibration-analysis` | |
| 20 | `lube-oil-system-los` | |
| 21 | `kinematic-viscosity-kv` | |

---

## Internal Linking Rules

### Within glossary entries
- Link each technical term to its dictionary entry on **first use within a section**.
- Do not link the same term twice within the same `<h2>` section.
- Do not link back to the current entry's own slug.
- Prioritize linking Tier 1 terms over Tier 2 and Tier 3.

### Cross-linking to blog posts
- Link to supporting blog posts when citing a specific benchmark, statistic, or named concept (e.g., the 10 Percent Rule).
- Place these links inline within the paragraph, not in the Related Terms section.

### Related Terms section
- The Related Terms `<ul>` is for dictionary entry links only — no blog posts.
- List 4–8 entries. Include all terms that were linked in the body, plus additional closely related entries.

---

## Industry Pillar Link Requirements

Every glossary entry that includes a "By Industry" section must link to all applicable industry pillar pages using the exact format below. These links support the site's topical authority structure.

| Industry | Link target |
|---|---|
| Manufacturing | `https://www.getredlist.com/manufacturing/` |
| Mining | `https://www.getredlist.com/mining/` |
| Oil and Gas | `https://www.getredlist.com/oil-and-gas/` |
| Crane and Rigging | `https://www.getredlist.com/crane-and-rigging/` |

Format in content:
```html
<strong><a href="https://www.getredlist.com/[industry-slug]/" target="_blank" rel="noopener noreferrer">[Industry]:</a></strong>
```

Omit an industry only when it has no meaningful operational connection to the term. Do not include a generic paragraph to satisfy the requirement — if the industry isn't relevant, leave it out.

---

## Update Workflow

### Step 1 — Find the existing entry ID
Look up by slug:
```bash
node --env-file=.env -e "
const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(\`\${WP_USER}:\${WP_APP_PASSWORD}\`).toString('base64');
fetch(\`\${WP_URL}/wp-json/wp/v2/dictionary?slug=SLUG-HERE\`, { headers: { Authorization: \`Basic \${credentials}\` } })
  .then(r => r.json())
  .then(d => console.log('ID:', d[0]?.id, '| Status:', d[0]?.status, '| Title:', d[0]?.title?.rendered));
"
```

### Step 2 — Fetch current content for review (optional)
```bash
node --env-file=.env -e "
const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(\`\${WP_USER}:\${WP_APP_PASSWORD}\`).toString('base64');
fetch(\`\${WP_URL}/wp-json/wp/v2/dictionary/ID-HERE\`, { headers: { Authorization: \`Basic \${credentials}\` } })
  .then(r => r.json())
  .then(d => console.log(d.content.rendered));
"
```

### Step 3 — Update content.json
Set `"type": "dictionary"` and populate all fields. The `slug` must match the existing entry's slug exactly.

### Step 4 — Run the update
```bash
node --env-file=.env publish.js --update <id>
```

The PATCH request updates: `title`, `slug`, `content`, `categories`. It does **not** change `status` — published entries remain published.

### Step 5 — Verify anchor IDs
After every update, confirm that `id` attributes on headings were preserved:
```bash
node --env-file=.env -e "
const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(\`\${WP_USER}:\${WP_APP_PASSWORD}\`).toString('base64');
fetch(\`\${WP_URL}/wp-json/wp/v2/dictionary/ID-HERE\`, { headers: { Authorization: \`Basic \${credentials}\` } })
  .then(r => r.json())
  .then(d => {
    const ids = [...d.content.rendered.matchAll(/id=\"([^\"]+)\"/g)].map(m => m[1]);
    console.log('Anchor IDs found:', ids);
  });
"
```

### Step 6 — Run the audit periodically
After every 3–5 entries, run the audit and resolve all failures before continuing:
```bash
node --env-file=.env audit.js
```
Do not advance to the next entry if the current batch has open failures.

### Step 7 — Create new entries as drafts first
When creating a new glossary entry, always publish as a draft first:
```bash
node --env-file=.env publish.js
```
Review the draft at the URL printed on success, then publish manually from the WordPress admin.
