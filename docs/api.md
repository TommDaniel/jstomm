# API Reference — 70 Anos da Vó Jacinta

Base URL: `http://localhost/api` (desenvolvimento) · `https://seu-dominio.com/api` (produção)

Todas as respostas usam `Content-Type: application/json`.

---

## Autenticação

A API usa **Laravel Sanctum** com tokens Bearer. Para endpoints protegidos, inclua o header:

```
Authorization: Bearer <token>
```

O token é obtido via `POST /login` e deve ser armazenado no cliente (localStorage key: `auth_token`).

---

## Endpoints

### Auth

#### POST /login

Autentica o usuário e retorna um token de acesso.

**Request body:**
```json
{
  "email": "string (required, email format)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "token": "1|AbCdEfGhIjKlMnOpQrStUvWxYz...",
  "user": {
    "id": 1,
    "name": "Jacinta",
    "email": "jacinta@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Response 401:**
```json
{ "message": "Credenciais inválidas." }
```

**Response 422 (validação):**
```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

#### POST /logout

Encerra a sessão do usuário autenticado. Requer autenticação.

**Response 200:**
```json
{ "message": "Sessão encerrada." }
```

---

#### GET /user

Retorna os dados do usuário autenticado. Requer autenticação.

**Response 200:**
```json
{
  "id": 1,
  "name": "Jacinta",
  "email": "jacinta@example.com",
  "role": "user",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

---

### Viagens

Endpoints públicos — não requerem autenticação.

#### GET /trips

Lista todas as viagens ordenadas por ano.

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Rio Grande do Sul 1985",
    "year": 1985,
    "total_km": 850,
    "category": "rs"
  },
  {
    "id": 2,
    "name": "Argentina 1998",
    "year": 1998,
    "total_km": 1200,
    "category": "internacional"
  }
]
```

> Campos retornados: `id`, `name`, `year`, `total_km`, `category`. O campo `description` é omitido neste endpoint.

**Categorias possíveis:** `rs` · `brasil` · `internacional`

---

#### GET /trips/{id}

Retorna o detalhe de uma viagem com seus pontos no mapa.

**Response 200:**
```json
{
  "id": 1,
  "name": "Rio Grande do Sul 1985",
  "year": 1985,
  "description": "Viagem de carro pela serra gaúcha.",
  "total_km": 850,
  "category": "rs",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z",
  "points": [
    {
      "id": 1,
      "trip_id": 1,
      "name": "Porto Alegre",
      "latitude": -30.034647,
      "longitude": -51.217658,
      "order": 1,
      "km_from_previous": 0,
      "arrival_date": "1985-07-10",
      "description": "Ponto de partida",
      "is_car_route": true,
      "is_hub": true
    }
  ]
}
```

**Response 404:**
```json
{ "message": "No query results for model [App\\Models\\Trip]." }
```

---

#### GET /trips/{id}/points

Lista os pontos de uma viagem ordenados pelo campo `order`.

**Response 200:**
```json
[
  {
    "id": 1,
    "trip_id": 1,
    "name": "Porto Alegre",
    "latitude": -30.034647,
    "longitude": -51.217658,
    "order": 1,
    "km_from_previous": 0,
    "arrival_date": "1985-07-10",
    "description": "Ponto de partida",
    "photo_id": null,
    "is_car_route": true,
    "is_hub": true,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

---

### Álbuns

Todos os endpoints de álbum requerem autenticação. Operações de update/delete são restritas ao dono do álbum.

#### GET /albums

Lista os álbuns do usuário autenticado com contagem de fotos, ordenados do mais recente.

**Response 200:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Viagem ao Sul",
    "type": "viagem",
    "cover_photo_id": null,
    "photos_count": 15,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

**Tipos possíveis:** `periodo` · `viagem` · `momento`

---

#### POST /albums

Cria um novo álbum.

**Request body:**
```json
{
  "name": "string (required, max 255)",
  "type": "periodo|viagem|momento (required)"
}
```

**Response 201:**
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Momentos Especiais",
  "type": "momento",
  "cover_photo_id": null,
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

---

#### PUT /albums/{id}

Atualiza um álbum. Somente o dono pode atualizar.

**Request body (todos opcionais):**
```json
{
  "name": "string (max 255)",
  "type": "periodo|viagem|momento"
}
```

**Response 200:** Objeto do álbum atualizado.

**Response 403:** Usuário não é o dono do álbum.

---

#### DELETE /albums/{id}

Remove um álbum e todas as suas fotos. Somente o dono pode deletar.

**Response 204:** Sem corpo.

**Response 403:** Usuário não é o dono do álbum.

---

### Fotos

#### GET /albums/{album_id}/photos

Lista as fotos de um álbum. Paginado (24 fotos por página).

**Query parameters:**
- `page` (int, default: 1)

**Response 200:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "album_id": 1,
      "path": "photos/uuid.jpg",
      "thumbnail_path": null,
      "caption": "Pôr do sol na praia",
      "taken_at": "1985-07-15",
      "width": 3024,
      "height": 4032,
      "metadata": null,
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "first_page_url": "http://localhost/api/albums/1/photos?page=1",
  "from": 1,
  "last_page": 3,
  "last_page_url": "http://localhost/api/albums/1/photos?page=3",
  "next_page_url": "http://localhost/api/albums/1/photos?page=2",
  "path": "http://localhost/api/albums/1/photos",
  "per_page": 24,
  "prev_page_url": null,
  "to": 24,
  "total": 60
}
```

