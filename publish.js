

/*
 * IMPORTANT — CLAUDE CODE USAGE RULES FOR THIS SCRIPT
 *
 * This script publishes or updates WordPress posts using the contents of content.json.
 * It must NEVER be used to generate, draft, or rewrite content.json.
 *
 * The correct workflow is:
 *   1. Content is drafted in Claude.ai and reviewed by the user.
 *   2. The user manually places the approved content into content.json.
 *   3. Claude Code runs this script to publish or update the post.
 *
 * Claude Code must never write or modify content.json. That file is owned by
 * the user. Claude Code's only role here is executing publish commands.
 */

const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
const path = require('path');
const fs = require('fs');
const headers = {
  'Authorization': `Basic ${credentials}`,
  'Content-Type': 'application/json',
};

function parseArgs() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--update');
  if (idx === -1) return { updateId: null };
  const id = args[idx + 1];
  if (!id || isNaN(Number(id))) {
    console.error('--update requires a numeric post ID, e.g. --update 9222');
    process.exit(1);
  }
  return { updateId: Number(id) };
}

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function getCategoryId(name) {
  let page = 1;
  while (true) {
    const data = await fetchJson(`${WP_URL}/wp-json/wp/v2/categories?per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) break;
    const match = data.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (match) return match.id;
    page++;
  }
  throw new Error(`Category not found: "${name}"`);
}

async function main() {
  const { updateId } = parseArgs();

  const contentPath = path.join(__dirname, 'content.json');
  if (!fs.existsSync(contentPath)) {
    console.error('content.json not found in current directory.');
    process.exit(1);
  }

  const post = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  const { title, slug, category, content, type = 'post' } = post;

  const missing = ['title', 'slug', 'category', 'content'].filter(k => !post[k]);
  if (missing.length) {
    console.error(`content.json is missing required fields: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`Post type: ${type}`);
  console.log(`Looking up category: "${category}"...`);
  const categoryId = await getCategoryId(category);
  console.log(`  Found category ID: ${categoryId}`);

  const isUpdate = updateId !== null;
  const url = isUpdate
    ? `${WP_URL}/wp-json/wp/v2/${type}/${updateId}`
    : `${WP_URL}/wp-json/wp/v2/${type}`;
  const method = isUpdate ? 'PATCH' : 'POST';

  console.log(isUpdate ? `Updating post ${updateId}...` : 'Publishing draft...');

  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify({
      title,
      slug,
      content,
      categories: [categoryId],
      ...(isUpdate ? {} : { status: 'draft' }),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`Failed to ${isUpdate ? 'update' : 'create'} post: ${res.status} ${res.statusText}`);
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(isUpdate ? '\nPost updated successfully!' : '\nDraft created successfully!');
  console.log(`  ID:    ${data.id}`);
  console.log(`  Title: ${data.title?.rendered}`);
  console.log(`  Slug:  ${data.slug}`);
  console.log(`  URL:   ${data.link}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
