import { defineStore } from 'pinia'
import { authRepository } from '@/data/repositories/authRepository'
import { setAuthToken } from '@/core/api/httpClient'
import { can } from '@/core/auth/permissions'

const STORAGE_KEY = 'auth'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved?.token) setAuthToken(saved.token)
    return { token: saved?.token || null, user: saved?.user || null }
  },
  getters: {
    isAuthenticated: (s) => !!s.token,
    role: (s) => s.user?.role || null,
    can: (s) => (action) => can(s.user?.role, action),
  },
  actions: {
    async login(email, password) {
      const { token, user } = await authRepository.login(email, password)
      this.token = token
      this.user = user
      setAuthToken(token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
    },
    logout() {
      this.token = null
      this.user = null
      setAuthToken(null)
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
