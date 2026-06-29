<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">Reportes</div>
      <nav>
        <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
        <router-link :to="{ name: 'busqueda' }">Búsqueda por foto</router-link>
        <router-link :to="{ name: 'registros' }">Registros</router-link>
        <router-link :to="{ name: 'inadecuadas' }">Publicaciones inadecuadas</router-link>
        <router-link :to="{ name: 'comentarios' }">Reportes de fallas</router-link>
        <router-link :to="{ name: 'testimonios' }">Testimonios</router-link>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <span class="muted">{{ auth.user?.name }} · <strong>{{ auth.role }}</strong></span>
        <button class="ghost" @click="logout">Salir</button>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>
