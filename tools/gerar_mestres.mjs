// Gera mestre/<slug>/index.html (SEO estático) e sitemap.xml a partir de data/mestres.json.
// Uso: node tools/gerar_mestres.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://chessland.com.br';
const masters = JSON.parse(readFileSync(join(root, 'data/mestres.json'), 'utf8'));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

for (const m of masters) {
  const dir = join(root, 'mestre', m.slug);
  mkdirSync(dir, { recursive: true });
  const html = `<!doctype html>
<html lang="pt-BR" data-lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.name)} — Partidas | ChessLand</title>
<meta name="description" content="${esc(m.bio_pt)}">
<link rel="canonical" href="${SITE}/mestre/${m.slug}/">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#0a0a0f">
<meta property="og:title" content="${esc(m.name)} — ChessLand">
<meta property="og:description" content="${esc(m.bio_pt)}">
<link rel="stylesheet" href="/css/style.css">
</head>
<body data-slug="${esc(m.slug)}">
<header class="site-header" id="site-header"></header>
<main class="section">
  <div class="wrap">
    <div class="section-head">
      <h1>${esc(m.country)} ${esc(m.name)}</h1>
      <p class="muted"><span class="pt">${esc(m.bio_pt)}</span><span class="en">${esc(m.bio_en)}</span></p>
    </div>
    <p id="status" class="state"></p>
    <div id="content" hidden>
      <div class="game-layout">
        <div>
          <div id="board"></div>
          <div class="controls" id="controls"></div>
        </div>
        <div class="panel">
          <h2 id="gameTitle" style="font-size:1.3rem"></h2>
          <p class="muted" id="gameMeta"></p>
          <p id="warn" class="notice" hidden></p>
          <div class="moves" id="moves"></div>
          <div class="chips" id="gameList"></div>
        </div>
      </div>
    </div>
  </div>
</main>
<footer class="site-footer" id="site-footer"></footer>
<script type="module">
  import { initPage } from '/js/common.js';
  import { initMestre } from '/js/mestre.js';
  initPage('mestres');
  initMestre(document.body.dataset.slug);
</script>
</body>
</html>
`;
  writeFileSync(join(dir, 'index.html'), html);
}

const urls = ['/', '/ranking.html', '/mestres.html', ...masters.map((m) => `/mestre/${m.slug}/`)];
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);
console.log(`OK: ${masters.length} páginas de mestres + sitemap.xml`);
