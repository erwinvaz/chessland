// Visualizador de partida: tabuleiro + lista de lances + controles + teclado.

import { Board } from './board.js';
import { t, onLangChange } from './i18n.js';

export function createViewer({ boardEl, movesEl, controlsEl }) {
  const board = new Board(boardEl);
  let game = null;
  let idx = 0;
  let timer = null;

  controlsEl.innerHTML = `
    <button type="button" data-a="first" aria-label="Início">⏮</button>
    <button type="button" data-a="prev" aria-label="Anterior">◀</button>
    <button type="button" data-a="play" aria-label="Play/Pause">▶</button>
    <button type="button" data-a="next" aria-label="Próximo">▶︎▶︎</button>
    <button type="button" data-a="last" aria-label="Fim">⏭</button>
    <button type="button" data-a="flip" aria-label="Girar">⇅</button>`;
  const btn = (a) => controlsEl.querySelector(`[data-a="${a}"]`);
  btn('next').textContent = '▶';
  btn('play').textContent = '⏵';
  btn('next').textContent = '›';
  btn('prev').textContent = '‹';
  btn('first').textContent = '«';
  btn('last').textContent = '»';

  const total = () => (game ? game.plies.length : 0);

  function renderMoves() {
    movesEl.textContent = '';
    if (!game) return;
    game.plies.forEach((p, k) => {
      if (k % 2 === 0) {
        const n = document.createElement('span');
        n.className = 'n';
        n.textContent = `${k / 2 + 1}.`;
        movesEl.append(n);
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = p.san;
      b.dataset.i = String(k + 1);
      b.addEventListener('click', () => go(k + 1));
      movesEl.append(b);
    });
  }

  function paint() {
    if (!game) return;
    board.render(game.boards[idx], idx > 0 ? game.plies[idx - 1] : null);
    movesEl.querySelectorAll('button').forEach((b) => b.classList.toggle('cur', Number(b.dataset.i) === idx));
    const cur = movesEl.querySelector('button.cur');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
    btn('first').disabled = btn('prev').disabled = idx === 0;
    btn('next').disabled = btn('last').disabled = idx === total();
  }

  function go(n) {
    idx = Math.max(0, Math.min(total(), n));
    paint();
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    btn('play').textContent = '⏵';
  }

  function play() {
    if (timer) return stop();
    if (idx >= total()) go(0);
    btn('play').textContent = '⏸';
    timer = setInterval(() => {
      if (idx >= total()) return stop();
      go(idx + 1);
    }, 900);
  }

  controlsEl.addEventListener('click', (e) => {
    const a = e.target.closest('button')?.dataset.a;
    if (!a) return;
    if (a !== 'play') stop();
    if (a === 'first') go(0);
    else if (a === 'prev') go(idx - 1);
    else if (a === 'next') go(idx + 1);
    else if (a === 'last') go(total());
    else if (a === 'flip') board.setFlipped(!board.flipped), paint();
    else if (a === 'play') play();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    const keys = { ArrowLeft: () => go(idx - 1), ArrowRight: () => go(idx + 1), Home: () => go(0), End: () => go(total()) };
    if (keys[e.key]) { e.preventDefault(); stop(); keys[e.key](); }
    else if (e.key === ' ') { e.preventDefault(); play(); }
  });

  onLangChange(() => paint());

  return {
    setGame(parsed, { atEnd = false } = {}) {
      stop();
      game = parsed;
      renderMoves();
      go(atEnd ? parsed.plies.length : 0);
    },
    flip(v) { board.setFlipped(v); paint(); },
  };
}
