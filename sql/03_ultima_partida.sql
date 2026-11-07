-- ChessLand — últimas partidas terminadas, para o tabuleiro animado da página inicial.
-- Rode no Supabase (SQL Editor). Não altera tabelas nem o app.
-- Só devolve partidas com status 'finished'; não expõe ids de partida nem de jogador.
-- O site escolhe a primeira com lances suficientes (config HERO_MIN_MOVES).

create or replace function public.get_recent_games(p_limit int default 15)
returns table (
  game_type text,
  pgn text,
  winner text,
  white_name text,
  black_name text,
  finished_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    g.game_type,
    coalesce(nullif(g.pgn_final, ''), g.pgn),
    case
      when g.winner_id is null then 'draw'
      when g.winner_id = g.player_white_id then 'white'
      else 'black'
    end,
    wp.username,
    bp.username,
    g.updated_at
  from public.games g
  left join public.profiles wp on wp.id = g.player_white_id
  left join public.profiles bp on bp.id = g.player_black_id
  where g.status = 'finished'
    and length(coalesce(nullif(g.pgn_final, ''), g.pgn, '')) > 40
  order by g.updated_at desc
  limit least(greatest(p_limit, 1), 30)
$$;

revoke all on function public.get_recent_games(int) from public;
grant execute on function public.get_recent_games(int) to anon, authenticated;
