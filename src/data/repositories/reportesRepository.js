import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapReporte } from '@/data/mappers/reporteMapper'
import { paginate } from '@/core/filters'

// Sección B — reportes de publicaciones inadecuadas (tipo 'publicacion').
export const reportesRepository = {
  async list({ page, limit, q, estado } = {}) {
    const raw = await http.get(endpoints.reportes.list + qs({ tipo: 'publicacion', estado, limite: 500 }))
    let rows = raw.map(mapReporte)
    if (q) rows = rows.filter((r) => (r.pubNombre || '').toLowerCase().includes(q.toLowerCase()))
    return paginate(rows, page, limit)
  },
  // estado del reporte: pendiente | revisado | resuelto | descartado
  setEstado: (id, valor) => http.patch(endpoints.reportes.estado(id) + qs({ valor })),
  // acciones sobre la PUBLICACIÓN reportada (vía person_id)
  ocultarPublicacion: (personId) => http.patch(endpoints.personas.moderacion(personId) + qs({ valor: 'rechazada' })),
  eliminarPublicacion: (personId) => http.delete(endpoints.personas.byId(personId)),
}
