// ============================================================
// BLOG FETCH
// Fetches current blog post content by ID for review
//
// Usage: node --env-file=.env blog-fetch.js [POST_ID]
// Example: node --env-file=.env blog-fetch.js 1234
// ============================================================

const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;

if (!WP_URL || !WP_USER || !WP_APP_PASSWORD) {
  console.error('ERROR: Missing environment variables. Check your .env file.');
  process.exit(1);
}

const postId = process.argv[2];

if (!postId) {
  console.error('ERROR: Post ID required. Usage: node --env-file=.env blog-fetch.js [POST_ID]');
  process.exit(1);
}

const credentials = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

fetch(`${WP_URL}/wp-json/wp/v2/posts/${postId}?context=edit`, {
  headers: { Authorization: `Basic ${credentials}` },
})
  .then(r => r.json())
  .then(d => {
    if (d.code) {
      console.error('ERROR:', d.code, d.message);
      process.exit(1);
    }

    console.log('');
    console.log('=== POST DETAILS ===');
    console.log(`ID:             ${d.id}`);
    console.log(`Slug:           ${d.slug}`);
    console.log(`Status:         ${d.status}`);
    console.log(`Title:          ${d.title?.raw}`);
    console.log(`URL:            ${d.link}`);
    console.log('');
    console.log('=== YOAST SEO ===');
    console.log(`Meta Desc:      ${d.yoast_head_json?.description || '(not set)'}`);
    console.log(`Focus Keyword:  ${d.meta?._yoast_wpseo_focuskw || '(not set)'}`);
    console.log(`SEO Title:      ${d.yoast_head_json?.title || '(not set)'}`);
    console.log('');
    console.log('=== CONTENT ===');
    console.log(d.content?.raw);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
