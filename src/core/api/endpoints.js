// Todos los endpoints viven aquí. Cambia las rutas cuando tengas el backend real.
export const endpoints = {
  auth: {
    login: '/auth/login',
  },
  reports: {
    list: '/reports',
    stats: '/reports/stats',
    byId: (id) => `/reports/${id}`,
  },
  users: {
    create: '/users',
  },
}
