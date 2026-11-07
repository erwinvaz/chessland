// Tabuleiro somente leitura (DOM + CSS). Recebe posições no formato de chess.board().

// ︎ força a versão em texto do peão (sem isso, celulares mostram o emoji).
const GLYPH = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟︎',
};
const FILES = 'abcdefgh';

export class Board {
  constructor(root, { flipped = false } = {}) {
    this.root = root;
    this.flipped = flipped;
    this.cells = new Map();
    this.position = null;
    this.last = null;
    root.classList.add('board');
    root.setAttribute('role', 'img');
    this.build();
  }

  build() {
    this.root.textContent = '';
    this.cells.clear();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const file = this.flipped ? 7 - f : f;
        const rank = this.flipped ? r : 7 - r;
        const sq = FILES[file] + (rank + 1);
        const cell = document.createElement('div');
        cell.className = 'sq ' + ((file + rank) % 2 === 0 ? 'dark' : 'light');
        if (f === 0) {
          const c = document.createElement('span');
          c.className = 'coord coord-r';
          c.textContent = String(rank + 1);
          cell.append(c);
        }
        if (r === 7) {
          const c = document.createElement('span');
          c.className = 'coord coord-f';
          c.textContent = FILES[file];
          cell.append(c);
        }
        const pc = document.createElement('span');
        pc.className = 'pc';
        cell.append(pc);
        this.cells.set(sq, { cell, pc });
        this.root.append(cell);
      }
    }
    if (this.position) this.render(this.position, this.last);
  }

  setFlipped(value) {
    if (this.flipped === value) return;
    this.flipped = value;
    this.build();
  }

  /** position: matriz 8x8 de chess.board(); last: { from, to } ou null. */
  render(position, last = null) {
    this.position = position;
    this.last = last;
    for (const [sq, { cell, pc }] of this.cells) {
      const file = FILES.indexOf(sq[0]);
      const rank = Number(sq[1]) - 1;
      const piece = position[7 - rank][file];
      if (piece) {
        pc.textContent = GLYPH[piece.type];
        pc.className = 'pc ' + (piece.color === 'w' ? 'w' : 'b');
      } else {
        pc.textContent = '';
        pc.className = 'pc';
      }
      cell.classList.toggle('last', !!last && (sq === last.from || sq === last.to));
    }
  }
}