O arquivo de foto é acessível em `/storage/{path}`.

---

#### POST /albums/{album_id}/photos

Faz upload de uma ou mais fotos. Somente o dono do álbum pode fazer upload.

**Request:** `multipart/form-data`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `photos[]` | file[] (required) | Array de imagens (jpg, png, gif, bmp, svg, webp). Máx 10MB cada. |
| `caption` | string (optional) | Legenda aplicada a todas as fotos do upload. |

**Response 201:**
```json
[
  {
    "id": 5,
    "album_id": 1,
    "path": "photos/generated-uuid.jpg",
    "caption": "Legenda opcional",
    "width": 0,
    "height": 0,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

**Response 403:** Usuário não é o dono do álbum.

---

#### DELETE /photos/{id}

Remove uma foto e seu arquivo no storage. Somente o dono do álbum pode deletar.

**Response 204:** Sem corpo.

**Response 403:** Usuário não é o dono do álbum da foto.

---

### Rádios

Todos os endpoints de rádio requerem autenticação. Operações de update/delete são restritas ao dono da rádio.

#### GET /radios

Lista as rádios do usuário autenticado, ordenadas pelo campo `order`.

**Response 200:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Rádio Gaúcha",
    "stream_url": "https://stream.radiogaucha.com.br/rg_128kbps",
    "logo_url": null,
    "genre": "jornalismo",
    "is_favorite": true,
    "order": 0,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

---

#### POST /radios

Adiciona uma nova rádio.

**Request body:**
```json
{
  "name": "string (required, max 255)",
  "stream_url": "string (required, URL válida)",
  "genre": "string (optional, max 100)",
  "logo_url": "string (optional, URL válida)"
}
```

**Response 201:** Objeto da rádio criada.

---

#### PUT /radios/{id}

Atualiza uma rádio. Somente o dono pode atualizar.

**Request body (todos opcionais):**
```json
{
  "name": "string (max 255)",
  "stream_url": "URL válida",
  "genre": "string (max 100)"
}
```

**Response 200:** Objeto da rádio atualizada.

**Response 403:** Usuário não é o dono da rádio.

---

#### DELETE /radios/{id}

Remove uma rádio. Somente o dono pode deletar.

**Response 204:** Sem corpo.

**Response 403:** Usuário não é o dono da rádio.

---

#### PUT /radios/{id}/favorite

Alterna o status de favorito da rádio (`is_favorite`). Somente o dono pode alterar.

**Response 200:**
```json
{
  "id": 1,
  "is_favorite": true,
  ...
}
```

**Response 403:** Usuário não é o dono da rádio.

---

## Códigos de status

| Código | Significado |
|--------|-------------|
| 200 | OK — requisição processada com sucesso |
| 201 | Created — recurso criado com sucesso |
| 204 | No Content — recurso deletado com sucesso |
| 401 | Unauthorized — token ausente ou inválido |
| 403 | Forbidden — sem permissão para esta operação |
| 404 | Not Found — recurso não encontrado |
| 422 | Unprocessable Entity — erros de validação |

---

## Roles de usuário

| Role | Descrição |
|------|-----------|
| `user` | Usuário padrão — pode gerenciar seus próprios álbuns, fotos e rádios |
| `admin` | Administrador — mesmo que `user` (sem endpoints exclusivos de admin ainda) |
