-- ChessLand — acesso público somente-leitura para o site chessland.com.br
-- Rode no Supabase: SQL Editor → New query → Run.
-- Não altera tabelas, triggers nem o app. Só cria 1 view e 1 função.
-- Ajuste os nomes de colunas abaixo se o seu schema for diferente.

-- 1) Ranking público: mesma regra do app (RankingService): todos os perfis que não são bots.
--    Não expõe id, e-mail, avatar nem nada além do necessário.
drop view if exists public.ranking_publico;
create view public.ranking_publico
with (security_invoker = false) as
select
  p.username,
  p.country_flag,
  p.theme_emoji,
  p.rating_rapid,
  p.rating_blitz,
  p.rating_bullet
from public.profiles p
where p.is_bot = false
  and p.id::text not like '10000000-0000-0000-0000-%';

grant select on public.ranking_publico to anon, authenticated;

-- 2) Partida compartilhável: só devolve partidas TERMINADAS, e só quem tem o link (uuid).
--    Não dá para listar partidas: é preciso conhecer o id.
create or replace function public.get_public_game(p_id uuid)
returns table (
  id uuid,
  status text,
  game_type text,
  pgn text,
  winner text,
  white_name text,
  black_name text,
  white_rating int,
  black_rating int,
  finished_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    g.id,
    g.status,
    g.game_type,
    coalesce(nullif(g.pgn_final, ''), g.pgn),
    case
      when g.winner_id is null then 'draw'
      when g.winner_id = g.player_white_id then 'white'
      else 'black'
    end,
    wp.username,
    bp.username,
    gh.white_rating_after::int,
    gh.black_rating_after::int,
    g.updated_at
  from public.games g
  left join public.profiles wp on wp.id = g.player_white_id
  left join public.profiles bp on bp.id = g.player_black_id
  left join public.game_history gh on gh.game_id = g.id
  where g.id = p_id
    and g.status in ('finished', 'abandoned', 'draw')
  limit 1
$$;

revoke all on function public.get_public_game(uuid) from public;
grant execute on function public.get_public_game(uuid) to anon, authenticated;
