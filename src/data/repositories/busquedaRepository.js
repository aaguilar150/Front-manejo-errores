import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { mapMatch } from '@/data/mappers/matchMapper'

// Búsqueda por foto: compara una imagen contra TODA la base (POST /buscar, multipart).
export const busquedaRepository = {
  async buscar({ file, limite = 10, estado = '' }) {
    const fd = new FormData()
    fd.append('file', file)
    if (limite) fd.append('limite', String(limite))
    if (estado) fd.append('estado', estado)
    const res = await http.postForm(endpoints.personas.buscar, fd)
    const items = Array.isArray(res) ? res : (res?.data ?? [])
    return items.map(mapMatch)
  },
  // Elimina la publicación/persona (borra contenido + fotos).
  eliminar: (personId) => http.delete(endpoints.personas.byId(personId)),
}
