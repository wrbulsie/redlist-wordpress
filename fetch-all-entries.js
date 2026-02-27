const { WP_URL, WP_USER, WP_APP_PASSWORD } = process.env;
const credentials = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
const headers = { Authorization: `Basic ${credentials}` };

async function fetchAll() {
  let page = 1, all = [];
  while(true) {
    const r = await fetch(`${WP_URL}/wp-json/wp/v2/dictionary?per_page=100&page=${page}`, { headers });
    const d = await r.json();
    if (!d.length) break;
    all.push(...d.map(p => ({ id: p.id, slug: p.slug, title: p.title.rendered, status: p.status })));
    page++;
  }
  console.log(JSON.stringify(all, null, 2));
}

fetchAll();