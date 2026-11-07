// Idioma: o HTML estático traz <span class="pt"> e <span class="en">; o CSS mostra um só.
// Este módulo guarda a escolha e traduz os textos dinâmicos (JS).

const KEY = 'chessland.lang';

export function detectLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch { /* sem storage: ignora */ }
  const nav = (navigator.language || 'pt').toLowerCase();
  return nav.startsWith('pt') ? 'pt' : 'en';
}

let current = detectLang();
const listeners = new Set();

export const getLang = () => current;

export function setLang(lang) {
  current = lang === 'en' ? 'en' : 'pt';
  document.documentElement.dataset.lang = current;
  document.documentElement.lang = current === 'pt' ? 'pt-BR' : 'en';
  try { localStorage.setItem(KEY, current); } catch { /* ignora */ }
  listeners.forEach((fn) => fn(current));
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const DICT = {
  pt: {
    loading: 'Carregando…',
    nokey: 'O site ainda não está conectado ao Supabase (falta a chave em js/config.js).',
    network: 'Não foi possível conectar. Verifique sua internet e tente de novo.',
    http: 'O servidor não respondeu como esperado. Tente novamente em instantes.',
    notfound: 'Partida não encontrada, ou ainda em andamento.',
    badid: 'Link de partida inválido.',
    empty: 'Nenhum jogador no ranking ainda. Seja o primeiro!',
    games: 'partidas',
    latestGame: 'Última partida jogada no ChessLand',
    elo: 'Elo ChessLand',
    wins: 'vitórias',
    white: 'Brancas',
    black: 'Pretas',
    draw: 'Empate',
    whiteWins: 'Brancas vencem',
    blackWins: 'Pretas vencem',
    incomplete: 'Parte dos lances não pôde ser lida.',
    move: 'Lance',
    start: 'Posição inicial',
    anon: 'Jogador',
    copy: 'Copiar link',
    copied: 'Link copiado!',
    playing: 'Reproduzindo',
    paused: 'Pausado',
    noGames: 'Nenhuma partida cadastrada ainda.',
    open: 'Ver partida',
    moves: 'lances',
    gameNo: 'Partida',
    rapid: 'Rápida',
    blitz: 'Blitz',
    bullet: 'Bullet',
  },
  en: {
    loading: 'Loading…',
    nokey: 'The site is not connected to Supabase yet (missing key in js/config.js).',
    network: 'Could not connect. Check your internet and try again.',
    http: 'The server did not respond as expected. Please try again shortly.',
    notfound: 'Game not found, or still in progress.',
    badid: 'Invalid game link.',
    empty: 'No players on the leaderboard yet. Be the first!',
    games: 'games',
    latestGame: 'Latest game played on ChessLand',
    elo: 'ChessLand Elo',
    wins: 'wins',
    white: 'White',
    black: 'Black',
    draw: 'Draw',
    whiteWins: 'White wins',
    blackWins: 'Black wins',
    incomplete: 'Part of the moves could not be read.',
    move: 'Move',
    start: 'Starting position',
    anon: 'Player',
    copy: 'Copy link',
    copied: 'Link copied!',
    playing: 'Playing',
    paused: 'Paused',
    noGames: 'No games added yet.',
    open: 'View game',
    moves: 'moves',
    gameNo: 'Game',
    rapid: 'Rapid',
    blitz: 'Blitz',
    bullet: 'Bullet',
  },
};

export const t = (key) => DICT[current][key] ?? DICT.pt[key] ?? key;
