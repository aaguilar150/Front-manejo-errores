<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useInadecuadasStore } from '@/stores/inadecuadasStore'
import { debounce } from '@/core/debounce'
import Pagination from '@/components/Pagination.vue'
import PageSize from '@/components/PageSize.vue'
import DetailModal from '@/components/DetailModal.vue'

const store = useInadecuadasStore()
const { rows, total, page, limite, loading, error, filtros } = storeToRefs(store)

const detail = ref(null)

const applyDebounced = debounce(() => store.applyFiltros())

const esRevisado = (r) => r.estado === 'revisado' || r.estado === 'resuelto'

function toggleRevision(r) {
  store.setEstado(r.id, esRevisado(r) ? 'pendiente' : 'revisado')
}
async function ocultar(r) {
  if (!r.personId) return alert('Reporte sin publicación asociada.')
  if (!confirm(`¿Ocultar la publicación de ${r.pubNombre}? (moderación = rechazada)`)) return
  store.ocultarPublicacion(r.personId)
}
async function remove(r) {
  if (!r.personId) return alert('Reporte sin publicación asociada.')
  if (!confirm(`¿Eliminar definitivamente la publicación de ${r.pubNombre}?`)) return
  store.eliminarPublicacion(r.personId)
}

const estadoBadge = (e) => (e === 'revisado' || e === 'resuelto' ? 'badge--atendido' : e === 'descartado' ? 'badge--rechazada' : 'badge--pendiente')

onMounted(store.load)
</script>

<template>
  <section>
    <h1>Publicaciones inadecuadas</h1>

    <div class="filters">
      <input v-model="filtros.q" placeholder="Buscar por nombre de la publicación…" @input="applyDebounced" />
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
        <tr><th>Reporte</th><th>Publicación (person_id)</th><th>Nombre</th><th>Moderación pub.</th><th>Estado reporte</th><th>Fecha</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.personId || '—' }}</td>
          <td>{{ r.pubNombre || '—' }}</td>
          <td><span v-if="r.pubModeracion" class="badge" :class="r.pubModeracion === 'aprobada' ? 'badge--atendido' : r.pubModeracion === 'rechazada' ? 'badge--rechazada' : 'badge--pendiente'">{{ r.pubModeracion }}</span></td>
          <td><span class="badge" :class="estadoBadge(r.estado)">{{ r.estado }}</span></td>
          <td>{{ r.fechaCreacion }}</td>
          <td class="actions">
            <button class="icon" title="Ver detalle" @click="detail = r">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="icon" :title="esRevisado(r) ? 'Marcar pendiente' : 'Marcar revisado'" @click="toggleRevision(r)">
              <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
            </button>
            <button class="icon" title="Ocultar publicación (rechazar)" @click="ocultar(r)">
              <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M1 1l22 22"/></svg>
            </button>
            <button class="icon icon--danger" title="Eliminar publicación" @click="remove(r)">
              <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </td>
        </tr>
        <tr v-if="!rows.length"><td colspan="7" class="muted center">Sin reportes</td></tr>
      </tbody>
    </table>

    <Pagination :page="page" :limite="limite" :total="total" @change="store.setPage" />

    <DetailModal
      :open="!!detail"
      :title="detail ? `Reporte ${detail.id}` : ''"
      :image="detail?.pubImagen"
      :fields="detail ? [
        { label: 'Tipo', value: detail.tipo },
        { label: 'Estado reporte', value: detail.estado },
        { label: 'Publicación', value: detail.personId },
        { label: 'Nombre pub.', value: detail.pubNombre },
        { label: 'Estado pub.', value: detail.pubEstado },
        { label: 'Moderación pub.', value: detail.pubModeracion },
        { label: 'Contacto', value: detail.contacto },
        { label: 'Fecha', value: detail.fechaCreacion },
      ] : []"
      :text="detail?.descripcion"
      @close="detail = null"
    />
  </section>
</template>
