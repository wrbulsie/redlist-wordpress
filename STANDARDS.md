# Redlist Glossary Entry Publishing Standards

## content.json Fields

Every glossary entry is defined in `content.json` before publishing. All fields are required except `type`.

```json
{
  "type": "dictionary",
  "title": "Term Name (Abbreviation)",
  "slug": "term-name-abbreviation",
  "excerpt": "One to two sentence meta description. Should define the term and state what the reader will learn.",
  "category": "CMMS",
  "content": "..."
}
```

| Field | Required | Notes |
|---|---|---|
| `type` | No | Defaults to `post` if omitted. Use `dictionary` for glossary entries. |
| `title` | Yes | Term name, with abbreviation in parentheses if applicable. |
| `slug` | Yes | Lowercase, hyphenated. Match the term name closely. |
| `excerpt` | Yes | Used as the Yoast SEO meta description. 150–160 characters recommended. |
| `category` | Yes | Must match an existing category name exactly (case-insensitive). |
| `content` | Yes | Full HTML body. See content structure below. |

---

## Content Structure

Glossary entries follow this section order. All `<h2>` and `<h3>` elements must include an `id` attribute (see Anchor ID Format below).

### 1. Opening paragraph (no heading)
- Define the term directly in the first sentence.
- State the core purpose or function.
- No `<h2>` before this paragraph — it sits at the top of the entry.

### 2. Why [Term] Matters
```html
<h2 id="why-it-matters">Why [Term] Matters</h2>
```
- Business case for the concept.
- Quantify consequences where possible (cost, time, failure rates).
- Link to supporting content on getredlist.com where relevant.

### 3. How It Works in Practice
```html
<h2 id="how-it-works">How It Works in Practice</h2>
```
- Use `<h3>` subsections for each step or component.
- Subsection anchor IDs should be short and descriptive (e.g., `id="criticality-ranking"`, `id="task-development"`).
- Link to related dictionary entries for any technical terms introduced.

### 4. [Term] by Industry
```html
<h2 id="by-industry">[Term] by Industry</h2>
```
- Cover relevant industries: Manufacturing, Mining, Oil and Gas, Crane and Rigging.
- Each industry opens with a bolded, linked industry name:
  ```html
  <strong><a href="https://www.getredlist.com/[industry-slug]/" target="_blank" rel="noopener noreferrer">[Industry]:</a></strong>
  ```
- Omit industries that are not meaningfully applicable to the term.

### 5. Common [Term] Failures (or Challenges)
```html
<h2 id="common-failures">Common [Term] Failures</h2>
```
- 3–5 failure modes or pitfalls, each as a `<strong>`-labelled paragraph.
- Be specific — name the pattern and explain why it happens.

### 6. [Term] vs. Other Strategies
```html
<h2 id="vs-other-strategies">[Term] vs. Other Strategies</h2>
```
- `<ul>` list comparing the term to related concepts.
- Each item: bold the strategy name, add one sentence description, link to its dictionary entry if one exists.

### 7. Frequently Asked Questions
```html
<h2 id="faq">Frequently Asked Questions</h2>
```
- Minimum 3 questions, maximum 5.
- Each question is an `<h3>` with a unique anchor ID (see format below).
- Answers are `<p>` elements — full sentences, no bullets.
- Questions should target common search queries for the term.

### 8. Related Terms
```html
<h2 id="related-terms">Related Terms</h2>
```
- `<ul>` of 4–8 links to related dictionary entries.
- All links open in a new tab with `target="_blank" rel="noopener noreferrer"`.

### 9. CTA
```html
<h2 id="cta">Strengthen Your [Program Area] With Redlist</h2>
```
- One sentence describing what Redlist helps with, specific to the term's domain.
- Two CTA links on the final `<p>`: product page and demo page, separated by `&nbsp;|&nbsp;`.

---

## Anchor ID Format

Every `<h2>` and `<h3>` must have an `id` attribute. This enables anchor linking and supports on-page navigation.

**Rules:**
- Lowercase only
- Hyphens between words, no underscores
- Short and semantic — describe the section, not the heading text verbatim
- FAQ `<h3>` IDs must be prefixed with `faq-`

**Standard h2 IDs:**

| Section | ID |
|---|---|
| Why It Matters | `why-it-matters` |
| How It Works in Practice | `how-it-works` |
| [Term] by Industry | `by-industry` |
| Common Failures | `common-failures` |
| vs. Other Strategies | `vs-other-strategies` |
| Frequently Asked Questions | `faq` |
| Related Terms | `related-terms` |
| CTA | `cta` |

**FAQ h3 ID examples:**
```
faq-preventive-vs-predictive
faq-build-schedule
faq-compliance-rate
faq-10-percent-rule
```

---

## Linking Rules

### All external and internal links
```html
<a href="URL" target="_blank" rel="noopener noreferrer">Anchor text</a>
```
- Always include `target="_blank"` and `rel="noopener noreferrer"` on every link.

### Linking to dictionary entries
- Use the full URL: `https://www.getredlist.com/dictionary/[slug]/`
- Link on first meaningful mention of a defined term within the content body.
- Do not link the same term more than once per section.

### Linking to industry pages
- Use the full URL: `https://www.getredlist.com/[industry-slug]/`
- Industry slugs: `manufacturing`, `mining`, `oil-and-gas`, `crane-and-rigging`
- In the By Industry section, the industry name itself is the link (wrapped in `<strong>`).

### Linking to blog posts
- Use the full URL: `https://www.getredlist.com/[post-slug]/`
- Use contextually — link when the post directly supports a claim or benchmark cited in the content.

---

## FAQ Requirements

Each glossary entry must include at least 3 FAQ items. Questions should:

- Be phrased as a natural search query (e.g., "What is the difference between X and Y?")
- Address the most common questions a reader would have after reading the entry
- Cover at minimum: a definition/comparison question, a "how to" question, and one metric or benchmark question where applicable

---

## Publish Commands

### Create a new draft
```bash
node --env-file=.env publish.js
```
- Reads `content.json` from the working directory
- Posts to `/wp-json/wp/v2/{type}` with `status: draft`
- Prints the draft URL on success

### Update an existing entry
```bash
node --env-file=.env publish.js --update <id>
```
- Reads `content.json` from the working directory
- PATCHes `/wp-json/wp/v2/{type}/{id}`
- Does **not** change the post's current status (published entries stay published)
- Find the entry ID by querying: `/wp-json/wp/v2/dictionary?slug=<slug>`

### Look up an entry ID by slug
```bash
node --env-file=.env -e "
const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(\`\${WP_USER}:\${WP_APP_PASSWORD}\`).toString('base64');
fetch(\`\${WP_URL}/wp-json/wp/v2/dictionary?slug=<slug>\`, { headers: { Authorization: \`Basic \${credentials}\` } })
  .then(r => r.json())
  .then(d => console.log('ID:', d[0]?.id));
"
```

---

## Notes

- WordPress auto-converts `--` to an em dash (`&#8212;`) and `&` to `&#038;` on save. This is expected and renders correctly on the front end.
- Custom `id` attributes on headings may be stripped by WordPress depending on theme/plugin configuration. Verify anchor IDs are preserved after each update by fetching `content.rendered` from the API.
- The `excerpt` field maps to the Yoast SEO meta description. Keep it under 160 characters to avoid truncation in search results.
