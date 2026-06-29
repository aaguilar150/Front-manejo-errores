# Mapeo Front ↔ Back (Swagger admin)

El front consume **los endpoints reales del Swagger**. El mock (`VITE_USE_MOCK=true`)
imita ese Swagger campo por campo, así que apagarlo (`false` + `VITE_API_BASE_URL`)
conecta el back real sin tocar componentes.

## Paginación y filtros (lo que el front YA manda)

Todos los listados van por **query params**, paginación con **`limit` + `offset`**.
El front espera respuesta **`{ "data": [...], "total": N }`**.

> Transición: si el back todavía devuelve un **array plano**, el repo lo pagina/
> filtra en cliente como fallback. En cuanto devuelva `{data,total}`, el front
> confía en el server automáticamente (sin cambios de código).

| Listado | Query params que manda el front |
|---|---|
| `GET /admin/personas`  | `limit, offset, q, edad, menor(true\|false), estado, moderacion` |
| `GET /admin/reportes` (B) | `tipo=publicacion, estado, q, limit, offset` |
| `GET /admin/reportes` (C) | `tipo=falla, estado, desde, hasta, limit, offset` |

- `q`: busca en nombre/apellido (personas) o `pub_nombre` (reportes publicacion).
- `menor`: `true` => edad < 18, `false` => edad ≥ 18.
- `desde`/`hasta`: rango sobre `created_at` (`YYYY-MM-DD`).

Toda traducción vive en:
- `src/data/mappers/` — back → shape estable del front (`personaMapper`, `reporteMapper`)
- `src/data/repositories/` — llaman al endpoint y aplican búsqueda/paginación cliente
- `src/core/filters.js` — filtros (nombre/edad/menor, rango fecha) y paginación

`.env`: `VITE_API_BASE_URL` (base), `VITE_USE_MOCK` (true/false). Token: header
`Authorization: Bearer <token>` (lo pone `httpClient` tras el login).

## Auth
`POST /admin/login` `{usuario,password}` → `{token, tipo}`. El front asume rol único
**superadmin** (no hay multi-rol ni alta de usuarios en el back).

## Sección A — Registros → `/admin/personas`
- `GET /admin/personas?limite&estado&moderacion` → array de personas.
  Búsqueda por **nombre/edad/menor** es cliente (back no la soporta).
- Ocultar (softdelete, no se indexa) = `PATCH /admin/personas/{id}/moderacion?valor=rechazada`
- Aprobar/pendiente = mismo PATCH con `valor=aprobada|pendiente`
- Eliminar contenido = `DELETE /admin/personas/{id}`
- **Sin endpoint de edición** de campos → no hay botón "editar". (Pendiente back.)

## Sección B — Publicaciones inadecuadas → `/admin/reportes?tipo=publicacion`
- `GET` → array; búsqueda por `pub_nombre` es cliente. (No trae edad/es_menor.)
- Revisado / sin revisar = `PATCH /admin/reportes/{id}/estado?valor=revisado|pendiente`
- Ocultar publicación = `PATCH /admin/personas/{person_id}/moderacion?valor=rechazada`
- Eliminar publicación = `DELETE /admin/personas/{person_id}`

## Sección C — Reportes de fallas → `/admin/reportes?tipo=falla`
- `GET` → array; filtro por **rango de `created_at`** es cliente.
- Revisado / sin revisar = `PATCH /admin/reportes/{id}/estado?valor=revisado|pendiente`
- "Eliminar" = **descartar** (`valor=descartado`). El back no borra reportes.

## Dashboard
No hay endpoint de stats: `panelRepository.stats()` los deriva de
`/admin/personas` + `/admin/reportes`.

## No usado todavía
`POST /buscar` (búsqueda por foto, multipart). Sin UI por ahora.

## Ajustes pendientes del back (avisar al equipo)
- Paginación + búsqueda server-side en `/admin/personas` y `/admin/reportes`
  (hoy se traen hasta 500 y se filtra/pagina en cliente).
- Endpoint para **editar** campos de una persona (Sección A).
- `es_menor` / edad en el payload de reportes tipo `publicacion` (para filtrar B por edad).
