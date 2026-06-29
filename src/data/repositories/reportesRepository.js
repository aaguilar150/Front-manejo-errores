import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapReporte } from '@/data/mappers/reporteMapper'
import { paginate, unwrapList } from '@/core/filters'

// Sección B — reportes de publicaciones inadecuadas (tipo 'publicacion').
// Filtros/paginación vía query: ?tipo=publicacion&estado&q&limite&offset.
export const reportesRepository = {
  async list({ page = 1, limite = 10000, q = '', estado = '' } = {}) {
    const offset = (page - 1) * limite
    const res = await http.get(endpoints.reportes.list + qs({ tipo: 'publicacion', estado, q, limite, offset }))
    const { items, total, paged } = unwrapList(res)
    let rows = items.map(mapReporte)
    if (!paged) {
      if (q) rows = rows.filter((r) => (r.pubNombre || '').toLowerCase().includes(q.toLowerCase()))
      return paginate(rows, page, limite)
    }
    return { data: rows, total, page, limite }
  },
  // estado del reporte: pendiente | revisado | resuelto | descartado
  setEstado: (id, valor) => http.patch(endpoints.reportes.estado(id) + qs({ valor })),
  // acciones sobre la PUBLICACIÓN reportada (vía person_id)
  ocultarPublicacion: (personId) => http.patch(endpoints.personas.moderacion(personId) + qs({ valor: 'rechazada' })),
  eliminarPublicacion: (personId) => http.delete(endpoints.personas.byId(personId)),
}
