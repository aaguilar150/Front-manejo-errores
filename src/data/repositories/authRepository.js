import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'

export const authRepository = {
  login: (email, password) => http.post(endpoints.auth.login, { email, password }),
}
