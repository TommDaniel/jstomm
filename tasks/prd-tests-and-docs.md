# PRD: Cobertura de Testes e Documentação Completa

## Introduction

O projeto "App 70 Anos da Vó" foi entregue sem testes automatizados e sem documentação. Este PRD define a implementação de cobertura de testes com threshold mínimo de 80% (backend PHPUnit + frontend Vitest/Testing Library) e documentação completa (README de setup/arquitetura + referência da API em Markdown).

## Goals

- Atingir ≥ 80% de cobertura de código no backend (PHPUnit + pcov)
- Atingir ≥ 70% de cobertura de código no frontend (Vitest + c8), excluindo componentes que dependem de libs externas não testáveis (Mapbox, tsparticles, GSAP)
- Documentar todos os endpoints da API com exemplos de request/response
- Documentar setup local (Docker), arquitetura, variáveis de ambiente e processo de deploy

## User Stories

### US-001: Configurar ambiente de testes do backend (PHPUnit + SQLite)
**Description:** As a developer, I want a working test environment so that I can run isolated tests without affecting the development database.

**Acceptance Criteria:**
- [ ] `phpunit.xml` configurado com `DB_CONNECTION=sqlite` e `DB_DATABASE=:memory:`
- [ ] `RefreshDatabase` trait funciona corretamente nos testes de feature
- [ ] Factories criadas para: `User`, `Trip`, `TripPoint`, `Album`, `Photo`, `Radio`
- [ ] `php artisan test` executa sem erros (zero testes, zero falhas)
- [ ] Typecheck/lint passa (`./vendor/bin/pint --test`)

### US-002: Feature tests para Auth API
**Description:** As a developer, I want tests for authentication endpoints so that I can verify login, logout, and protected route behavior.

**Acceptance Criteria:**
- [ ] `POST /api/login` com credenciais válidas retorna 200 com `token` e `user`
- [ ] `POST /api/login` com senha errada retorna 401 com `message: "Credenciais inválidas."`
- [ ] `POST /api/login` sem campos obrigatórios retorna 422
- [ ] `POST /api/logout` com token válido retorna 200 e invalida o token
- [ ] `GET /api/user` sem autenticação retorna 401
- [ ] `GET /api/user` com token válido retorna os dados do usuário autenticado
- [ ] Typecheck/lint passa

### US-003: Feature tests para Trips API (endpoints públicos)
**Description:** As a developer, I want tests for trip endpoints so that I can verify public data is returned correctly.

**Acceptance Criteria:**
- [ ] `GET /api/trips` retorna 200 com array de trips (id, name, year, total_km, category)
- [ ] `GET /api/trips` retorna array vazio quando não há trips
- [ ] `GET /api/trips/{id}` retorna 200 com trip e seus points carregados
- [ ] `GET /api/trips/{id}` retorna 404 para ID inexistente
- [ ] `GET /api/trips/{id}/points` retorna 200 com points ordenados por `order`
- [ ] Todos os endpoints acima acessíveis sem autenticação (sem header Authorization)
- [ ] Typecheck/lint passa

### US-004: Feature tests para Albums API (CRUD protegido)
**Description:** As a developer, I want tests for album endpoints so that I can verify CRUD operations and authorization rules.

**Acceptance Criteria:**
- [ ] `GET /api/albums` sem auth retorna 401
- [ ] `GET /api/albums` retorna apenas os álbuns do usuário autenticado (não de outros usuários)
- [ ] `POST /api/albums` cria álbum com campos válidos (`name`, `type`: periodo/viagem/momento) e retorna 201
- [ ] `POST /api/albums` com `type` inválido retorna 422
- [ ] `PUT /api/albums/{id}` atualiza álbum do próprio usuário e retorna 200
- [ ] `PUT /api/albums/{id}` de álbum de outro usuário retorna 403
- [ ] `DELETE /api/albums/{id}` exclui álbum do próprio usuário e retorna 204
- [ ] `DELETE /api/albums/{id}` de álbum de outro usuário retorna 403
- [ ] Typecheck/lint passa

### US-005: Feature tests para Photos API
**Description:** As a developer, I want tests for photo endpoints so that I can verify upload, listing, and deletion with proper authorization.

