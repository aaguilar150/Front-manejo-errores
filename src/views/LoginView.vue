<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <form class="card login-card" @submit.prevent="submit">
      <h1>Panel de Reportes</h1>
      <p class="muted">Inicia sesión para continuar</p>

      <label>Correo</label>
      <input v-model="email" type="email" required placeholder="admin@demo.com" />

      <label>Contraseña</label>
      <input v-model="password" type="password" required placeholder="123456" />

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </button>

      <p class="hint muted">
        Demo: admin@demo.com / gestor@demo.com / revisor@demo.com — pass 123456
      </p>
    </form>
  </div>
</template>
