import { fetchGame, ApiError } from './api.js';
import { parseGame } from './pgn.js';
import { createViewer } from './viewer.js';
import { CONFIG } from './config.js';
import { t, onLangChange } from './i18n.js';

const $ = (id) => document.getElementById(id);

export async function initJogo() {
  const id = new URLSearchParams(location.search).get('id');
  const status = $('status');
  const content = $('content');
  let data = null;
  let parsed = null;

  const showError = (code) => {
    content.hidden = true;
    status.hidden = false;
    status.textContent = t(code);
  };

  const names = () => {
    if (!data) return;
    $('whiteName').textContent = `${data.white_name || t('anon')}${data.white_rating ? ` (${data.white_rating})` : ''}`;
    $('blackName').textContent = `${data.black_name || t('anon')}${data.black_rating ? ` (${data.black_rating})` : ''}`;
    const w = data.winner;
    $('result').textContent = w === 'white' ? t('whiteWins') : w === 'black' ? t('blackWins') : t('draw');
    $('warn').hidden = !parsed || parsed.complete;
    $('warn').textContent = t('incomplete');
  };

  onLangChange(names);

  try {
    status.textContent = t('loading');
    data = await fetchGame(id);
  } catch (e) {
    return showError(e instanceof ApiError ? e.code : 'network');
  }

  parsed = parseGame(data.pgn || '');
  status.hidden = true;
  content.hidden = false;

  const viewer = createViewer({ boardEl: $('board'), movesEl: $('moves'), controlsEl: $('controls') });
  viewer.setGame(parsed, { atEnd: true });
  names();

  $('openApp').href = CONFIG.APP_LINK_BASE + encodeURIComponent(id);
  $('getApp').href = CONFIG.PLAY_STORE_URL;
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); $('copy').textContent = t('copied'); }
    catch { window.prompt('Link', location.href); }
    setTimeout(() => ($('copy').textContent = t('copy')), 1800);
  });
  $('copy').textContent = t('copy');
  onLangChange(() => ($('copy').textContent = t('copy')));
}
