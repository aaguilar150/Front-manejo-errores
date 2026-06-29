import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'
import { mapStats } from '@/data/mappers/statsMapper'

// Conteos reales del dashboard vía GET /admin/stats (no dependen de paginación).
export const panelRepository = {
  async stats() {
    return mapStats(await http.get(endpoints.stats))
  },
}
