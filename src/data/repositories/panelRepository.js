import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { qs } from '@/core/api/qs'
import { mapPersona } from '@/data/mappers/personaMapper'
import { mapReporte } from '@/data/mappers/reporteMapper'

// El back no tiene endpoint de stats: el dashboard los deriva de las listas.
export const panelRepository = {
  async stats() {
    const [rawP, rawR] = await Promise.all([
      http.get(endpoints.personas.list + qs({ limite: 1000 })),
      http.get(endpoints.reportes.list + qs({ limite: 1000 })),
    ])
    const personas = rawP.map(mapPersona)
    const reportes = rawR.map(mapReporte)
    const pubs = reportes.filter((r) => r.tipo === 'publicacion')
    const fallas = reportes.filter((r) => r.tipo === 'falla')
    return {
      registros: {
        total: personas.length,
        menores: personas.filter((p) => p.esMenor).length,
        rechazadas: personas.filter((p) => p.moderacion === 'rechazada').length,
      },
      inadecuadas: {
        total: pubs.length,
        pendientes: pubs.filter((r) => r.estado === 'pendiente').length,
        resueltos: pubs.filter((r) => r.estado === 'revisado' || r.estado === 'resuelto').length,
      },
      fallas: {
        total: fallas.length,
        pendientes: fallas.filter((r) => r.estado === 'pendiente').length,
        descartados: fallas.filter((r) => r.estado === 'descartado').length,
      },
    }
  },
}
