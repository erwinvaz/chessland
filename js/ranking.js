import { fetchRanking, ApiError } from './api.js';
import { t, onLangChange } from './i18n.js';

const COLS = { rapid: 'rating_rapid', blitz: 'rating_blitz', bullet: 'rating_bullet' };
let mode = 'rapid';
let rows = null;
let errCode = null;
let errDetail = '';

const el = (id) => document.getElementById(id);

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function render() {
  const box = el('rankBody');
  if (errCode) { box.innerHTML = `<div class="state">${esc(t(errCode))}${errDetail ? `<br><small>${esc(errDetail)}</small>` : ''}</div>`; return; }
  if (!rows) { box.innerHTML = `<div class="state">${esc(t('loading'))}</div>`; return; }
  if (rows.length === 0) { box.innerHTML = `<div class="state">${esc(t('empty'))}</div>`; return; }
  const col = COLS[mode];
  const body = rows.map((r, i) => `
    <tr class="${i === 0 ? 'top1' : ''}">
      <td class="rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
      <td><span class="name"><span>${esc(r.country_flag || '')}</span><span>${esc(r.theme_emoji || '')}</span><span>${esc(r.username || t('anon'))}</span></span></td>
      <td class="num rating">${esc(r[col] ?? '—')}</td>
    </tr>`).join('');
  box.innerHTML = `<table><thead><tr><th>#</th><th>${esc(t('anon'))}</th><th class="num">${esc(t('elo'))}</th></tr></thead><tbody>${body}</tbody></table>`;
}

async function load() {
  rows = null; errCode = null; render();
  try {
    rows = await fetchRanking(COLS[mode], 50);
  } catch (e) {
    errCode = e instanceof ApiError ? e.code : 'network';
    errDetail = e instanceof ApiError && e.code === 'http' ? e.message : '';
  }
  render();
}

export function initRanking() {
  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => {
      mode = b.dataset.mode;
      document.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      load();
    });
  });
  onLangChange(render);
  load();
}
