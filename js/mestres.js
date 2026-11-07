import { getLang, onLangChange, t } from './i18n.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function initMestres() {
  const box = document.getElementById('masters');
  let masters;
  try {
    masters = await (await fetch('/data/mestres.json')).json();
  } catch {
    box.innerHTML = `<div class="state">${esc(t('network'))}</div>`;
    return;
  }
  const render = () => {
    const lang = getLang();
    box.innerHTML = masters.map((m) => `
      <a class="card master-card" href="/mestre/${esc(m.slug)}/" style="color:inherit;text-decoration:none">
        <h3>${esc(m.country)} ${esc(m.name)}</h3>
        <span class="meta">${esc(m.years)}</span>
        <p>${esc(m['bio_' + lang] || m.bio_pt)}</p>
        <span class="chip" style="align-self:flex-start">${esc(t('open'))} →</span>
      </a>`).join('');
  };
  render();
  onLangChange(render);
}
