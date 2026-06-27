# Especificación de Backend — Panel de Reportes

Contrato que el frontend **ya consume**. Respetar nombres de campos, métodos y
formas de respuesta tal cual están aquí; si cambian, hay que tocar también el
front (`src/core/api/endpoints.js` y los repositorios).

- Base URL configurable desde el front (`VITE_API_BASE_URL`).
- Formato: JSON (`Content-Type: application/json`).
- Autenticación: **Bearer token** en header `Authorization: Bearer <token>` en
  todas las rutas excepto `POST /auth/login`.

---

## 1. Roles y permisos

Tres roles. El front oculta/bloquea según el rol, **pero el backend DEBE
validar cada acción de nuevo** (el front no es fuente de verdad de seguridad).

| Rol       | Ver reportes | Actualizar reporte | Eliminar reporte | Crear usuarios |
|-----------|:------------:|:------------------:|:----------------:|:--------------:|
| `admin`   | ✅           | ✅                 | ✅               | ✅             |
| `gestor`  | ✅           | ✅                 | ✅               | ❌             |
| `revisor` | ✅           | ❌                 | ❌               | ❌             |

Capacidades internas que el front usa como referencia:
`reports:read`, `reports:write`, `reports:delete`, `users:manage`.

El token debe permitir derivar el rol del usuario (claim `role` en el JWT o
lookup en BD). Cada endpoint protegido valida la capacidad correspondiente y
responde **403** si no la tiene.

---

## 2. Endpoints

### 2.1 `POST /auth/login` — público

Request:
```json
{ "email": "admin@demo.com", "password": "123456" }
```

Response `200`:
```json
{
  "token": "eyJhbGci...",
  "user": { "email": "admin@demo.com", "role": "admin", "name": "Admin" }
}
```

Errores:
- `401` credenciales inválidas → `{ "message": "Credenciales inválidas" }`

> El front guarda `token` y `user` en localStorage y manda el token en cada
> request. `role` debe ser uno de: `admin` | `gestor` | `revisor`.

---

### 2.2 `GET /reports` — requiere `reports:read`

Lista de reportes. Response `200`: **array** de objetos Reporte (ver §3).

```json
[
  {
    "id": 1,
    "publicacionId": "PUB-1042",
    "nombre": "María",
    "apellido": "González",
    "ubicacion": "Guadalajara, Jalisco",
    "motivo": "Informacion falsa",
    "usuario": "user_12",
    "estado": "pendiente",
    "fecha": "2026-06-20",
    "descripcion": "La publicación usa datos de contacto que no corresponden a la familia.",
    "imagen": "https://cdn.tu-dominio.com/reportes/1.jpg"
  }
]
```

> El front hoy pide la lista completa. Si el volumen crece, ver §6 (paginación).

---

### 2.3 `GET /reports/stats` — requiere `reports:read`

Totales para el dashboard. Response `200`:
```json
{ "total": 5, "atendidos": 2, "pendientes": 3 }
```

- `total` = todos los reportes
- `atendidos` = `estado === "atendido"`
- `pendientes` = `estado === "pendiente"`

---

### 2.4 `PUT /reports/{id}` — requiere `reports:write`

Actualización parcial. El front hoy solo manda el cambio de estado:
```json
{ "estado": "atendido" }
```
Debe aceptar también actualizar otros campos del reporte (merge parcial).

Response `200`: el reporte **completo y actualizado** (mismo shape que §3).

Errores:
- `404` `{ "message": "Reporte no encontrado" }`
- `403` sin permiso

---

### 2.5 `DELETE /reports/{id}` — requiere `reports:delete`

Response `204` sin body (o `200` con body vacío).

Errores:
- `404` `{ "message": "Reporte no encontrado" }`
- `403` sin permiso

---

### 2.6 `POST /users` — requiere `users:manage` (solo admin)

Alta de usuario del panel.

Request:
```json
{ "email": "nuevo@demo.com", "password": "secret123", "role": "revisor" }
```
- `role` ∈ `admin` | `gestor` | `revisor`
- `password` mínimo 6 caracteres (el front valida `minlength=6`, validar también en back)

Response `201`:
```json
{ "email": "nuevo@demo.com", "role": "revisor", "name": "nuevo" }
```
> Nunca devolver el password ni su hash.

Errores:
- `409` correo ya existe → `{ "message": "El correo ya existe" }`
- `400` datos inválidos

---

## 3. Modelo Reporte (campos exactos)

