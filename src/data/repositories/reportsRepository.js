import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'

export const reportsRepository = {
  list: () => http.get(endpoints.reports.list),
  stats: () => http.get(endpoints.reports.stats),
  update: (id, data) => http.put(endpoints.reports.byId(id), data),
  remove: (id) => http.delete(endpoints.reports.byId(id)),
}
