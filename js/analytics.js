// Contador de acessos simples e privado (Supabase). Sem cookies, sem IP, sem dados pessoais.
import { CONFIG, hasSupabaseKey } from './config.js';
import { getLang } from './i18n.js';

function visitorId() {
  try {
    let id = localStorage.getItem('chessland.vid');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, '');
      localStorage.setItem('chessland.vid', id);
    }
    return id;
  } catch { return 'anon'; }
}

export async function trackVisit() {
  if (!CONFIG.ANALYTICS || !hasSupabaseKey()) return;
  if (['localhost', '127.0.0.1', ''].includes(location.hostname)) return; // não conta seus testes
  if (navigator.doNotTrack === '1') return;
  let ref = '';
  try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* ignora */ }
  if (ref === location.hostname) ref = '';
  const key = CONFIG.SUPABASE_ANON_KEY;
  const headers = { 'Content-Type': 'application/json', apikey: key };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/record_visit`, {
    method: 'POST', headers, keepalive: true,
    body: JSON.stringify({ p_visitor: visitorId(), p_path: location.pathname, p_lang: getLang(), p_ref: ref }),
  }).catch(() => {});
}

export async function loadVisitCount() {
  if (!CONFIG.SHOW_VISIT_COUNTER || !hasSupabaseKey()) return null;
  const key = CONFIG.SUPABASE_ANON_KEY;
  const headers = { 'Content-Type': 'application/json', apikey: key };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  try {
    const r = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_visit_count`, { method: 'POST', headers, body: '{}' });
    if (!r.ok) return null;
    const n = Number(await r.json());
    return Number.isFinite(n) ? n : null;
  } catch { return null; }
}