**Acceptance Criteria:**
- [ ] `GET /api/albums/{id}/photos` retorna 200 com fotos paginadas (24 por página)
- [ ] `POST /api/albums/{id}/photos` faz upload de arquivo de imagem fake e retorna 201 com os registros criados
- [ ] `POST /api/albums/{id}/photos` em álbum de outro usuário retorna 403
- [ ] `POST /api/albums/{id}/photos` sem arquivo retorna 422
- [ ] `DELETE /api/photos/{id}` exclui foto do próprio usuário e retorna 204
- [ ] `DELETE /api/photos/{id}` de foto de outro usuário retorna 403
- [ ] Storage fake usado nos testes (sem gravar arquivos reais em disco)
- [ ] Typecheck/lint passa

### US-006: Feature tests para Radios API
**Description:** As a developer, I want tests for radio endpoints so that I can verify CRUD and favorite toggle with proper authorization.

**Acceptance Criteria:**
- [ ] `GET /api/radios` sem auth retorna 401
- [ ] `GET /api/radios` retorna apenas as rádios do usuário autenticado, ordenadas por `order`
- [ ] `POST /api/radios` cria rádio com `name` e `stream_url` válidos e retorna 201
- [ ] `POST /api/radios` com `stream_url` inválida (não-URL) retorna 422
- [ ] `PUT /api/radios/{id}` atualiza rádio própria e retorna 200
- [ ] `PUT /api/radios/{id}` de rádio de outro usuário retorna 403
- [ ] `DELETE /api/radios/{id}` exclui rádio própria e retorna 204
- [ ] `PUT /api/radios/{id}/favorite` alterna `is_favorite` de false → true e true → false
- [ ] `PUT /api/radios/{id}/favorite` de rádio de outro usuário retorna 403
- [ ] Typecheck/lint passa

### US-007: Configurar threshold de cobertura no backend (≥ 80%)
**Description:** As a developer, I want coverage enforcement so that the CI rejects PRs that drop below the minimum threshold.

**Acceptance Criteria:**
- [ ] `phpunit.xml` configurado com `<coverage>` usando `<include>` apontando para `app/Http/Controllers` e `app/Models`
- [ ] Bloco `<coverage minimum="80">` configurado no `phpunit.xml`
- [ ] `php artisan test --coverage` exibe percentual de cobertura por arquivo
- [ ] Cobertura real dos controllers (Auth, Trip, Album, Photo, Radio) atinge ≥ 80%
- [ ] Typecheck/lint passa

### US-008: Configurar Vitest + Testing Library + cobertura no frontend
**Description:** As a developer, I want a frontend test environment so that I can write and run unit and integration tests for React components.

**Acceptance Criteria:**
- [ ] Pacotes instalados: `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`, `jsdom`
- [ ] `vitest.config.ts` (ou integrado ao `vite.config.ts`) configurado com `environment: 'jsdom'` e `setupFiles` apontando para um arquivo de setup
- [ ] Setup file importa `@testing-library/jest-dom` para matchers customizados
- [ ] `npm run test` executa todos os testes
- [ ] `npm run test:coverage` gera relatório de cobertura
- [ ] `package.json` atualizado com scripts `test` e `test:coverage`
- [ ] Coverage threshold configurado: branches 70%, functions 70%, lines 70%, statements 70%
- [ ] Um teste de smoke (`renders without crash`) passando para confirmar setup
- [ ] Typecheck passa (`npm run typecheck`)

### US-009: Unit tests para AuthContext e ProtectedRoute
**Description:** As a developer, I want tests for auth logic so that I can verify token management, login/logout flows, and route protection.

**Acceptance Criteria:**
- [ ] `AuthContext`: ao inicializar sem token no localStorage, `isLoading` vai para false e `user` fica null
- [ ] `AuthContext`: ao inicializar com token válido no localStorage, faz `GET /api/user` e popula `user`
- [ ] `AuthContext`: ao inicializar com token inválido (API retorna erro), limpa o token e `user` fica null
- [ ] `AuthContext`: `login()` chama `POST /api/login`, salva token no localStorage e popula `user`
- [ ] `AuthContext`: `logout()` chama `POST /api/logout`, remove token do localStorage e zera `user`
- [ ] `ProtectedRoute`: redireciona para `/login` quando `user` é null e `isLoading` é false
- [ ] `ProtectedRoute`: renderiza children quando `user` está autenticado
- [ ] `ProtectedRoute`: não renderiza children nem redireciona enquanto `isLoading` é true
- [ ] MSW handlers usados para mockar chamadas à API
- [ ] Typecheck passa