| Campo           | Tipo     | Notas                                                        |
|-----------------|----------|--------------------------------------------------------------|
| `id`            | number   | PK, autoincremental                                          |
| `publicacionId` | string   | ID de la publicación original (ej. `PUB-1042`)               |
| `nombre`        | string   | Nombre de la persona desaparecida                            |
| `apellido`      | string   | Apellido de la persona desaparecida                          |
| `ubicacion`     | string   | Ciudad/Estado                                                |
| `motivo`        | enum     | `Contenido inadecuado` \| `Informacion falsa` \| `Violencia` |
| `usuario`       | string   | Quién hizo el reporte (handle/ID del reportante)             |
| `estado`        | enum     | `pendiente` \| `atendido`                                    |
| `fecha`         | string   | Fecha del reporte, formato `YYYY-MM-DD`                      |
| `descripcion`   | string   | Texto libre, detalle del reporte                             |
| `imagen`        | string   | **URL** a la imagen de la publicación                        |

> El front muestra la imagen vía la URL en `imagen`. El backend decide cómo se
> almacena el archivo (ver §5). El front nunca sube la imagen en estos endpoints.

---

## 4. Esquema de base de datos (SQL de referencia)

PostgreSQL como ejemplo; adaptar al motor que usen.

```sql
-- Usuarios del panel (operadores), NO las personas desaparecidas
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,          -- bcrypt/argon2, nunca texto plano
    name          VARCHAR(120) NOT NULL,
    role          VARCHAR(20)  NOT NULL
                  CHECK (role IN ('admin', 'gestor', 'revisor')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE reports (
    id             SERIAL PRIMARY KEY,
    publicacion_id VARCHAR(50)  NOT NULL,          -- mapear a publicacionId en JSON
    nombre         VARCHAR(120) NOT NULL,
    apellido       VARCHAR(120) NOT NULL,
    ubicacion      VARCHAR(255) NOT NULL,
    motivo         VARCHAR(30)  NOT NULL
                   CHECK (motivo IN ('Contenido inadecuado', 'Informacion falsa', 'Violencia')),
    usuario        VARCHAR(120) NOT NULL,          -- reportante
    estado         VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'atendido')),
    fecha          DATE         NOT NULL DEFAULT CURRENT_DATE,
    descripcion    TEXT,
    imagen         TEXT,                           -- URL pública o firmada
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_estado ON reports(estado);
CREATE INDEX idx_reports_fecha  ON reports(fecha);
```

> Nota de naming: la BD usa `snake_case` (`publicacion_id`), el JSON usa
> `camelCase` (`publicacionId`). Mapear en la capa de serialización.

---

## 5. Imágenes

El campo `imagen` es una **URL**, no el binario. Opciones para el back:

1. **Almacenamiento de objetos** (S3, GCS, Spaces) → guardar la URL pública.
2. **URL firmada temporal** si el bucket es privado → el back genera la URL al
   responder `GET /reports`. Considerar caducidad razonable.
3. Servir desde el propio backend (`/media/...`).

El front pinta la imagen grande en el modal de detalle. Recomendado: imágenes
en proporción ~3:2; el front aplica `object-fit: cover`.

---

## 6. Pendientes / decisiones para el equipo back

- **Paginación**: hoy `GET /reports` devuelve todo. Si crece, añadir
  `?page=&limit=` y devolver `{ data: [...], total, page, limit }` —
  esto **sí** requiere ajuste en el front (avisar).
- **Filtros**: por `estado`, `motivo`, rango de `fecha` (futuro).
- **Auditoría**: quién atendió/eliminó cada reporte y cuándo (no implementado
  en front todavía).
- **Refresh token / expiración**: definir TTL del JWT y manejo de `401` por
  token vencido (el front haría logout).
- **Endpoint de alta de reportes**: el panel hoy solo lee/actualiza/elimina.
  Si los reportes entran por otra vía (app pública), documentar ese flujo aparte.

---

## 7. Resumen de rutas

| Método | Ruta              | Permiso          | Body                                  | Respuesta              |
|--------|-------------------|------------------|---------------------------------------|------------------------|
| POST   | `/auth/login`     | público          | `{email, password}`                   | `{token, user}`        |
| GET    | `/reports`        | `reports:read`   | —                                     | `Reporte[]`            |
| GET    | `/reports/stats`  | `reports:read`   | —                                     | `{total, atendidos, pendientes}` |
| PUT    | `/reports/{id}`   | `reports:write`  | parcial de Reporte (ej. `{estado}`)   | `Reporte`              |
| DELETE | `/reports/{id}`   | `reports:delete` | —                                     | `204`                  |
| POST   | `/users`          | `users:manage`   | `{email, password, role}`             | `{email, role, name}`  |

Errores con shape uniforme: `{ "message": "texto legible" }` + código HTTP
adecuado (`400/401/403/404/409`).
