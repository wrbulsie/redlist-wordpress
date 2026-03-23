const fs = require('fs');

// ============================================================
// BLOG BUILD CONTENT
// Edit the fields below, then run: node blog-build-content.js
// This generates blog-content.json for blog-publish.js
// ============================================================

const post = {
  // WordPress post ID -- find in audit CSV or WordPress admin URL
  id: 0,

  // Post title (also sets H1 on the page)
  title: "",

  // Post slug -- used for verification only, not updated via API
  slug: "",

  // Full post content as HTML
  // Use standard WordPress block HTML
  content: ``,

  // Yoast SEO fields
  // Meta description: 150-160 characters, includes primary keyword
  metaDescription: "",

  // Focus keyword: exact primary keyword phrase
  focusKeyword: "",

  // Yoast SEO title: defaults to post title + | Redlist if left empty
  // Only set this if you want a custom SEO title different from the post title
  seoTitle: "",
};

// ============================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================

if (!post.id || post.id === 0) {
  console.error('ERROR: Post ID is required. Set post.id before running.');
  process.exit(1);
}

if (!post.title) {
  console.error('ERROR: Post title is required.');
  process.exit(1);
}

if (!post.content) {
  console.error('ERROR: Post content is required.');
  process.exit(1);
}

if (!post.metaDescription) {
  console.error('ERROR: Meta description is required.');
  process.exit(1);
}

if (!post.focusKeyword) {
  console.error('ERROR: Focus keyword is required.');
  process.exit(1);
}

if (post.metaDescription.length < 140) {
  console.warn(`WARNING: Meta description is ${post.metaDescription.length} chars. Target 150-160.`);
}

if (post.metaDescription.length > 160) {
  console.warn(`WARNING: Meta description is ${post.metaDescription.length} chars. Should be under 160.`);
}

fs.writeFileSync('blog-content.json', JSON.stringify(post, null, 2));
console.log('blog-content.json written successfully');
console.log(`Title: ${post.title}`);
console.log(`Slug: ${post.slug}`);
console.log(`Meta description: ${post.metaDescription.length} chars`);
console.log(`Focus keyword: ${post.focusKeyword}`);
