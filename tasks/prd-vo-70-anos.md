# PRD: App 70 Anos da Vo

## Introduction

Experiencia digital comemorativa dos 70 anos de **Jacinta Maria Jung Tomm** (nascida em 15/04/1956 em Cerro Largo, RS — Linha Sao Francisco). O app celebra a trajetoria de uma mulher que saiu do interior, se tornou a primeira contadora com escritorio proprio em Santo Angelo (Concept Servicos Contabeis, fundado em 1986), criou 3 filhos e hoje tem 10 netos.

A landing page publica conta essa historia com narrativa visual rica (hero animado, biografia, mapa de viagens interativo, historia do escritorio e timeline de vida). A area pessoal, protegida por login, e o espaco dela para guardar fotos em albuns e ouvir suas radios favoritas — um cantinho digital que cresce com o tempo.

A identidade visual e aconchegante e sofisticada: tons de verde floresta, madeira, creme envelhecido e dourado vintage, com tipografia serifada classica e animacoes suaves.

**Stack:** Laravel 11 (API) + React 18/Vite/TypeScript (frontend) + PostgreSQL 16 + Docker (dev) + Hostinger (prod) + Mapbox GL JS.

## Goals

- Criar uma homenagem digital emocionante e navegavel que conte 70 anos de historia
- Exibir um mapa interativo das viagens dela com rota animada e contador de km
- Oferecer uma area pessoal onde ela possa organizar fotos em albuns e ouvir radios
- Garantir acessibilidade (fontes grandes, alto contraste, controles visiveis) para uma usuario de 70 anos
- Entregar um app responsivo, performatico, hospedavel na Hostinger (shared hosting)
- Servir como storage pessoal de fotos que cresce com o tempo

## User Stories

### US-001: Setup do projeto com Docker
**Description:** As a developer, I want to scaffold the full project (Laravel + React + PostgreSQL + Nginx) with Docker so that development and deployment environments are consistent.

**Acceptance Criteria:**
- [ ] `docker-compose up` sobe todos os servicos: nginx, app (PHP-FPM), frontend (Vite dev server), db (PostgreSQL 16), minio
- [ ] Laravel responde em `http://localhost/api/health`
- [ ] React dev server responde em `http://localhost:5173`
- [ ] PostgreSQL acessivel na porta 5432 com database `vo_app`
- [ ] Nginx faz proxy reverso corretamente para app e frontend
- [ ] `.env.example` documentado com todas as variaveis necessarias

### US-002: Configurar TailwindCSS com paleta e tipografia customizada
**Description:** As a developer, I want to configure the design system (colors, fonts, spacing) so that all components follow the visual identity consistently.

