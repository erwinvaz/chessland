# ChessLand — site (chessland.com.br)

Site estático (HTML/CSS/JS puro, sem build) para o GitHub Pages. Bilíngue PT/EN.
Páginas: início, ranking público, partida compartilhável (`/jogo.html?id=...`), grandes mestres.

## 1. Chave do Supabase
Em `js/config.js`, cole a **anon key completa** (Supabase → Project Settings → API → `anon public`, começa com `eyJ...`).
Ela é pública por natureza; nunca use a `service_role` aqui.

## 2. SQL no Supabase
Rode `sql/01_public_views.sql` no SQL Editor. Cria só a view `ranking_publico` e a função `get_public_game`
(não mexe no app, nas tabelas nem nos triggers). Se algum nome de coluna for diferente no seu schema, ajuste.

## 2b. Contador de acessos (opcional, privado)
Rode também `sql/02_visitas.sql`. O site passa a registrar cada visita (id aleatório do navegador, página, idioma e origem;
sem IP, sem cookies; não conta `localhost`). Para ver o engajamento, no SQL Editor: `select * from site_stats_daily limit 30;`
(outros exemplos no fim do arquivo). Para desligar: `ANALYTICS: false` em `config.js`.

## 2c. Vídeo, YouTube, Instagram e TikTok
Em `js/config.js`: `YOUTUBE_VIDEO_ID` (só o ID, o que vem depois de `v=` no link) mostra o vídeo na landing, antes do
"Pronto para o primeiro lance?". `YOUTUBE_URL`, `INSTAGRAM_URL` e `TIKTOK_URL` mostram os ícones no rodapé (vazio = escondido).

## 3. Grandes mestres
Os PGNs em `data/pgn/` são exemplos. Copie seus arquivos PGN para lá e edite `data/mestres.json`
(`slug`, `name`, `years`, `country`, `bio_pt`, `bio_en`, `pgn`). Depois rode:

    node tools/gerar_mestres.mjs

Isso gera `mestre/<slug>/index.html` (bom para SEO) e o `sitemap.xml`. Um arquivo PGN pode ter várias partidas.

## 4. Publicar no GitHub Pages
1. Crie um repositório novo (ex.: `chessland-site`) e envie todo o conteúdo desta pasta.
2. Settings → Pages → Deploy from a branch → `main` / root. O arquivo `CNAME` já define `chessland.com.br`.
3. No registro.br / seu DNS:
   - `A` @ → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` www → `SEU-USUARIO.github.io`
4. Quando o DNS propagar, marque **Enforce HTTPS** em Settings → Pages.

O site de `talento.dev.br` não é afetado.

## 5. Observações
- O botão "Abrir no app" usa o link `talento.dev.br/game?id=...`, que já abre o app. Para o link
  `chessland.com.br/jogo.html?id=...` abrir direto no app, é preciso adicionar o domínio no
  `AndroidManifest` e publicar um `/.well-known/assetlinks.json` (podemos fazer depois).
- Opcional: `YOUTUBE_URL` em `config.js`, imagem Open Graph, página de privacidade.
- Teste local: `python3 -m http.server 8000` e abra http://localhost:8000
