// Tabuleiro animado da landing. Mostra a última partida válida do app (se houver)
// e, senão, a "Ópera de Morphy" em loop.

import { Board } from './board.js';
import { parseGame } from './pgn.js';
import { getLang } from './i18n.js';
import { CONFIG, hasSupabaseKey } from './config.js';
import { fetchRecentGames } from './api.js';

const OPERA = `[White "Paul Morphy"]
[Black "Duke of Brunswick & Count Isouard"]
[Event "Paris Opera"]
[Date "1858.??.??"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

/** Primeira partida terminada que o leitor reproduz inteira e que tem lances suficientes. */
async function pickLatest() {
  if (!CONFIG.HERO_USE_LATEST_GAME || !hasSupabaseKey()) return null;
  try {
    const rows = await fetchRecentGames(20);
    const minPlies = Math.max(1, Number(CONFIG.HERO_MIN_MOVES) || 10) * 2;
    for (const r of rows) {
      const g = parseGame(r.pgn || '');
      if (g.complete && g.plies.length >= minPlies) return { game: g, row: r };
    }
  } catch { /* sem rede / função ausente: usa a Ópera */ }
  return null;
}

const bi = (pt, en) => `<span class="pt">${pt}</span><span class="en">${en}</span>`;

export async function startHero({ board: boardEl, label: labelEl, white, black, caption }) {
  const board = new Board(boardEl);
  let game = parseGame(OPERA);
  let i = 0;
  let timer = null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const label = () => {
    if (!labelEl) return;
    if (i === 0) { labelEl.textContent = getLang() === 'pt' ? 'Posição inicial' : 'Starting position'; return; }
    labelEl.textContent = `${Math.ceil(i / 2)}${i % 2 ? '.' : '...'} ${game.plies[i - 1].san}`;
  };
  const show = () => {
    board.render(game.boards[i], i > 0 ? game.plies[i - 1] : null);
    label();
  };
  const tick = () => {
    const total = game.plies.length;
    if (i >= total) {
      timer = setTimeout(() => { i = 0; show(); timer = setTimeout(tick, 1200); }, 3200);
      return;
    }
    i += 1;
    show();
    timer = setTimeout(tick, 1000);
  };

  show();
  if (!reduce) timer = setTimeout(tick, 1500);

  // Troca para a última partida real assim que ela chegar.
  const latest = await pickLatest();
  if (latest) {
    clearTimeout(timer);
    game = latest.game;
    i = 0;
    const { row } = latest;
    const res = row.winner === 'white' ? '1-0' : row.winner === 'black' ? '0-1' : '½-½';
    if (white) white.textContent = row.white_name || (getLang() === 'pt' ? 'Jogador' : 'Player');
    if (black) black.textContent = row.black_name || (getLang() === 'pt' ? 'Jogador' : 'Player');
    if (caption) caption.innerHTML = `${bi('Última partida jogada no ChessLand', 'Latest game played on ChessLand')} · ${res}`;
    show();
    if (!reduce) timer = setTimeout(tick, 1500);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(timer); timer = null; }
    else if (!timer && !reduce) timer = setTimeout(tick, 600);
  });
}
