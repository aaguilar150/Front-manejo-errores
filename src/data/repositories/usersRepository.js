import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'

export const usersRepository = {
  create: (email, password, role) => http.post(endpoints.users.create, { email, password, role }),
}
