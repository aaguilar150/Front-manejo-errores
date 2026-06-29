import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('@/views/AppLayout.vue'),
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'reportes', redirect: { name: 'registros' } },
      { path: 'reportes/registros', name: 'registros', component: () => import('@/views/RegistrosView.vue') },
      { path: 'reportes/inadecuadas', name: 'inadecuadas', component: () => import('@/views/InadecuadasView.vue') },
      { path: 'reportes/comentarios', name: 'comentarios', component: () => import('@/views/ComentariosView.vue') },
      { path: 'reportes/testimonios', name: 'testimonios', component: () => import('@/views/TestimoniosView.vue') },
      { path: 'busqueda', name: 'busqueda', component: () => import('@/views/BusquedaView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) return { name: 'login' }
  if (to.meta.public && auth.isAuthenticated) return { name: 'dashboard' }
  if (to.meta.permission && !auth.can(to.meta.permission)) return { name: 'dashboard' }
  return true
})

export default router
