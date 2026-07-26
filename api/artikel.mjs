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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const { slug } = req.query;
    const pool = getPool();

    if (slug) {
      // Detail artikel
      const result = await pool.query(
        `SELECT id, title, slug, source_account, content, content_html, 
                article_type, status, engagement, created_at, updated_at
         FROM articles 
         WHERE slug = $1 AND status = 'published'
         LIMIT 1`,
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artikel tidak ditemukan' });
      }

      const artikel = result.rows[0];
      return res.json({
        id: artikel.id,
        title: artikel.title,
        slug: artikel.slug,
        account: artikel.source_account,
        content: artikel.content,
        content_html: artikel.content_html,
        type: artikel.article_type,
        status: artikel.status,
        engagement: artikel.engagement,
        created_at: artikel.created_at,
        updated_at: artikel.updated_at,
      });
    } else {
      // List artikel
      const result = await pool.query(
        `SELECT id, title, slug, source_account, article_type, created_at
         FROM articles 
         WHERE status = 'published'
         ORDER BY created_at DESC
         LIMIT 50`
      );

      const articles = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        account: row.source_account,
        type: row.article_type,
        date: row.created_at ? row.created_at.toISOString().slice(0, 10) : null,
      }));

      return res.json(articles);
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
};
