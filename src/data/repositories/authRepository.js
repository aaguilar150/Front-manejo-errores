import { http } from '@/core/api/httpClient'
import { endpoints } from '@/core/api/endpoints'

export const authRepository = {
  // back: POST /admin/login { usuario, password } -> { token, tipo }
  login: (usuario, password) => http.post(endpoints.auth.login, { usuario, password }),
}
