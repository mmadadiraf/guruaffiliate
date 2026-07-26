const { Pool } = require('pg');

let pool = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { slug } = req.query;
    const client = getPool();

    if (slug) {
      const result = await client.query(
        `SELECT id, title, slug, source_account, content, content_html,
                article_type, status, engagement, created_at, updated_at
         FROM articles WHERE slug = $1 AND status = 'published' LIMIT 1`, [slug]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Tidak ditemukan' });
      const a = result.rows[0];
      return res.json({ id: a.id, title: a.title, slug: a.slug, account: a.source_account,
        content: a.content, content_html: a.content_html, type: a.article_type,
        status: a.status, engagement: a.engagement, created_at: a.created_at, updated_at: a.updated_at });
    }

    const result = await client.query(
      `SELECT id, title, slug, source_account, article_type, created_at
       FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT 50`
    );
    return res.json(result.rows.map(a => ({ id: a.id, title: a.title, slug: a.slug,
      account: a.source_account, type: a.article_type,
      date: a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : null })));
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message, note: 'Cek NEON_DATABASE_URL di env Vercel' });
  }
};
