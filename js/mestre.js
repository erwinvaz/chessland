// Página de um grande mestre: lista as partidas do PGN e reproduz a escolhida.

import { parseGame, splitGames, readHeaders } from './pgn.js';
import { createViewer } from './viewer.js';
import { t, getLang, onLangChange } from './i18n.js';

const $ = (id) => document.getElementById(id);

export async function initMestre(slug) {
  let masters;
  try {
    masters = await (await fetch('/data/mestres.json')).json();
  } catch {
    $('status').textContent = t('network');
    return;
  }
  const m = masters.find((x) => x.slug === slug);
  if (!m) { $('status').textContent = t('notfound'); return; }

  let games = [];
  try {
    const txt = await (await fetch('/data/pgn/' + encodeURIComponent(m.pgn))).text();
    games = splitGames(txt);
  } catch {
    $('status').textContent = t('network');
    return;
  }
  if (games.length === 0) { $('status').textContent = t('noGames'); return; }

  $('status').hidden = true;
  $('content').hidden = false;

  const viewer = createViewer({ boardEl: $('board'), movesEl: $('moves'), controlsEl: $('controls') });
  const list = $('gameList');
  let current = 0;

  const label = (pgn, i) => {
    const h = readHeaders(pgn);
    const who = h.White && h.Black ? `${h.White} – ${h.Black}` : `${t('gameNo')} ${i + 1}`;
    const extra = [h.Event, (h.Date || '').split('.')[0]].filter((v) => v && v !== '?').join(', ');
    return { who, extra, result: h.Result || '' };
  };

  const renderList = () => {
    list.textContent = '';
    games.forEach((pgn, i) => {
      const { who, extra, result } = label(pgn, i);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.style.textAlign = 'left';
      b.textContent = `${who}${extra ? ' · ' + extra : ''}${result ? ' · ' + result : ''}`;
      if (i === current) b.style.borderColor = 'var(--gold)';
      b.addEventListener('click', () => select(i));
      list.append(b);
    });
  };

  function select(i) {
    current = i;
    const parsed = parseGame(games[i]);
    viewer.setGame(parsed);
    const { who, extra } = label(games[i], i);
    $('gameTitle').textContent = who;
    $('gameMeta').textContent = extra;
    $('warn').hidden = parsed.complete;
    $('warn').textContent = t('incomplete');
    renderList();
  }

  select(0);
  onLangChange(() => { $('warn').textContent = t('incomplete'); renderList(); });
}
