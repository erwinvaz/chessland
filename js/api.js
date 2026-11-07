// Acesso somente-leitura ao Supabase via REST (sem biblioteca).
// Só usa a view `ranking_publico` e a função `get_public_game` (ver sql/01_public_views.sql).

import { CONFIG, hasSupabaseKey } from './config.js';

const RATING_COLS = ['rating_rapid', 'rating_blitz', 'rating_bullet'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function headers(extra = {}) {
  const key = CONFIG.SUPABASE_ANON_KEY;
  const h = { apikey: key, ...extra };
  // Chaves JWT (eyJ...) vão também em Authorization; chaves "sb_publishable_" não.
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`;
  return h;
}

export class ApiError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // 'nokey' | 'network' | 'http' | 'notfound' | 'badid'
  }
}

async function request(url, init) {
  if (!hasSupabaseKey()) throw new ApiError('nokey');
  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ApiError('network', e.message);
  }
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch { /* ignora */ }
    console.error('[ChessLand] Supabase respondeu', res.status, body);
    let msg = `HTTP ${res.status}`;
    try { const j = JSON.parse(body); msg += ` — ${j.message || j.hint || j.error || ''}`; } catch { /* corpo não é JSON */ }
    throw new ApiError('http', msg);
  }
  return res.json();
}

export async function fetchRanking(col = 'rating_rapid', limit = 50) {
  if (!RATING_COLS.includes(col)) col = 'rating_rapid';
  const n = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const select = 'username,country_flag,theme_emoji,rating_rapid,rating_blitz,rating_bullet';
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/ranking_publico?select=${select}&order=${col}.desc.nullslast&limit=${n}`;
  return request(url, { headers: headers() });
}

export async function fetchGame(id) {
  if (!UUID_RE.test(id || '')) throw new ApiError('badid');
  const rows = await request(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_public_game`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ p_id: id }),
  });
  if (!Array.isArray(rows) || rows.length === 0) throw new ApiError('notfound');
  return rows[0];
}

export async function fetchRecentGames(limit = 15) {
  return request(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_recent_games`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ p_limit: limit }),
  });
}
