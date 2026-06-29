import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapPersona } from '@/data/mappers/personaMapper'
import { mapHistorial, mapCoincidencias } from '@/data/mappers/fichaMapper'
import { filterPersonas, paginate, unwrapList } from '@/core/filters'

// Sección A — registros (personas). Búsqueda centralizada vía query al back:
// ?nombre&apellido&es_menor&cedula&doc_numero&estado&moderacion + paginación
// (paginado&limite&offset). Fallback a cliente si el back devuelve array plano.
export const registrosRepository = {
  async list({ page = 1, limite = 10000, personId = '', nombre = '', apellido = '', esMenor = '', cedula = '', docNumero = '', estado = '', moderacion = '' } = {}) {
    const offset = (page - 1) * limite
    // paginado=true => back devuelve {data, meta:{total_records,...}} para el total real.
    const res = await http.get(endpoints.personas.list + qs({
      paginado: true, limite, offset,
      person_id: personId, nombre, apellido, es_menor: esMenor, cedula, doc_numero: docNumero, estado, moderacion,
    }))
    const { items, total, paged } = unwrapList(res)
    const rows = items.map(mapPersona)
    if (!paged) return paginate(filterPersonas(rows, { personId, nombre, apellido, esMenor, cedula, docNumero }), page, limite)
    return { data: rows, total, page, limite }
  },
  // valor = aprobada | rechazada | pendiente. 'rechazada' = ocultar (no se indexa).
  moderar: (id, valor) => http.patch(endpoints.personas.moderacion(id) + qs({ valor })),
  ocultar: (id) => http.patch(endpoints.personas.moderacion(id) + qs({ valor: 'rechazada' })),
  remove: (id) => http.delete(endpoints.personas.byId(id)),
  // Ficha: trazabilidad (avistamientos) y búsqueda inversa por cédula (familiares).
  async historial(id) { return mapHistorial(await http.get(endpoints.personas.historial(id))) },
  async coincidencias(id) { return mapCoincidencias(await http.get(endpoints.personas.coincidencias(id))) },
}
