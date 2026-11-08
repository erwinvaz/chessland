// Gera mestre/<slug>/index.html (SEO estático, com a lista de partidas no HTML) e sitemap.xml
// a partir de data/mestres.json + data/pgn/*.pgn.
// Uso: node tools/gerar_mestres.mjs   (rode de novo sempre que mudar mestres.json ou um PGN)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitGames, readHeaders } from '../js/pgn.js';
import { CONFIG } from '../js/config.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://chessland.com.br';
const masters = JSON.parse(readFileSync(join(root, 'data/mestres.json'), 'utf8'));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function gameLabel(pgn, i) {
  const h = readHeaders(pgn);
  const who = h.White && h.Black ? `${h.White} – ${h.Black}` : `Partida ${i + 1}`;
  const year = (h.Date || '').split('.')[0];
  const extra = [h.Event, /^\d{4}$/.test(year) ? year : ''].filter((v) => v && v !== '?').join(', ');
  return { who, extra, result: h.Result || '' };
}

for (const m of masters) {
  const games = splitGames(readFileSync(join(root, 'data/pgn', m.pgn), 'utf8'));
  const n = games.length;
  const items = games.map((g, i) => {
    const { who, extra, result } = gameLabel(g, i);
    return `        <li><a href="#g${i}" data-i="${i}">${esc(who)}${extra ? ' · ' + esc(extra) : ''}${result ? ' · ' + esc(result) : ''}</a></li>`;
  }).join('\n');

  const descPt = `${m.bio_pt} ${n} ${n === 1 ? 'partida' : 'partidas'} para rever lance a lance.`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: m.name,
    description: m.bio_en,
    url: `${SITE}/mestre/${m.slug}/`,
    knowsAbout: 'Chess',
  };
  const dir = join(root, 'mestre', m.slug);
  mkdirSync(dir, { recursive: true });
  const html = `<!doctype html>
<html lang="pt-BR" data-lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.name)} — ${n} ${n === 1 ? 'partida' : 'partidas'} comentadas lance a lance | ChessLand</title>
<meta name="description" content="${esc(descPt)}">
<link rel="canonical" href="${SITE}/mestre/${m.slug}/">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#0a0a0f">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(m.name)} — ChessLand">
<meta property="og:description" content="${esc(descPt)}">
<meta property="og:url" content="${SITE}/mestre/${m.slug}/">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="stylesheet" href="/css/style.css?v=4">
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
        </div>
      </div>
    </div>
    <aside class="app-note">
      <p><span class="pt">No app <b>ChessLand</b> você encontra <b>muito mais partidas</b> de ${esc(m.name)} e de outros grandes mestres.</span><span class="en">In the <b>ChessLand</b> app you'll find <b>many more games</b> by ${esc(m.name)} and other grandmasters.</span></p>
      <a class="btn btn-sm" href="${CONFIG.PLAY_STORE_URL}" rel="noopener"><span class="pt">Baixar no Google Play</span><span class="en">Get it on Google Play</span></a>
    </aside>
    <section class="game-index-wrap">
      <h2><span class="pt">Partidas de ${esc(m.name)} (${n})</span><span class="en">Games by ${esc(m.name)} (${n})</span></h2>
      <ol class="game-index" id="gameIndex">
${items}
      </ol>
    </section>
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
