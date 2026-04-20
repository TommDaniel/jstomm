# 70 Anos da Vó Jacinta 🌿

Aplicação web criada para celebrar os 70 anos da Vó Jacinta. Reúne fotos de família, memórias de viagens, rádios favoritas e um álbum interativo de vida.

## Índice

- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Setup local](#setup-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Deploy](#deploy)
- [Estrutura do projeto](#estrutura-do-projeto)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (porta 80)                     │
│              proxy reverso → app:9000 / frontend:5173       │
└──────────────┬──────────────────────────────┬──────────────┘
               │                              │
    ┌──────────▼──────────┐       ┌──────────▼──────────┐
    │   Backend (PHP)     │       │  Frontend (React)   │
    │   Laravel 11        │       │  Vite + TypeScript  │
    │   Sanctum API       │       │  TanStack Query     │
    │   porta 9000 (FPM)  │       │  porta 5173         │
    └──────────┬──────────┘       └─────────────────────┘
               │
    ┌──────────┴──────────────────────────────┐
    │                                         │
    ▼                                         ▼
┌──────────────┐                   ┌──────────────────┐
│  PostgreSQL  │                   │  MinIO (S3)      │
│  porta 5432  │                   │  porta 9000/9001 │
│  banco: vo_app│                  │  fotos e uploads │
└──────────────┘                   └──────────────────┘
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Roteamento | React Router v7 |
| Estado servidor | TanStack React Query v5 |
| Animações | Framer Motion, GSAP, Lenis (scroll suave) |
| Mapas | Mapbox GL JS |
| Áudio | Howler.js |
| Backend | Laravel 11, PHP 8.2 |
| Autenticação | Laravel Sanctum (token-based) |
| Banco de dados | PostgreSQL 16 |
| Armazenamento | MinIO (S3-compatible) |
| Infra local | Docker + Docker Compose |

---

## Pré-requisitos

- [Docker](https://www.docker.com/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- Node.js 20+ (apenas para desenvolvimento frontend local fora do Docker)

---

## Setup local

### 1. Clone e configure o ambiente

```bash
git clone <repo-url>
cd vo-70-anos

# Crie o arquivo de ambiente
cp backend/.env.example .env
```

Edite o `.env` na raiz com suas configurações (veja [Variáveis de ambiente](#variáveis-de-ambiente)).

### 2. Suba os containers

```bash
docker compose up -d
```

Isso inicia: Nginx, PHP-FPM (Laravel), Node.js (Vite dev), PostgreSQL e MinIO.

### 3. Configure o backend

```bash
# Instalar dependências PHP
docker compose exec app composer install

# Gerar chave da aplicação
docker compose exec app php artisan key:generate

# Executar migrações
docker compose exec app php artisan migrate

# (Opcional) Popular com dados de exemplo
docker compose exec app php artisan db:seed
```

### 4. Configure o MinIO

Acesse o console MinIO em `http://localhost:9001` (credenciais: `minio_user` / `minio_secret`) e crie o bucket `vo-fotos` com acesso público de leitura.

### 5. Acesse a aplicação

- **Frontend**: http://localhost (via Nginx) ou http://localhost:5173 (dev direto)
- **API**: http://localhost/api
- **MinIO Console**: http://localhost:9001

---

## Variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (usado pelo Docker Compose):

```env
# Banco de dados
DB_USERNAME=vo_user
DB_PASSWORD=vo_secret

# MinIO
MINIO_ROOT_USER=minio_user
MINIO_ROOT_PASSWORD=minio_secret
```

O backend em `backend/.env` é configurado automaticamente via `backend/.env.example`. Ajuste conforme necessário:

```env
APP_KEY=base64:...           # gerado via artisan key:generate
SANCTUM_STATEFUL_DOMAINS=localhost
```

---

## Testes

### Backend (PHPUnit + SQLite)

Os testes usam SQLite em memória — sem necessidade de PostgreSQL rodando.

```bash
# Rodar todos os testes
docker compose exec app composer test

# Rodar com relatório de cobertura (threshold >= 80%)
docker compose exec app composer test:coverage
```

Suítes de teste disponíveis:
- `tests/Feature/AuthTest.php` — autenticação (login, logout, /user)
- `tests/Feature/TripTest.php` — listagem e detalhes de viagens
- `tests/Feature/AlbumTest.php` — CRUD de álbuns (com autorização)
- `tests/Feature/PhotoTest.php` — upload e deleção de fotos
- `tests/Feature/RadioTest.php` — CRUD de rádios e toggleFavorite

### Frontend (Vitest + Testing Library)

```bash
cd frontend

# Rodar todos os testes (modo CI)
npm test

# Rodar em modo watch (desenvolvimento)
npm run test:watch

# Rodar com cobertura (threshold >= 70%)
npm run test:coverage
```

Arquivos de teste:
- `src/contexts/__tests__/AuthContext.test.tsx` — contexto de autenticação
- `src/components/__tests__/ProtectedRoute.test.tsx` — rota protegida
- `src/components/radio/__tests__/RadioPlayer.test.tsx` — player de rádio
- `src/pages/auth/__tests__/LoginPage.test.tsx` — página de login
- `src/pages/gallery/__tests__/AlbumListPage.test.tsx` — listagem de álbuns
- `src/pages/gallery/__tests__/AlbumDetailPage.test.tsx` — detalhe do álbum
- `src/pages/radio/__tests__/RadiosPage.test.tsx` — página de rádios

---

## Deploy

O frontend é deployado em hospedagem compartilhada (Hostinger). O backend requer um servidor com PHP 8.2+ e PostgreSQL.

### Frontend → Hostinger

```bash
# Crie o arquivo de produção (necessário uma vez)
cp frontend/.env.production.example frontend/.env.production
# Edite frontend/.env.production com seu VITE_MAPBOX_TOKEN

# Deploy via rsync (SSH)
./scripts/deploy-hostinger.sh user@seu-servidor.hostinger.com ~/public_html
```

O script automaticamente:
1. Faz o build de produção com `npm run build`
2. Envia os arquivos via rsync para o servidor remoto

### Backend

O backend é servido via Docker em ambiente de produção ou diretamente via PHP-FPM + Nginx. Para produção:

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose exec app php artisan migrate --force
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
```

---

## Estrutura do projeto

```
vo-70-anos/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/   # AuthController, AlbumController, etc.
│   │   ├── Models/             # User, Album, Photo, Trip, TripPoint, Radio
│   │   └── Policies/           # AlbumPolicy, PhotoPolicy, RadioPolicy
│   ├── database/
│   │   ├── factories/          # Factories para testes
│   │   └── migrations/         # Schema do banco de dados
│   ├── routes/api.php          # Rotas da API REST
│   └── tests/Feature/          # Testes de integração da API
│
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── radio/          # RadioPlayer
│   │   │   ├── gallery/        # PhotoUploader
│   │   │   └── ui/             # Button, Input (shadcn/ui style)
│   │   ├── contexts/           # AuthContext
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── auth/           # LoginPage
│   │   │   ├── gallery/        # AlbumListPage, AlbumDetailPage
│   │   │   └── radio/          # RadiosPage
│   │   ├── types/              # Tipos TypeScript
│   │   └── test/               # Setup de testes (jest-dom, mocks)
│   └── public/photos/          # Fotos estáticas (hero, família, viagens)
│
├── docker/                     # Dockerfiles e configurações
│   ├── php/                    # PHP 8.2-FPM + extensões
│   └── nginx/                  # Configuração do proxy reverso
│
├── scripts/
│   └── deploy-hostinger.sh     # Script de deploy do frontend
│
└── docker-compose.yml          # Orquestração dos serviços
```

### API Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/api/login` | ❌ | Login com email e senha |
| POST | `/api/logout` | ✅ | Encerra sessão |
| GET | `/api/user` | ✅ | Dados do usuário autenticado |
| GET | `/api/trips` | ❌ | Lista todas as viagens |
| GET | `/api/trips/{id}` | ❌ | Detalhe da viagem com pontos |
| GET | `/api/trips/{id}/points` | ❌ | Pontos ordenados da viagem |
| GET | `/api/albums` | ✅ | Lista álbuns do usuário |
| POST | `/api/albums` | ✅ | Cria novo álbum |
| PUT | `/api/albums/{id}` | ✅ | Atualiza álbum (somente dono) |
| DELETE | `/api/albums/{id}` | ✅ | Remove álbum (somente dono) |
| GET | `/api/albums/{id}/photos` | ✅ | Fotos do álbum (paginado, 24/pág) |
| POST | `/api/albums/{id}/photos` | ✅ | Upload de fotos |
| DELETE | `/api/photos/{id}` | ✅ | Remove foto (somente dono) |
| GET | `/api/radios` | ✅ | Lista rádios do usuário |
| POST | `/api/radios` | ✅ | Adiciona rádio |
| PUT | `/api/radios/{id}` | ✅ | Atualiza rádio (somente dono) |
| DELETE | `/api/radios/{id}` | ✅ | Remove rádio (somente dono) |
| PUT | `/api/radios/{id}/favorite` | ✅ | Toggle favorito |
