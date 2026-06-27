import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapReporte } from '@/data/mappers/reporteMapper'
import { filterByDate, paginate } from '@/core/filters'

// Sección C — reportes del panel de errores (tipo 'falla').
// El back no tiene DELETE de reportes: "descartar" = estado 'descartado'.
export const comentariosRepository = {
  async list({ page, limit, desde, hasta, estado } = {}) {
    const raw = await http.get(endpoints.reportes.list + qs({ tipo: 'falla', estado, limite: 500 }))
    const rows = filterByDate(raw.map(mapReporte), { desde, hasta }, 'fechaCreacion')
    return paginate(rows, page, limit)
  },
  setEstado: (id, valor) => http.patch(endpoints.reportes.estado(id) + qs({ valor })),
}
