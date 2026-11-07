// Cabeçalho, rodapé e seletor de idioma, injetados em todas as páginas.

import { CONFIG } from './config.js';
import { getLang, setLang } from './i18n.js';
import { trackVisit, loadVisitCount } from './analytics.js';

const NAV = [
  { href: '/', pt: 'Início', en: 'Home', id: 'home' },
  { href: '/ranking.html', pt: 'Ranking', en: 'Leaderboard', id: 'ranking' },
  { href: '/mestres.html', pt: 'Grandes mestres', en: 'Grandmasters', id: 'mestres' },
];

const bi = (pt, en) => `<span class="pt">${pt}</span><span class="en">${en}</span>`;

function header(active) {
  const links = NAV.map(
    (n) => `<a href="${n.href}"${n.id === active ? ' aria-current="page"' : ''}>${bi(n.pt, n.en)}</a>`
  ).join('');
  return `
  <div class="wrap bar">
    <a class="brand" href="/" aria-label="ChessLand">
      <img src="/assets/favicon.svg" alt="" width="34" height="34">
      <span>Chess<b>Land</b></span>
    </a>
    <nav class="nav" aria-label="principal">${links}</nav>
    <div class="bar-actions">
      <button class="lang" type="button" id="langBtn" aria-label="Idioma / Language">
        <span class="pt">EN</span><span class="en">PT</span>
      </button>
      <a class="btn btn-sm" href="${CONFIG.PLAY_STORE_URL}" rel="noopener">${bi('Baixar app', 'Get the app')}</a>
    </div>
  </div>`;
}

function footer() {
  const ICONS = {
    YouTube: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z',
    Instagram: 'M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z',
    TikTok: 'M19.6 6.7a5.4 5.4 0 0 1-3.3-1.7 5.4 5.4 0 0 1-1.3-3.2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9a6.3 6.3 0 1 0 5.4 6.2V9a8.8 8.8 0 0 0 4.9 1.5V7.1c-.1 0-.2-.3-.3-.4z',
  };
  const socials = [
    ['YouTube', CONFIG.YOUTUBE_URL],
    ['Instagram', CONFIG.INSTAGRAM_URL],
    ['TikTok', CONFIG.TIKTOK_URL],
  ].filter(([, url]) => url).map(([name, url]) =>
    `<a class="social" href="${url}" rel="noopener" target="_blank" aria-label="${name}" title="${name}"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="${ICONS[name]}"/></svg></a>`
  ).join('');
  const year = new Date().getFullYear();
  return `
  <div class="wrap foot">
    <div class="foot-brand">
      <span class="brand-text">Chess<b>Land</b></span>
      <p>${bi('Xadrez online, contra bots e com análise — de graça no Android.', 'Online chess, bots and analysis — free on Android.')}</p>
    </div>
    <div class="foot-links">
      <a href="/ranking.html">${bi('Ranking', 'Leaderboard')}</a>
      <a href="/mestres.html">${bi('Grandes mestres', 'Grandmasters')}</a>
      <a href="${CONFIG.PLAY_STORE_URL}" rel="noopener">Google Play</a>
    </div>
    ${socials ? `<div class="socials">${socials}</div>` : ''}
    <p class="foot-copy">${CONFIG.SHOW_VISIT_COUNTER ? '<span id="visitCount" hidden></span> · ' : ''}© ${year} <a href="${CONFIG.DEVELOPER_URL}" rel="noopener">${CONFIG.DEVELOPER_NAME}</a></p>
  </div>`;
}

export function initPage(active) {
  setLang(getLang());
  const h = document.getElementById('site-header');
  const f = document.getElementById('site-footer');
  if (h) h.innerHTML = header(active);
  if (f) f.innerHTML = footer();
  const btn = document.getElementById('langBtn');
  if (btn) btn.addEventListener('click', () => setLang(getLang() === 'pt' ? 'en' : 'pt'));
  showVisits();
}

export async function showVisits() {
  await trackVisit().catch(() => {});
  const n = await loadVisitCount();
  const el = document.getElementById('visitCount');
  if (n === null || !el) return;
  const fmt = n.toLocaleString(getLang() === 'pt' ? 'pt-BR' : 'en-US');
  el.innerHTML = `👁 ${fmt} <span class="pt">visitantes</span><span class="en">visitors</span>`;
  el.hidden = false;
}