### US-010: Unit tests para componente RadioPlayer
**Description:** As a developer, I want tests for the RadioPlayer component so that I can verify playback controls and station management.

**Acceptance Criteria:**
- [ ] RadioPlayer renderiza sem crashes quando não há rádios
- [ ] RadioPlayer exibe o nome da rádio ativa quando reproduzindo
- [ ] Botão play/pause alterna o estado de reprodução ao ser clicado
- [ ] Clicar em outra rádio na lista troca a estação ativa
- [ ] Howler mockado (não tenta carregar streams reais nos testes)
- [ ] Typecheck passa

### US-011: Integration tests para LoginPage
**Description:** As a developer, I want integration tests for the login page so that I can verify the complete login flow from form submission to redirect.

**Acceptance Criteria:**
- [ ] LoginPage renderiza campos de email e senha e botão de submit
- [ ] Submeter formulário com credenciais válidas chama `POST /api/login` e redireciona para `/area-pessoal`
- [ ] Submeter com credenciais inválidas exibe mensagem de erro na tela
- [ ] Campos de email/senha exibem validação quando submetidos vazios
- [ ] Botão de submit fica desabilitado (ou mostra loading) durante a requisição
- [ ] MSW handlers usados para simular respostas da API
- [ ] Typecheck passa

### US-012: Integration tests para AlbumListPage e AlbumDetailPage
**Description:** As a developer, I want integration tests for album pages so that I can verify album listing, creation, and photo display.

**Acceptance Criteria:**
- [ ] `AlbumListPage`: exibe lista de álbuns retornados pela API
- [ ] `AlbumListPage`: exibe estado vazio quando não há álbuns
- [ ] `AlbumListPage`: abre modal/form de criação ao clicar no botão "Novo Álbum"
- [ ] `AlbumListPage`: submeter form de criação válido chama `POST /api/albums` e atualiza a lista
- [ ] `AlbumDetailPage`: exibe fotos paginadas do álbum
- [ ] `AlbumDetailPage`: exibe estado vazio quando álbum não tem fotos
- [ ] MSW handlers para `GET /api/albums`, `POST /api/albums`, `GET /api/albums/:id/photos`
- [ ] Typecheck passa

### US-013: Integration tests para RadiosPage
**Description:** As a developer, I want integration tests for the radios page so that I can verify radio management flows.

**Acceptance Criteria:**
- [ ] RadiosPage exibe lista de rádios do usuário
- [ ] RadiosPage exibe estado vazio quando não há rádios
- [ ] Adicionar nova rádio com nome e URL válidos chama `POST /api/radios` e aparece na lista
- [ ] Clicar no ícone de favorito chama `PUT /api/radios/:id/favorite` e atualiza o estado visual
- [ ] Deletar uma rádio chama `DELETE /api/radios/:id` e a remove da lista
- [ ] MSW handlers para todos os endpoints de rádio
- [ ] Typecheck passa

### US-014: README completo com setup, arquitetura e deploy
**Description:** As a developer, I want a comprehensive README so that anyone can set up and deploy the project without prior knowledge.

**Acceptance Criteria:**
- [ ] `README.md` criado na raiz do projeto
- [ ] Seção **Sobre o Projeto**: descrição curta, screenshot ou gif (placeholder ok), tech stack com versões
- [ ] Seção **Pré-requisitos**: Docker + Docker Compose, Node 20+, versões mínimas
- [ ] Seção **Setup Local**: passo a passo com comandos exatos — `docker compose up`, seed, variáveis de ambiente, URL de acesso
- [ ] Seção **Variáveis de Ambiente**: tabela com todas as variáveis do `.env.example` (nome, descrição, exemplo)
- [ ] Seção **Arquitetura**: diagrama ASCII ou descrição dos serviços (nginx, PHP-FPM, Vite, PostgreSQL, MinIO) e como se comunicam
- [ ] Seção **Estrutura de Pastas**: árvore com descrição das pastas principais (`backend/`, `frontend/`, `docker/`, `scripts/`)
- [ ] Seção **Deploy na Hostinger**: referência ao script `scripts/deploy-hostinger.sh` com variáveis necessárias e pré-requisitos de SSH
- [ ] Seção **Testes**: comandos para rodar testes backend (`php artisan test`) e frontend (`npm run test`)
- [ ] Typecheck passa (README não afeta typecheck, mas verificar se nenhum arquivo foi quebrado)

