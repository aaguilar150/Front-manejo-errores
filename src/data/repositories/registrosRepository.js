import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapPersona } from '@/data/mappers/personaMapper'
import { filterPersonas, paginate } from '@/core/filters'

// Sección A — registros (personas). Back devuelve array; buscar por nombre/edad/
// menor y paginar se hace aquí (el back solo filtra por estado/moderacion).
export const registrosRepository = {
  async list({ page, limit, q, edad, menor, estado, moderacion } = {}) {
    const raw = await http.get(endpoints.personas.list + qs({ limite: 500, estado, moderacion }))
    const rows = filterPersonas(raw.map(mapPersona), { q, edad, menor })
    return paginate(rows, page, limit)
  },
  // valor = aprobada | rechazada | pendiente. 'rechazada' = ocultar (no se indexa).
  moderar: (id, valor) => http.patch(endpoints.personas.moderacion(id) + qs({ valor })),
  ocultar: (id) => http.patch(endpoints.personas.moderacion(id) + qs({ valor: 'rechazada' })),
  remove: (id) => http.delete(endpoints.personas.byId(id)),
}
