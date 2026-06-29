<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useComentariosStore } from '@/stores/comentariosStore'
import Pagination from '@/components/Pagination.vue'
import PageSize from '@/components/PageSize.vue'

const store = useComentariosStore()
const { rows, total, page, limite, loading, error, filtros } = storeToRefs(store)

const esRevisado = (c) => c.estado === 'revisado' || c.estado === 'resuelto'

function toggleRevision(c) {
  store.setEstado(c.id, esRevisado(c) ? 'pendiente' : 'revisado')
}
// El back no borra reportes: "descartar" = estado 'descartado'.
async function descartar(c) {
  if (!confirm(`¿Descartar el reporte ${c.id}?`)) return
  store.setEstado(c.id, 'descartado')
}

const estadoBadge = (e) => (e === 'revisado' || e === 'resuelto' ? 'badge--atendido' : e === 'descartado' ? 'badge--rechazada' : 'badge--pendiente')

onMounted(store.load)
</script>

<template>
  <section>
    <h1>Reportes de fallas</h1>

    <div class="filters">
      <label class="inline">Desde <input v-model="filtros.desde" type="date" @change="store.applyFiltros()" /></label>
      <label class="inline">Hasta <input v-model="filtros.hasta" type="date" @change="store.applyFiltros()" /></label>
      <select v-model="filtros.estado" @change="store.applyFiltros()">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="revisado">Revisado</option>
        <option value="resuelto">Resuelto</option>
        <option value="descartado">Descartado</option>
      </select>
      <PageSize :limite="limite" @change="store.setLimite" />
      <button class="ghost reload" title="Recargar" :disabled="loading" @click="store.load()">↻</button>
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

    <Pagination :page="page" :limite="limite" :total="total" @change="store.setPage" />
  </section>
</template>
