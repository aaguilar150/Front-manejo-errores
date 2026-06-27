<script setup>
import { onMounted, ref } from 'vue'
import { comentariosRepository } from '@/data/repositories/comentariosRepository'
import Pagination from '@/components/Pagination.vue'

const rows = ref([])
const total = ref(0)
const page = ref(1)
const limit = 10
const loading = ref(false)
const error = ref(null)

const f = ref({ desde: '', hasta: '', estado: '' })

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await comentariosRepository.list({ page: page.value, limit, ...f.value })
    rows.value = res.data
    total.value = res.total
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
function applyFilters() { page.value = 1; load() }
function setPage(p) { page.value = p; load() }

const esRevisado = (r) => r.estado === 'revisado' || r.estado === 'resuelto'

async function toggleRevision(c) {
  await comentariosRepository.setEstado(c.id, esRevisado(c) ? 'pendiente' : 'revisado')
  load()
}
// El back no borra reportes: "descartar" = estado 'descartado'.
async function descartar(c) {
  if (!confirm(`¿Descartar el reporte ${c.id}?`)) return
  await comentariosRepository.setEstado(c.id, 'descartado')
  load()
}

const estadoBadge = (e) => (e === 'revisado' || e === 'resuelto' ? 'badge--atendido' : e === 'descartado' ? 'badge--rechazada' : 'badge--pendiente')

onMounted(load)
</script>

<template>
  <div class="filters">
    <label class="inline">Desde <input v-model="f.desde" type="date" @change="applyFilters" /></label>
    <label class="inline">Hasta <input v-model="f.hasta" type="date" @change="applyFilters" /></label>
    <select v-model="f.estado" @change="applyFilters">
      <option value="">Todos los estados</option>
      <option value="pendiente">Pendiente</option>
      <option value="revisado">Revisado</option>
      <option value="resuelto">Resuelto</option>
      <option value="descartado">Descartado</option>
    </select>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="loading" class="muted">Cargando…</p>

  <table v-else class="table">
    <thead>
      <tr><th>ID</th><th>Descripción</th><th>Contacto</th><th>URL</th><th>Creado</th><th>Estado</th><th>Acciones</th></tr>
    </thead>
    <tbody>
      <tr v-for="c in rows" :key="c.id">
        <td>{{ c.id }}</td>
        <td>{{ c.descripcion }}</td>
        <td>{{ c.contacto }}</td>
        <td>{{ c.url }}</td>
        <td>{{ c.fechaCreacion }}</td>
        <td><span class="badge" :class="estadoBadge(c.estado)">{{ c.estado }}</span></td>
        <td class="actions">
          <button class="icon" :title="esRevisado(c) ? 'Marcar pendiente' : 'Marcar revisado'" @click="toggleRevision(c)">
            <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <button v-if="c.estado !== 'descartado'" class="icon icon--danger" title="Descartar" @click="descartar(c)">
            <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </td>
      </tr>
      <tr v-if="!rows.length"><td colspan="7" class="muted center">Sin reportes</td></tr>
    </tbody>
  </table>

  <Pagination :page="page" :limit="limit" :total="total" @change="setPage" />
</template>
