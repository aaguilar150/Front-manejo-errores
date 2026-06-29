import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapTestimonio } from '@/data/mappers/testimonioMapper'
import { paginate, unwrapList } from '@/core/filters'

// Sección D — testimonios. El back filtra por estado y topa con limite (sin offset),
// así que traemos todo el filtrado y paginamos en cliente.
export const testimoniosRepository = {
  async list({ page = 1, limite = 10, estado = '' } = {}) {
    const res = await http.get(endpoints.testimonios.list + qs({ estado, limite: 100000 }))
    const rows = unwrapList(res).items.map(mapTestimonio)
    return paginate(rows, page, limite)
  },
  // valor = aprobada | rechazada | pendiente
  setEstado: (id, valor) => http.patch(endpoints.testimonios.estado(id) + qs({ valor })),
  remove: (id) => http.delete(endpoints.testimonios.byId(id)),
}
