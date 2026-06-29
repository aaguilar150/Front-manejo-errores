import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapReporte } from '@/data/mappers/reporteMapper'
import { filterByDate, paginate, unwrapList } from '@/core/filters'

// Sección C — reportes del panel de errores (tipo 'falla').
// Filtros/paginación vía query: ?tipo=falla&estado&desde&hasta&limite&offset.
// El back no borra reportes: "descartar" = estado 'descartado'.
export const comentariosRepository = {
  async list({ page = 1, limite = 10000, desde = '', hasta = '', estado = '' } = {}) {
    const offset = (page - 1) * limite
    const res = await http.get(endpoints.reportes.list + qs({ tipo: 'falla', estado, desde, hasta, limite, offset }))
    const { items, total, paged } = unwrapList(res)
    let rows = items.map(mapReporte)
    if (!paged) return paginate(filterByDate(rows, { desde, hasta }, 'fechaCreacion'), page, limite)
    return { data: rows, total, page, limite }
  },
  setEstado: (id, valor) => http.patch(endpoints.reportes.estado(id) + qs({ valor })),
}
