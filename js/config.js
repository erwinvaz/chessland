// Configuração do site. Edite aqui — é o único arquivo que você precisa mexer.

export const CONFIG = {
  // Projeto Supabase do ChessLand
  SUPABASE_URL: 'https://nyznzngsoqtrysydhcub.supabase.co',

  // Cole a anon key COMPLETA (Supabase → Project Settings → API → anon public).
  // Ela é pública por natureza; a segurança vem das views/funções de sql/01_public_views.sql.
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55em56bmdzb3F0cnlzeWRoY3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDg3MjcsImV4cCI6MjA3OTU4NDcyN30.iI0MGjG70JZoXQfj62hEGAFUQiLfEhuzhfcmVxr5VR0',

  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.talentodev.chess',

  // Link que já abre o app instalado (domínio com assetlinks.json configurado)
  APP_LINK_BASE: 'https://talento.dev.br/game?id=',

  SITE_URL: 'https://chessland.com.br',
  DEVELOPER_NAME: 'Talento Dev',
  DEVELOPER_URL: 'https://talento.dev.br',

  // Redes sociais (deixe vazio '' para esconder o ícone no rodapé)
  YOUTUBE_URL: 'https://www.youtube.com/@playchessland',     // ex.: 'https://www.youtube.com/@playchessland'
  INSTAGRAM_URL: 'https://www.instagram.com/talento.dev',   // ex.: 'https://www.instagram.com/seuperfil'
  TIKTOK_URL: 'https://www.tiktok.com/@talentodev',      // ex.: 'https://www.tiktok.com/@seuperfil'

  // Vídeo da landing: só o ID do YouTube (o trecho depois de v= no link). Vazio = seção escondida.
  YOUTUBE_VIDEO_ID: 'oLdvDvLaO5k',

  HERO_USE_LATEST_GAME: true,
  HERO_MIN_MOVES: 10,

  // Contador de acessos (precisa do sql/02_visitas.sql). false desliga.
  ANALYTICS: true,
  // Mostra "N visitantes" no rodapé (usa get_visit_count do sql/02_visitas.sql). false esconde.
  SHOW_VISIT_COUNTER: true,
};

export const hasSupabaseKey = () =>
  !!CONFIG.SUPABASE_ANON_KEY && !CONFIG.SUPABASE_ANON_KEY.startsWith('COLE_');
