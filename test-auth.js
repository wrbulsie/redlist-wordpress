const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;

const credentials = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
const headers = { 'Authorization': `Basic ${credentials}` };

async function fetchAll(endpoint) {
  const results = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}`, { headers });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    if (page >= totalPages) break;
    page++;
  }
  return results;
}

async function main() {
  const [categories, tags] = await Promise.all([
    fetchAll('categories'),
    fetchAll('tags'),
  ]);

  console.log(`\n=== CATEGORIES (${categories.length}) ===`);
  for (const c of categories.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  [${c.id}] ${c.name} (${c.count} posts)  slug: ${c.slug}`);
  }

  console.log(`\n=== TAGS (${tags.length}) ===`);
  for (const t of tags.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  [${t.id}] ${t.name} (${t.count} posts)  slug: ${t.slug}`);
  }
}

main().catch(err => console.error('Error:', err.message));
