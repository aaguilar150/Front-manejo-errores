// Endpoints reales (Swagger admin). Cambia BASE_URL en .env; toda traducción
// front<->back vive en src/data/mappers + los repositorios.
export const endpoints = {
  auth: {
    login: '/admin/login', // POST { usuario, password } -> { token, tipo }
  },
  // Sección A — registros (personas)
  personas: {
    list: '/admin/personas', // GET ?limite&estado&moderacion
    moderacion: (id) => `/admin/personas/${id}/moderacion`, // PATCH ?valor=aprobada|rechazada|pendiente
    byId: (id) => `/admin/personas/${id}`, // DELETE (borra contenido + fotos)
    buscar: '/buscar', // POST multipart (búsqueda por foto) — sin UI por ahora
  },
  // Secciones B (publicacion) y C (falla) — reportes
  reportes: {
    list: '/admin/reportes', // GET ?tipo=publicacion|falla &estado &limite
    estado: (id) => `/admin/reportes/${id}/estado`, // PATCH ?valor=pendiente|revisado|resuelto|descartado
  },
}
