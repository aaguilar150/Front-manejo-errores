<script setup>
import { ref } from 'vue'
import { usersRepository } from '@/data/repositories/usersRepository'

const email = ref('')
const password = ref('')
const role = ref('revisor')
const msg = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  msg.value = ''
  error.value = ''
  loading.value = true
  try {
    const u = await usersRepository.create(email.value, password.value, role.value)
    msg.value = `Usuario ${u.email} creado como ${u.role}.`
    email.value = ''
    password.value = ''
    role.value = 'revisor'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section>
    <h1>Usuarios</h1>
    <p class="muted">Da de alta nuevos usuarios del panel.</p>

    <form class="card form" @submit.prevent="submit">
      <label>Correo</label>
      <input v-model="email" type="email" required placeholder="nuevo@demo.com" />

      <label>Contraseña</label>
      <input v-model="password" type="password" required minlength="6" />

      <label>Rol</label>
      <select v-model="role">
        <option value="admin">Administrador</option>
        <option value="gestor">Gestor</option>
        <option value="revisor">Revisor</option>
      </select>

      <p v-if="msg" class="ok-text">{{ msg }}</p>
      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando…' : 'Crear usuario' }}
      </button>
    </form>
  </section>
</template>