### US-015: Documentação da API em docs/api.md
**Description:** As a developer, I want a Markdown API reference so that I can understand all endpoints, their inputs, and expected responses without reading the source code.

**Acceptance Criteria:**
- [ ] Arquivo criado em `docs/api.md`
- [ ] Seção de **Autenticação**: explica o mecanismo (Sanctum bearer token), como obter e usar o token
- [ ] Cada endpoint documentado com: método HTTP, URL, autenticação requerida (sim/não), parâmetros de request (body/path), exemplo de response de sucesso (JSON), códigos de erro possíveis
- [ ] Endpoints cobertos: `POST /login`, `POST /logout`, `GET /user`, `GET /trips`, `GET /trips/:id`, `GET /trips/:id/points`, `GET /albums`, `POST /albums`, `PUT /albums/:id`, `DELETE /albums/:id`, `GET /albums/:id/photos`, `POST /albums/:id/photos`, `DELETE /photos/:id`, `GET /radios`, `POST /radios`, `PUT /radios/:id`, `DELETE /radios/:id`, `PUT /radios/:id/favorite`
- [ ] Seção de **Erros Comuns** com tabela de códigos HTTP usados pela API (400, 401, 403, 404, 422)

## Functional Requirements

- FR-1: Backend usa SQLite in-memory para testes de feature (isolado do banco de desenvolvimento)
- FR-2: Todos os testes de feature do backend usam `RefreshDatabase` para garantir estado limpo entre testes
- FR-3: Upload de fotos nos testes usa `Storage::fake('public')` — nenhum arquivo real gravado em disco
- FR-4: Frontend usa MSW para interceptar chamadas HTTP nos testes (sem hits reais na API)
- FR-5: Componentes que dependem de Mapbox GL, tsparticles e GSAP devem ser mockados via `vi.mock()` nos testes de integração
- FR-6: Coverage threshold do backend: ≥ 80% nas linhas dos controllers e models
- FR-7: Coverage threshold do frontend: ≥ 70% em branches, functions, lines e statements (excluindo `node_modules`, `*.config.*` e arquivos de setup)
- FR-8: README na raiz do projeto (substitui ou cria o arquivo principal de documentação)
- FR-9: Docs da API em `docs/api.md` usando Markdown puro (sem dependências externas)

## Non-Goals

- Não incluir testes E2E (Playwright, Cypress) — fora do escopo desta iteração
- Não gerar documentação OpenAPI/Swagger interativa
- Não adicionar JSDoc/PHPDoc inline ao código existente
- Não testar componentes puramente visuais sem lógica (ex: `BiografiaSection`, `EscritorioSection`, `TimelineSection`)
- Não testar `MapaViagensSection` (dependência profunda do Mapbox GL)
- Não configurar CI/CD pipeline (GitHub Actions etc)

## Technical Considerations

- **Backend**: PHPUnit 11 e Mockery já estão em `composer.json` — apenas configurar o ambiente. Usar `pcov` ou `xdebug` para coverage (checar disponibilidade no container Docker).
- **Frontend**: Nenhuma dependência de teste instalada ainda — instalar via `npm install --save-dev`.
- **Mapbox GL**: mock obrigatório nos testes frontend (`vi.mock('mapbox-gl')`).
- **Howler**: mock obrigatório no teste do RadioPlayer (`vi.mock('howler')`).
- **GSAP e tsparticles**: mockar quando necessário nas páginas que os usam.
- **React Router**: usar `MemoryRouter` do `react-router-dom` nos testes de componentes que usam `useNavigate` ou `Link`.
- **Token no localStorage**: usar `localStorage.setItem` diretamente no setup dos testes que precisam de auth.

## Success Metrics

- `php artisan test --coverage` reporta ≥ 80% de cobertura nos controllers e models
- `npm run test:coverage` reporta ≥ 70% nas métricas configuradas
- Um novo desenvolvedor consegue subir o projeto localmente seguindo apenas o README
- Todos os 17 endpoints da API estão documentados em `docs/api.md`

## Open Questions

- O container Docker tem `pcov` ou `xdebug` disponível para coverage do PHP? Se não, pode ser necessário instalar via Dockerfile.
- Howler é usado diretamente no RadioPlayer ou via um hook customizado? (Verificar antes de escrever o mock)