**Acceptance Criteria:**
- [ ] Tailwind config com cores: madeira-clara (#C4A57B), madeira-escura (#5C3D2E), verde-floresta (#1F3A2E), verde-musgo (#3D5A4A), creme-papel (#F5EFE6), dourado-vintage (#C9A961), preto-quente (#1A1510)
- [ ] Google Fonts carregando: Playfair Display (titulos), Inter (corpo), Caveat (detalhes manuscritos)
- [ ] Lenis smooth scroll configurado e funcionando globalmente
- [ ] Componentes base shadcn/ui instalados e tematizados
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Hero section animado
**Description:** As a visitor, I want to see a cinematic hero with rotating photos and animated title so that I immediately feel the emotional tone of the celebration.

**Acceptance Criteria:**
- [ ] Grid/stack de fotos do hero com crossfade Ken Burns effect (zoom + pan sutil) rotacionando automaticamente
- [ ] Titulo "Parabens pelos 70 anos" com reveal por palavra (Framer Motion staggerChildren)
- [ ] Particulas douradas sutis ao fundo (tsparticles ou canvas)
- [ ] Scroll indicator animado no rodape do hero
- [ ] Fotos carregam de `frontend/public/photos/hero/`
- [ ] Responsivo (mobile e desktop)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Secao Biografia
**Description:** As a visitor, I want to read her life story with photos so that I learn about her journey.

**Acceptance Criteria:**
- [ ] Layout duas colunas: texto (esquerda) + foto polaroide rotacionada (direita)
- [ ] Animacao on-scroll: texto sobe com blur decrescente (Framer Motion)
- [ ] Fotos com filtro sepia/vintage aplicado via CSS
- [ ] Conteudo real da biografia:
  - Nasceu em 15/04/1956 em Cerro Largo, RS (interior, Linha Sao Francisco)
  - Familia muito enraizada na igreja catolica; aprendeu seus dotes de dona de casa no seminario
  - Saiu para Santo Angelo em busca de oportunidades maiores
  - Casou com Sergio Tomm em 1978; ao casar, passou a fazer parte da igreja luterana
  - Formou-se em 1986 e se tornou a primeira mulher com escritorio de contabilidade proprio em Santo Angelo
  - 3 filhos: Fabio Tomm, Carla Tomm, Claudio Tomm
  - 10 netos
  - Segue ativa na comunidade luterana ate hoje
- [ ] Fotos da pasta `familia/` (casamento-vintage.jpg ideal para esta secao)
- [ ] Responsivo: colunas empilham no mobile
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Mapa de Viagens interativo
**Description:** As a visitor, I want to see an animated map tracing her travels around the world so that I appreciate the breadth of her adventures.

**Acceptance Criteria:**
- [ ] Mapbox GL JS com custom style escuro integrado
- [ ] Pontos das viagens aparecendo sequencialmente conforme scroll (GSAP ScrollTrigger)
- [ ] Linha tracejada animada ligando pontos na ordem cronologica (SVG stroke-dasharray animate)
- [ ] Tooltip em cada ponto com: nome do lugar, ano, km acumulados
- [ ] Contador total de km animado (react-countup)
- [ ] Rotas organizadas em 3 categorias visuais no mapa:
  - **Rio Grande do Sul** (rota terrestre detalhada): Santo Angelo > Santa Maria > Pinhal > Bage > Porto Alegre > Serra Gaucha
  - **Brasil** (rota terrestre/aerea): Porto Alegre > Florianopolis > Curitiba > Cascavel > Sao Paulo > Rio de Janeiro > Brasilia > Recife/Nordeste > Rio Grande do Norte
  - **Internacional**: Uruguai, Argentina, Paraguai, Portugal, Alemanha, Holanda, Bruxelas, Budapeste, Egito, Israel
- [ ] Santo Angelo como ponto de origem e retorno (hub central no mapa, destacado visualmente)
- [ ] Animacao principal: linha traca caminho saindo de Santo Angelo, passando por cada destino, e sempre retornando a Santo Angelo
- [ ] Rotas de carro destacadas com icone diferente (Santo Angelo <> Brasilia, Santo Angelo <> Curitiba)
- [ ] Card lateral flutuante ao lado do mapa com estatisticas animadas que atualizam conforme a rota avanca:
  - "Percorreu mais de X km" (contador animado react-countup, acumula conforme pontos aparecem)
  - Numero de paises visitados (ex: "5 paises")
  - Numero de estados brasileiros (ex: "8 estados")
  - Numero de cidades (ex: "25+ cidades")
  - Destaque especial: "2.200 km de carro de Brasilia ate Santo Angelo"
  - Card com estilo visual de "carimbo de passaporte" ou "cartao postal vintage"
- [ ] No mobile, card aparece abaixo do mapa (nao lateral)
- [ ] Dados de viagens carregados via API (`GET /api/trips` + `GET /api/trips/:id/points`)
- [ ] Responsivo
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Secao Escritorio de Contabilidade
**Description:** As a visitor, I want to see the story of her accounting firm so that I appreciate this professional achievement.

**Acceptance Criteria:**
- [ ] Secao cinematografica com parallax sutil no fundo
- [ ] Timeline vertical: marcos do escritorio — "De um sonho a realidade"
  - 1986: Formatura e fundacao da Concept Servicos Contabeis
  - Marco: Primeira mulher com escritorio proprio de contabilidade em Santo Angelo
  - Trajetoria do escritorio ate hoje
- [ ] Frase em destaque com animacao de maquina de escrever (ex: "A primeira mulher a abrir seu proprio escritorio contabil em Santo Angelo")
- [ ] Fotos do escritorio (placeholder — solicitar fotos ao usuario)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Linha do Tempo da Vida
**Description:** As a visitor, I want to see a timeline of major life milestones so that I follow her journey chronologically.

**Acceptance Criteria:**
- [ ] Timeline vertical com marcos reais:
  - 1956: Nascimento em Cerro Largo, Linha Sao Francisco
  - Juventude: Seminario e formacao catolica
  - ~1970s: Mudanca para Santo Angelo
  - 1978: Casamento com Sergio Tomm / transicao para igreja luterana
  - ~1979-1985: Nascimento dos filhos (Fabio, Carla, Claudio)
  - 1986: Formatura e fundacao da Concept Servicos Contabeis
  - Viagens internacionais (Egito, Israel, Europa)
  - Viagens nacionais (Brasilia, Serra Gaucha)
  - 2026: 70 anos, 10 netos
- [ ] Cards scroll-triggered com animacao de deslize lateral (Framer Motion)
- [ ] Fotos associadas a cada marco (da pasta `familia/`)
- [ ] Indicador visual de ano/decada
- [ ] Responsivo
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-008: Migrations e seeders do banco de dados
**Description:** As a developer, I want to create the database schema and seed it with her real data so that the API has data to serve.

**Acceptance Criteria:**
- [ ] Migration: `users` (id, name, email, password, role)
- [ ] Migration: `albums` (id, user_id, name, type enum [periodo, viagem, momento], cover_photo_id, timestamps)
- [ ] Migration: `photos` (id, album_id, path, thumbnail_path, caption, taken_at, width, height, metadata json, timestamps)
- [ ] Migration: `trips` (id, name, year, description, total_km, timestamps)
- [ ] Migration: `trip_points` (id, trip_id, name, latitude, longitude, order, km_from_previous, arrival_date, description, photo_id, timestamps)
- [ ] Migration: `radios` (id, user_id, name, stream_url, logo_url, genre, is_favorite, order, timestamps)
- [ ] Seeder: usuario Jacinta (name: "Jacinta Maria Jung Tomm", role: admin)
- [ ] Seeder: viagens organizadas em 3 grupos (RS, Brasil, Internacional) com ~25 pontos e coordenadas reais
- [ ] Seeder: rotas de carro marcadas (Santo Angelo<>Curitiba, Brasilia>Santo Angelo)
- [ ] Seeder: Santo Angelo como hub central (ponto de origem/retorno)
- [ ] Seeder: radios iniciais (Radio Santo Angelo, Radio Sepe)
- [ ] Seeder: albuns iniciais com fotos de `frontend/public/photos/` organizadas por viagem e familia
- [ ] `php artisan migrate --seed` roda sem erro

### US-009: API REST de viagens e pontos
**Description:** As a frontend developer, I want API endpoints for trips so that the travel map can fetch and display data.

**Acceptance Criteria:**
- [ ] `GET /api/trips` — lista todas as viagens (id, name, year, total_km)
- [ ] `GET /api/trips/:id` — detalhes da viagem com pontos ordenados
- [ ] `GET /api/trips/:id/points` — pontos com latitude, longitude, km_from_previous, description
- [ ] Responses em JSON com estrutura consistente
- [ ] Typecheck/PHPStan passes

### US-010: Autenticacao com Sanctum
**Description:** As the grandmother, I want to log in to access my personal area so that only I can manage my photos and radios.

**Acceptance Criteria:**
- [ ] `POST /api/login` com email/senha retorna token Sanctum
- [ ] `POST /api/logout` invalida o token
- [ ] `GET /api/user` retorna dados do usuario autenticado
- [ ] Rotas protegidas retornam 401 sem token
- [ ] Frontend: tela de login simples com campos grandes e legiveis
- [ ] Frontend: redirect automatico apos login para area pessoal
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-011: API REST de albuns e fotos
**Description:** As a frontend developer, I want CRUD API endpoints for albums and photos so that the gallery can manage content.

**Acceptance Criteria:**
- [ ] `GET /api/albums` — lista albuns do usuario autenticado
- [ ] `POST /api/albums` — cria album (name, type)
- [ ] `PUT /api/albums/:id` — atualiza album
- [ ] `DELETE /api/albums/:id` — remove album e fotos associadas
- [ ] `GET /api/albums/:id/photos` — lista fotos do album com paginacao
- [ ] `POST /api/albums/:id/photos` — upload de foto(s) com processamento (thumbnail, dimensoes)
- [ ] `DELETE /api/photos/:id` — remove foto
- [ ] Upload via Spatie Media Library com storage local ou MinIO
- [ ] Fotos iniciais seedadas a partir de `frontend/public/photos/`
- [ ] Todas as rotas protegidas por auth:sanctum

### US-012: Galeria de Fotos frontend
**Description:** As the grandmother, I want to browse my photos organized in albums, upload new ones, and view them in a lightbox so that I can enjoy and manage my memories.

**Acceptance Criteria:**
- [ ] Listagem de albuns com capa e contagem de fotos
- [ ] Criacao/edicao de album com seletor de tipo (periodo, viagem, momento)
- [ ] Grid de fotos com lazy loading (intersection observer)
- [ ] Upload por drag-and-drop (react-dropzone) com preview
- [ ] Lightbox com navegacao por teclado e gesto de swipe (yet-another-react-lightbox)
- [ ] Filtros por tipo de album
- [ ] Feedback visual durante upload (progress bar)
- [ ] Botoes e textos grandes (acessibilidade)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-013: Player de Radio persistente
**Description:** As the grandmother, I want to listen to my favorite radio stations while browsing the app so that I can enjoy music throughout the experience.

**Acceptance Criteria:**
- [ ] `GET /api/radios` — lista radios do usuario
- [ ] `POST /api/radios` — adiciona radio (name, stream_url, genre)
- [ ] `DELETE /api/radios/:id` — remove radio
- [ ] `PUT /api/radios/:id/favorite` — marca/desmarca favorita
- [ ] Player fixo no rodape da area pessoal (Howler.js)
- [ ] Controles: play/pause, volume slider, botao proxima radio
- [ ] Visualizador de audio sutil (barras animadas via canvas/CSS) quando tocando
- [ ] Busca de novas radios via API radio-browser.info
- [ ] Player persiste entre navegacoes (nao recarrega ao trocar de pagina)
- [ ] Botoes grandes e visiveis
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-014: Easter egg do Hero
**Description:** As a visitor, I want to discover a hidden surprise by clicking on her photo so that the experience has a delightful, playful moment.

**Acceptance Criteria:**
- [ ] Ao clicar 5x na foto principal do hero, dispara chuva de coracoes/flores douradas
- [ ] Animacao dura ~3 segundos e desaparece suavemente
- [ ] Funciona tanto no mobile (taps) quanto desktop (clicks)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-015: Otimizacao e deploy na Hostinger
**Description:** As a developer, I want to optimize assets and deploy to Hostinger so that the app is fast, secure, and publicly accessible.

**Acceptance Criteria:**
- [ ] Build estatico do React otimizado (code splitting, tree shaking)
- [ ] Imagens com lazy loading e compressao automatica
- [ ] Deploy do Laravel na Hostinger (shared hosting com PHP + MySQL/PostgreSQL)
- [ ] Build do React servido como arquivos estaticos pelo servidor web da Hostinger
- [ ] SSL configurado via painel da Hostinger (Let's Encrypt incluso)
- [ ] Fonts preloaded para evitar FOUT
- [ ] Lighthouse score > 80 em performance
- [ ] Configurar .htaccess para SPA routing (React Router)
- [ ] Backup periodico das fotos e banco

## Functional Requirements

- FR-1: Landing page publica com 5 secoes: Hero, Biografia, Mapa de Viagens, Escritorio, Timeline
- FR-2: Hero com galeria rotativa de fotos com efeito Ken Burns e titulo animado
- FR-3: Mapa interativo Mapbox GL JS com Santo Angelo como hub central, 3 camadas de viagem (RS, Brasil, Internacional), rotas animadas que sempre retornam a Santo Angelo, destaque para rotas de carro (Curitiba, Brasilia)
- FR-4: Dados de viagens servidos por API REST Laravel com pontos georreferenciados
- FR-5: Autenticacao via Laravel Sanctum (apenas 1 usuario: a avo)
- FR-6: Area pessoal com galeria de fotos organizada em 3 tipos de album (periodo, viagem, momento)
- FR-7: Upload de fotos por drag-and-drop com geracao de thumbnails (Spatie Media Library)
- FR-8: Lightbox para visualizacao de fotos com navegacao por teclado e swipe
- FR-9: Player de radio persistente no rodape com Howler.js, controles de volume e visualizador
- FR-10: Busca de radios via API radio-browser.info
- FR-11: Smooth scroll global com Lenis
- FR-12: Animacoes declarativas com Framer Motion (reveals, staggers) e GSAP ScrollTrigger (mapa, timeline)
- FR-13: Design system baseado na paleta vintage: verde floresta, madeira, creme, dourado
- FR-14: Interface acessivel: fontes grandes por padrao, alto contraste, controles bem visiveis
- FR-15: Easter egg: chuva de coracoes ao clicar 5x na foto do hero

## Non-Goals

- Mensagens da familia / livro de visitas digital (descartado do escopo)
- Modo apresentacao / slideshow para TV (nice-to-have futuro)
- QR Code para convite impresso
- Notificacoes push ou emails
- Multi-usuario (apenas a avo precisa de login)
- Edicao de fotos in-app (crop, filtros)
- App mobile nativo
- Internacionalizacao (app somente em portugues)

## Design Considerations

### Paleta de Cores
| Nome | Hex | Uso |
|------|-----|-----|
| Madeira clara | #C4A57B | Fundos quentes, molduras |
| Madeira escura | #5C3D2E | Textos, divisores |
| Verde floresta | #1F3A2E | Fundo principal, hero |
| Verde musgo | #3D5A4A | Secoes secundarias |
| Creme papel | #F5EFE6 | Textos sobre fundo escuro |
| Dourado vintage | #C9A961 | Destaques, CTAs |
| Preto quente | #1A1510 | Tipografia, sombras |

### Tipografia
- **Titulos:** Playfair Display (serifada elegante)
- **Corpo:** Inter (legibilidade moderna)
- **Detalhes manuscritos:** Caveat (legendas, assinaturas)

### Acessibilidade
- Fontes grandes por padrao (base 18px)
- Contraste alto em todos os textos
- Botoes com area de toque minima de 48x48px
- Navegacao por teclado funcional

### Fotos organizadas em
```
frontend/public/photos/
├── hero/                  (6 fotos para rotacao do hero)
├── familia/               (8 fotos de momentos familiares)
│   ├── casamento-vintage.jpg
│   ├── celebracao-formal.jpg
│   ├── churrasco-2019.jpg
│   ├── evento-elegante.jpg
│   ├── familia-noite.jpg
│   ├── fonte-europeia.jpg
│   ├── jantar-familia.jpg
│   └── quadro-60-anos-casamento.jpg
└── viagens/               (17 fotos organizadas por destino)
    ├── egito/
    ├── budapeste/
    ├── bruxelas/
    ├── holanda/
    ├── portugal/
    ├── alemanha/
    ├── israel/
    ├── brasilia/
    └── serra-gaucha/
```

## Technical Considerations

### Backend (Laravel 11)
- API REST stateless com Sanctum (token-based)
- Spatie Media Library para upload/resize/thumbnail
- PostgreSQL 16 com migrations versionadas
- Storage local em dev, MinIO (S3-compatible) em prod

### Frontend (React 18 + Vite + TypeScript)
- TailwindCSS + shadcn/ui para componentes base
- Framer Motion para animacoes declarativas
- GSAP + ScrollTrigger para mapa e efeitos scroll-driven complexos
- Lenis para smooth scroll
- Mapbox GL JS para mapa interativo
- Howler.js para player de audio
- TanStack React Query para cache de API
- react-dropzone para upload
- yet-another-react-lightbox para lightbox
- tsparticles para particulas no hero
- react-countup para contador de km

### Infra
- **Desenvolvimento:** Docker (docker-compose com nginx, app PHP-FPM, frontend Vite, db PostgreSQL, minio)
- **Producao:** Hostinger shared hosting (plano minimo)
  - Laravel rodando com PHP nativo da Hostinger
  - MySQL (incluso no plano) em vez de PostgreSQL em prod
  - Build estatico do React servido como arquivos na public_html
  - Storage de fotos no filesystem da Hostinger
  - SSL incluso via painel
- Docker usado apenas para desenvolvimento local

### Pontos de viagem para seeder (coordenadas aproximadas)

**Hub central (origem e retorno de todas as viagens):**
| Destino | Lat | Lng |
|---------|-----|-----|
| Santo Angelo, RS (casa) | -28.2994 | -54.2631 |

**Rio Grande do Sul (rota terrestre detalhada):**
| Destino | Lat | Lng |
|---------|-----|-----|
| Santa Maria, RS | -29.6842 | -53.8069 |
| Pinhal, RS | -29.3267 | -53.2091 |
| Bage, RS | -31.3289 | -54.1069 |
| Porto Alegre, RS | -30.0346 | -51.2177 |
| Serra Gaucha (Bento Goncalves) | -29.1681 | -51.5178 |

**Brasil (rotas inter-estaduais):**
| Destino | Lat | Lng | Obs |
|---------|-----|-----|-----|
| Rio do Sul, SC | -27.2141 | -49.6431 | |
| Florianopolis, SC | -27.5954 | -48.5480 | |
| Curitiba, PR | -25.4284 | -49.2733 | ida e volta de carro |
| Cascavel, PR | -24.9578 | -53.4596 | |
| Sao Paulo, SP | -23.5505 | -46.6333 | |
| Rio de Janeiro, RJ | -22.9068 | -43.1729 | |
| Brasilia, DF | -15.7975 | -47.8919 | voltou de carro ate Santo Angelo |
| Recife, PE | -8.0476 | -34.8770 | + praias do Nordeste |
| Rio Grande do Norte (Natal) | -5.7945 | -35.2110 | |

**Internacional:**
| Destino | Lat | Lng |
|---------|-----|-----|
| Montevideu, Uruguai | -34.9011 | -56.1645 |
| Buenos Aires, Argentina | -34.6037 | -58.3816 |
| Assuncao, Paraguai | -25.2637 | -57.5759 |
| Lisboa, Portugal | 38.7223 | -9.1393 |
| Alemanha | 50.9375 | 6.9603 |
| Amsterdam, Holanda | 52.3676 | 4.9041 |
| Bruxelas, Belgica | 50.8503 | 4.3517 |
| Budapeste, Hungria | 47.4979 | 19.0402 |
| Egito (Cairo/Gize) | 29.9792 | 31.1342 |
| Israel (Jerusalem) | 31.7683 | 35.2137 |

**Rotas de carro (destacar com icone/estilo diferente):**
- Santo Angelo <> Curitiba (~900km cada trecho)
- Brasilia > Santo Angelo (~2.200km de volta)

## Success Metrics

- Landing page carrega em menos de 3 segundos em conexao 4G
- Mapa de viagens renderiza todos os pontos e animacoes sem jank
- Avo consegue fazer login, navegar fotos e ouvir radio sem ajuda (teste de usabilidade informal)
- Lighthouse performance score > 80
- Todas as secoes da landing responsivas (320px a 1920px)
- Upload de fotos funciona com arquivos ate 10MB sem erro

## Dados Confirmados

- **Nome:** Jacinta Maria Jung Tomm
- **Nascimento:** 15/04/1956, Cerro Largo, RS (Linha Sao Francisco)
- **Casamento:** 1978 com Sergio Tomm, em Santo Angelo
- **Filhos:** Fabio Tomm, Carla Tomm, Claudio Tomm
- **Netos:** 10
- **Formacao:** 1986 — primeira mulher com escritorio contabil proprio em Santo Angelo
- **Escritorio:** Concept Servicos Contabeis
- **Religiao:** Criada catolica (seminario), luterana apos casamento, ativa na comunidade
- **Radios iniciais:** Radio Santo Angelo, Radio Sepe (mais serao adicionadas por ela via app)
- **Fotos:** 25 iniciais ja organizadas; ela adicionara mais pela galeria
- **Hospedagem:** Hostinger, plano minimo

## Open Questions

- Datas exatas de nascimento dos filhos (Fabio, Carla, Claudio)?
- Nomes dos 10 netos (para eventual mencao na timeline)?
- Fotos do escritorio Concept — existem? Pode enviar?
- Qual dominio sera registrado na Hostinger?
- Mapbox API key — precisa criar conta gratuita em mapbox.com
- Plano exato da Hostinger — confirmar se inclui PHP 8.2+ e MySQL (necessarios para Laravel 11)
- Praias especificas do Nordeste que ela visitou (Recife, Natal, outras?)
- Datas aproximadas das viagens internacionais (para ordenar cronologicamente no mapa)
- Cidades especificas na Alemanha? (a foto mostra Koncept Hotels)
- Viagem a Israel foi junto com a do Egito?
