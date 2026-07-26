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

const LAYOUT_HEAD = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARTIKEL_TITLE — Guru Affiliate</title>
<meta name="description" content="ARTIKEL_DESC">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://guruaffiliate.vercel.app/artikel/ARTIKEL_SLUG">
<meta property="og:type" content="article">
<meta property="og:url" content="https://guruaffiliate.vercel.app/artikel/ARTIKEL_SLUG">
<meta property="og:title" content="ARTIKEL_TITLE">
<meta property="og:description" content="ARTIKEL_DESC">
<meta property="og:image" content="https://picsum.photos/seed/ga-artikel/1200/630">
<meta property="og:locale" content="id_ID">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--bg:#09090b;--card:#111114;--border:rgba(255,255,255,0.06);--fg:#e4e4e7;--fg-muted:#a1a1aa;--fg-dim:#71717a;--accent:#10b981;--font:'Inter',-apple-system,sans-serif;--radius:16px;--radius-sm:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font);background:var(--bg);color:var(--fg);-webkit-font-smoothing:antialiased;line-height:1.8}
.container{max-width:768px;margin:0 auto;padding:0 20px}
.nav{padding:14px 0;border-bottom:1px solid var(--border);background:rgba(9,9,11,0.85);backdrop-filter:blur(14px);position:sticky;top:0;z-index:100}
.nav-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;max-width:960px;margin:0 auto;padding:0 20px}
.logo{font-size:1.15rem;font-weight:800;display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--fg)}
.logo svg{width:22px;height:22px;color:var(--accent)}
.logo span{background:linear-gradient(135deg,var(--accent),#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.nav-links{display:flex;gap:6px;font-size:.82rem;flex-wrap:wrap}
.nav-links a{color:var(--fg-muted);text-decoration:none;padding:6px 14px;border-radius:20px;transition:all .2s}
.nav-links a:hover{color:var(--fg);background:var(--card)}
.nav-links .active{color:var(--fg);background:rgba(16,185,129,0.1)}
.content{padding:40px 0}
.back{display:inline-flex;align-items:center;gap:6px;color:var(--fg-muted);text-decoration:none;font-size:.82rem;margin-bottom:20px}
.back:hover{color:var(--fg)}
.article-header{margin-bottom:24px}
.article-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:20px;padding:4px 14px;font-size:.65rem;color:var(--accent);font-weight:500;margin-bottom:12px}
.article-header h1{font-size:1.6rem;font-weight:800;letter-spacing:-0.03em;line-height:1.2;margin-bottom:6px}
.article-meta{font-size:.75rem;color:var(--fg-dim)}
.article-meta span{margin-right:16px}
.content-body p{color:var(--fg-muted);font-size:.92rem;margin-bottom:14px;line-height:1.8}
.content-body p strong{color:var(--fg)}
.content-body .source{margin-top:24px;padding:12px 16px;background:var(--card);border-radius:var(--radius-sm);border:1px solid var(--border);font-size:.8rem;color:var(--fg-dim);text-align:center}
.content-body hr{margin:20px 0;border:none;border-top:1px solid var(--border)}
.footer{text-align:center;padding:28px 20px;border-top:1px solid var(--border);font-size:.72rem;color:var(--fg-dim)}
.footer strong{color:var(--fg-muted)}
</style></head><body>
<nav class="nav"><div class="nav-inner">
<a href="/" class="logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg><span>Guru Affiliate</span></a>
<div class="nav-links"><a href="/">Beranda</a><a href="/kursus">Kursus</a><a href="/artikel" class="active">Artikel</a></div></div></nav>
<div class="container"><div class="content">`;

const LAYOUT_TAIL = `</div></div>
<footer class="footer"><p><strong>Guru Affiliate</strong> — 2026</p></footer>
</body></html>`;

function renderHTML(article) {
  let html = LAYOUT_HEAD
    .replace(/ARTIKEL_TITLE/g, article.title)
    .replace(/ARTIKEL_DESC/g, article.title)
    .replace(/ARTIKEL_SLUG/g, article.slug);

  const date = article.created_at
    ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  html += `<a href="/artikel" class="back">← Kembali ke artikel</a>
    <div class="article-header">
      <div class="article-badge">🤖 Auto-Article · @${article.source_account}</div>
      <h1>${article.title}</h1>
      <div class="article-meta">
        <span>📅 ${date}</span>
        <span>👤 @${article.source_account}</span>
      </div>
    </div>
    <div class="content-body">
      ${article.content_html || article.content.replace(/\n/g, '<br>')}
    </div>`;

  html += LAYOUT_TAIL;
  return html;
}

function renderList(articles) {
  let cards = articles.map(a => {
    const cat = a.article_type === 'premium' ? '⭐ Premium' : '🤖 Auto';
    const date = a.created_at ? new Date(a.created_at).toISOString().slice(0, 10).split('-').reverse().join('/') : '-';
    return `<a href="/artikel/${a.slug}" class="card">
      <div class="card-cat">${cat}</div>
      <h3>${a.title}</h3>
      <div class="card-meta"><span>📅 ${date}</span><span>👤 @${a.source_account}</span></div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html><html lang="id"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artikel Affiliate Shopee — Guru Affiliate</title>
    <meta name="description" content="Artikel affiliate Shopee dari para praktisi.">
    <meta property="og:title" content="Artikel Affiliate Shopee — Guru Affiliate">
    <meta property="og:image" content="https://picsum.photos/seed/ga-artikel/1200/630">
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
    :root{--bg:#09090b;--card:#111114;--border:rgba(255,255,255,0.06);--fg:#e4e4e7;--fg-muted:#a1a1aa;--fg-dim:#71717a;--accent:#10b981;--font:'Inter',-apple-system,sans-serif;--radius:16px}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:var(--font);background:var(--bg);color:var(--fg);-webkit-font-smoothing:antialiased;line-height:1.7}
    .container{max-width:860px;margin:0 auto;padding:0 20px}
    .nav{padding:14px 0;border-bottom:1px solid var(--border);background:rgba(9,9,11,0.85);backdrop-filter:blur(14px);position:sticky;top:0;z-index:100}
    .nav-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;max-width:960px;margin:0 auto;padding:0 20px}
    .logo{font-size:1.15rem;font-weight:800;display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--fg)}
    .logo svg{width:22px;height:22px;color:var(--accent)}
    .logo span{background:linear-gradient(135deg,var(--accent),#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .nav-links{display:flex;gap:6px;font-size:.82rem;flex-wrap:wrap}
    .nav-links a{color:var(--fg-muted);text-decoration:none;padding:6px 14px;border-radius:20px;transition:all .2s}
    .nav-links a:hover{color:var(--fg);background:var(--card)}
    .nav-links .active{color:var(--fg);background:rgba(16,185,129,0.1)}
    .page-header{padding:40px 0 24px}
    .page-header h1{font-size:1.8rem;font-weight:800}
    .page-header h1 span{background:linear-gradient(135deg,#f4f4f5,#a1a1aa,var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .page-header p{color:var(--fg-muted);font-size:.85rem;margin-top:8px}
    .card-grid{display:grid;gap:14px;margin-bottom:40px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;transition:all .25s;text-decoration:none;color:inherit;display:block}
    .card:hover{border-color:rgba(16,185,129,0.2);transform:translateY(-2px)}
    .card-cat{font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);font-weight:600;margin-bottom:8px}
    .card h3{font-size:.95rem;font-weight:600;margin-bottom:6px;line-height:1.4}
    .card-meta{display:flex;gap:12px;margin-top:10px;font-size:.68rem;color:var(--fg-dim)}
    .footer{text-align:center;padding:28px 20px;border-top:1px solid var(--border);font-size:.72rem;color:var(--fg-dim)}
    .footer strong{color:var(--fg-muted)}
    @media(min-width:768px){.card-grid{grid-template-columns:1fr 1fr}}
    </style></head><body>
    <nav class="nav"><div class="nav-inner">
    <a href="/" class="logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg><span>Guru Affiliate</span></a>
    <div class="nav-links"><a href="/">Beranda</a><a href="/kursus">Kursus</a><a href="/artikel" class="active">Artikel</a></div></div></nav>
    <div class="container">
    <div class="page-header"><h1>📚 <span>Artikel</span></h1><p>Kumpulan strategi, trik, dan insight dari affiliate marketer Indonesia</p></div>
    <div class="card-grid">${cards}</div>
    </div>
    <footer class="footer"><p><strong>Guru Affiliate</strong> — Artikel · 2026</p></footer>
    </body></html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { slug } = req.query;
    const client = getPool();

    if (slug) {
      const result = await client.query(
        `SELECT * FROM articles WHERE slug = $1 AND status = 'published' LIMIT 1`, [slug]
      );
      if (result.rows.length === 0) {
        return res.status(404)
          .setHeader('Content-Type', 'text/html; charset=utf-8')
          .send('<h1>404 — Artikel tidak ditemukan</h1><a href="/artikel">← Kembali</a>');
      }
      return res
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
        .send(renderHTML(result.rows[0]));
    }

    const result = await client.query(
      `SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT 50`
    );
    return res
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
      .send(renderList(result.rows));
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).setHeader('Content-Type', 'application/json').json({ error: error.message });
  }
};
