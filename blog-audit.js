// ============================================================
// BLOG AUDIT
// Audits a blog post draft against Redlist content standards
//
// Usage: node --env-file=.env blog-audit.js [POST_ID]
// Example: node --env-file=.env blog-audit.js 1234
// ============================================================

const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;

if (!WP_URL || !WP_USER || !WP_APP_PASSWORD) {
  console.error('ERROR: Missing environment variables. Check your .env file.');
  process.exit(1);
}

const postId = process.argv[2];

if (!postId) {
  console.error('ERROR: Post ID required. Usage: node --env-file=.env blog-audit.js [POST_ID]');
  process.exit(1);
}

const credentials = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

// Forbidden phrases
const FORBIDDEN_PHRASES = [
  'best-in-class',
  'game-changer',
  'game-changing',
  'seamless',
  'cutting-edge',
  'state-of-the-art',
  'synergy',
  'synergies',
  'straightforward',
  'genuinely',
  'honestly',
];

// Sunset pillar URLs -- must not appear in optimized posts

// Active pillar URLs -- at least one required
const ACTIVE_PILLARS = [
  '/manufacturing/',
  '/mining/',
  '/marine/',
  '/crane-and-rigging/',
  '/oil-and-gas/',
  '/contractor-inspections/',
  '/lubrication-management/',
  '/cmms/',
  '/enterprise-asset-management/',
  '/operator-basic-care/',
  '/ai-agents/',
];

function wordCount(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

fetch(`${WP_URL}/wp-json/wp/v2/posts/${postId}?context=edit`, {
  headers: { Authorization: `Basic ${credentials}` },
})
  .then(r => r.json())
  .then(d => {
    if (d.code) {
      console.error('ERROR:', d.code, d.message);
      process.exit(1);
    }

    const html = d.content?.raw || '';
    const title = d.title?.raw || '';
    const metaDesc = d.meta?._yoast_wpseo_metadesc || d.yoast_head_json?.description || '';
    const focusKw = d.meta?._yoast_wpseo_focuskw || '';
    const lower = html.toLowerCase();
    const titleLower = title.toLowerCase();
    const status = d.status;

    const passes = [];
    const issues = [];
    const warnings = [];

    console.log('');
    console.log('======================================================================');
    console.log(` BLOG POST AUDIT`);
    console.log(`  ID:    ${d.id}`);
    console.log(`  Slug:  ${d.slug}`);
    console.log(`  Title: ${title}`);
    console.log(`  URL:   ${d.link}`);
    console.log('======================================================================');

    // 1. Status check
    if (status === 'draft') {
      passes.push(`Post status: draft (correct)`);
    } else {
      warnings.push(`Post status is "${status}" -- expected "draft"`);
    }

    // 2. Word count
    const wc = wordCount(html);
    if (wc >= 1200) {
      passes.push(`Word count: ${wc}`);
    } else {
      issues.push(`Word count: ${wc} (minimum 1,200)`);
    }

    // 3. Meta description
    if (!metaDesc) {
      issues.push(`Meta description: not set`);
    } else if (metaDesc.length < 140) {
      warnings.push(`Meta description: ${metaDesc.length} chars (target 150-160)`);
      passes.push(`Meta description: present`);
    } else if (metaDesc.length > 160) {
      warnings.push(`Meta description: ${metaDesc.length} chars (over 160 -- will truncate in SERPs)`);
      passes.push(`Meta description: present`);
    } else {
      passes.push(`Meta description: ${metaDesc.length} chars`);
    }

    // 4. Focus keyword set
    if (focusKw) {
      passes.push(`Focus keyword: "${focusKw}"`);
    } else {
      issues.push(`Focus keyword: not set`);
    }

    // 5. Focus keyword in title
    if (focusKw && titleLower.includes(focusKw.toLowerCase())) {
      passes.push(`Focus keyword in title`);
    } else if (focusKw) {
      warnings.push(`Focus keyword "${focusKw}" not found in title`);
    }

    // 6. Focus keyword in first 100 words
    if (focusKw) {
      const first100 = stripTags(html).split(' ').slice(0, 100).join(' ').toLowerCase();
      if (first100.includes(focusKw.toLowerCase())) {
        passes.push(`Focus keyword in opening paragraph`);
      } else {
        warnings.push(`Focus keyword "${focusKw}" not found in first 100 words`);
      }
    }

    // 7. Focus keyword in meta description
    if (focusKw && metaDesc) {
      if (metaDesc.toLowerCase().includes(focusKw.toLowerCase())) {
        passes.push(`Focus keyword in meta description`);
      } else {
        warnings.push(`Focus keyword "${focusKw}" not found in meta description`);
      }
    }

    // 8. At least one active pillar link
    const hasPillar = ACTIVE_PILLARS.some(p => lower.includes(p));
    if (hasPillar) {
      passes.push(`Active pillar link present`);
    } else {
      issues.push(`No active pillar link found -- at least one required`);
    }

 // 9. HSE and Field Service links allowed (maintenance mode solutions)
    passes.push(`HSE and Field Service linking permitted`);

    // 10. Author byline check
    if (lower.includes('talmage wagstaff')) {
      passes.push(`Author byline present (Talmage Wagstaff)`);
    } else {
      warnings.push(`Author byline not found in content -- add Talmage Wagstaff, CEO at Redlist`);
    }

    // 11. External link attributes
    const extLinks = [...html.matchAll(/<a\s[^>]*href="https?:\/\/(?!www\.getredlist\.com)[^"]*"[^>]*>/gi)];
    const badExtLinks = extLinks.filter(m => !m[0].includes('target="_blank"') || !m[0].includes('rel="noopener noreferrer"'));
    if (badExtLinks.length === 0) {
      passes.push(`All external links have correct target/rel attributes`);
    } else {
      issues.push(`External links missing target/_blank or rel/noopener: ${badExtLinks.length}`);
    }

    // 12. Forbidden phrases
    const foundForbidden = FORBIDDEN_PHRASES.filter(p => lower.includes(p.toLowerCase()));
    if (foundForbidden.length === 0) {
      passes.push(`No forbidden phrases`);
    } else {
      issues.push(`Forbidden phrases: ${foundForbidden.join(', ')}`);
    }

    // 13. FAQ section (recommended)
    if (lower.includes('frequently asked questions') || lower.includes('<h2') && lower.includes('faq')) {
      passes.push(`FAQ section present`);
    } else {
      warnings.push(`No FAQ section detected -- recommended for informational posts`);
    }

    // 14. Glossary links (recommended)
    const glossaryLinks = [...html.matchAll(/href="https?:\/\/www\.getredlist\.com\/dictionary\//gi)];
    if (glossaryLinks.length >= 2) {
      passes.push(`Glossary links: ${glossaryLinks.length}`);
    } else if (glossaryLinks.length === 1) {
      warnings.push(`Only 1 glossary link -- recommend 2-3`);
    } else {
      warnings.push(`No glossary links -- recommend adding 2-3 relevant glossary entry links`);
    }

    // Print results
    console.log('');
    passes.forEach(p => console.log(` ✓  ${p}`));
    warnings.forEach(w => console.log(` ℹ  ${w}`));
    issues.forEach(i => console.log(` ✗  ${i}`));

    console.log('');
    if (issues.length === 0) {
      console.log(` Result: PASS (${warnings.length} warning${warnings.length !== 1 ? 's' : ''})`);
    } else {
      console.log(` Result: FAIL (${issues.length} issue${issues.length !== 1 ? 's' : ''}, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''})`);
    }
    console.log('======================================================================');
    console.log('');
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
