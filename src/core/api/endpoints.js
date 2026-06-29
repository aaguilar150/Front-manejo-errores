// Endpoints reales (Swagger admin). Cambia BASE_URL en .env; toda traducción
// front<->back vive en src/data/mappers + los repositorios.
export const endpoints = {
  auth: {
    login: '/admin/login', // POST { usuario, password } -> { token, tipo }
  },
  // Conteos reales para el dashboard (no dependen de paginación).
  stats: '/admin/stats', // GET -> { total, buscadas, encontradas, ... }
  // Sección A — registros (personas)
  personas: {
    list: '/admin/personas/paginated', // GET ?paginado&limite&offset&estado&moderacion
    moderacion: (id) => `/admin/personas/${id}/moderacion`, // PATCH ?valor=aprobada|rechazada|pendiente
    byId: (id) => `/admin/personas/${id}`, // DELETE (borra contenido + fotos)
    historial: (id) => `/admin/personas/${id}/historial`, // GET — avistamientos cronológicos
    coincidencias: (id) => `/admin/personas/${id}/coincidencias`, // GET — familiares que buscan + histórico
    buscar: '/buscar', // POST multipart (file, limite, estado) — comparar foto vs base
  },
  // Secciones B (publicacion) y C (falla) — reportes
  reportes: {
    list: '/admin/reportes', // GET ?tipo=publicacion|falla &estado &limite
    estado: (id) => `/admin/reportes/${id}/estado`, // PATCH ?valor=pendiente|revisado|resuelto|descartado
  },
  // Sección D — testimonios
  testimonios: {
    list: '/admin/testimonios', // GET ?estado &limite
    estado: (id) => `/admin/testimonios/${id}/estado`, // PATCH ?valor=aprobada|rechazada|pendiente
    byId: (id) => `/admin/testimonios/${id}`, // DELETE (borra el archivo)
  },
}
