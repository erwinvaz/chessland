// Leitura de PGN (SAN) e de lances em UCI ("e2e4 e7e5 ..."), que é como o app
// grava `games.pgn` durante a partida. Módulo puro: roda no navegador e no Node.

import { Chess } from './vendor/chess.js';

const UCI_RE = /^[a-h][1-8][a-h][1-8][qrbn]?$/i;
const RESULTS = new Set(['1-0', '0-1', '1/2-1/2', '*']);

/** Divide um arquivo com várias partidas em PGNs individuais. */
export function splitGames(text) {
  const norm = String(text || '').replace(/\r\n?/g, '\n').trim();
  if (!norm) return [];
  return norm
    .split(/\n\s*\n(?=\s*\[Event\s)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Lê as tags [Chave "valor"] do cabeçalho. */
export function readHeaders(text) {
  const h = {};
  const re = /^\s*\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/gm;
  let m;
  while ((m = re.exec(String(text || '')))) h[m[1]] = m[2].replace(/\\(.)/g, '$1');
  return h;
}

export function looksLikeUci(text) {
  const toks = String(text || '').trim().split(/\s+/).filter(Boolean);
  return toks.length > 0 && toks.every((t) => UCI_RE.test(t));
}

function movesText(text) {
  let s = String(text || '').replace(/\r\n?/g, '\n');
  s = s.replace(/^\s*\[[^\n]*\]\s*$/gm, ' '); // cabeçalhos
  s = s.replace(/\{[^}]*\}/g, ' '); // comentários { }
  s = s.replace(/;[^\n]*/g, ' '); // comentários de linha
  let prev;
  do {
    prev = s;
    s = s.replace(/\([^()]*\)/g, ' '); // variantes (aninhadas, de dentro para fora)
  } while (s !== prev);
  s = s.replace(/\$\d+/g, ' '); // NAGs
  s = s.replace(/\d+\s*\.(\s*\.\.)?/g, ' '); // números de lance: "1." "12..."
  return s;
}

function cleanSan(tok) {
  return tok.replace(/[!?]+$/g, '').replace(/^0-0-0$/, 'O-O-O').replace(/^0-0$/, 'O-O');
}

/**
 * Reproduz a partida e devolve todas as posições.
 * { headers, plies:[{san,from,to}], boards:[8x8...], fens:[...], result, complete }
 * `complete` = false se algum lance não pôde ser aplicado (a parte válida é mantida).
 */
export function parseGame(text) {
  const raw = String(text || '');
  const headers = readHeaders(raw);
  const startFen = headers.SetUp === '1' && headers.FEN ? headers.FEN : undefined;

  let chess;
  try {
    chess = startFen ? new Chess(startFen) : new Chess();
  } catch {
    chess = new Chess();
  }

  const plies = [];
  const boards = [chess.board()];
  const fens = [chess.fen()];
  let result = headers.Result || '*';
  let complete = true;

  const push = (mv) => {
    plies.push({ san: mv.san, from: mv.from, to: mv.to });
    boards.push(chess.board());
    fens.push(chess.fen());
  };

  if (looksLikeUci(raw)) {
    for (const tok of raw.trim().split(/\s+/)) {
      try {
        const mv = chess.move({
          from: tok.slice(0, 2).toLowerCase(),
          to: tok.slice(2, 4).toLowerCase(),
          promotion: tok.length === 5 ? tok[4].toLowerCase() : undefined,
        });
        push(mv);
      } catch {
        complete = false;
        break;
      }
    }
  } else {
    for (const rawTok of movesText(raw).split(/\s+/).filter(Boolean)) {
      if (RESULTS.has(rawTok)) {
        if (!headers.Result) result = rawTok;
        continue;
      }
      try {
        push(chess.move(cleanSan(rawTok)));
      } catch {
        complete = false;
        break;
      }
    }
  }

  if (result === '*' && complete && chess.isGameOver()) {
    if (chess.isCheckmate()) result = chess.turn() === 'w' ? '0-1' : '1-0';
    else result = '1/2-1/2';
  }

  return { headers, plies, boards, fens, result, complete };
}
