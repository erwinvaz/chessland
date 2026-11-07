-- ChessLand — contador de acessos do site (privado: só você vê, no SQL Editor).
-- Não guarda IP, nome nem e-mail: só um id aleatório do navegador, a página, o idioma e a origem.

create table if not exists public.site_visits (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor    text,
  path       text,
  lang       text,
  referrer   text
);

alter table public.site_visits enable row level security;  -- sem policies: ninguém lê/escreve direto

create or replace function public.record_visit(
  p_visitor text, p_path text, p_lang text, p_ref text
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.site_visits (visitor, path, lang, referrer)
  values (left(p_visitor, 40), left(p_path, 200), left(p_lang, 5), left(p_ref, 200));
$$;

revoke all on function public.record_visit(text, text, text, text) from public;
grant execute on function public.record_visit(text, text, text, text) to anon, authenticated;

-- Contador público (rodapé do site): só devolve o total de visitantes únicos, nada mais.
create or replace function public.get_visit_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(distinct visitor) from public.site_visits
$$;

revoke all on function public.get_visit_count() from public;
grant execute on function public.get_visit_count() to anon, authenticated;

-- Relatório por dia (rode no SQL Editor quando quiser ver o engajamento):
create or replace view public.site_stats_daily as
select
  (created_at at time zone 'America/Fortaleza')::date as dia,
  count(*)                 as visualizacoes,
  count(distinct visitor)  as visitantes_unicos
from public.site_visits
group by 1
order by 1 desc;

-- Exemplos:
--   select * from public.site_stats_daily limit 30;
--   select path, count(*) from public.site_visits group by 1 order by 2 desc;       -- páginas mais vistas
--   select coalesce(nullif(referrer,''),'direto') origem, count(*) from public.site_visits group by 1 order by 2 desc;
--   select count(distinct visitor) as total_visitantes from public.site_visits;
