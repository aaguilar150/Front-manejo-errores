<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTestimoniosStore } from '@/stores/testimoniosStore'
import Pagination from '@/components/Pagination.vue'
import PageSize from '@/components/PageSize.vue'
import DetailModal from '@/components/DetailModal.vue'

const store = useTestimoniosStore()
const { rows, total, page, limite, loading, error, filtros } = storeToRefs(store)

const detail = ref(null)

async function remove(t) {
  if (!confirm(`¿Eliminar el testimonio ${t.id}? Borra también el archivo subido.`)) return
  store.remove(t.id)
}

const kb = (b) => (b ? `${Math.round(b / 1024)} KB` : '—')
const estadoBadge = (e) => (e === 'aprobada' ? 'badge--atendido' : e === 'rechazada' ? 'badge--rechazada' : 'badge--pendiente')
</script>

<template>
  <section>
    <h1>Testimonios</h1>

    <div class="filters">
      <select v-model="filtros.estado" @change="store.applyFiltros()">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="aprobada">Aprobada</option>
        <option value="rechazada">Rechazada</option>
      </select>
      <PageSize :limite="limite" @change="store.setLimite" />
      <button class="ghost reload" title="Recargar" :disabled="loading" @click="store.load()">↻</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Cargando…</p>

    <table v-else class="table">
      <thead>
        <tr><th>Archivo</th><th>Publicación</th><th>Testigo</th><th>Contacto</th><th>Tipo</th><th>Creado</th><th>Estado</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr v-for="t in rows" :key="t.id">
          <td>
            <img v-if="t.pubImagen" :src="t.pubImagen" class="thumb" alt="pub" />
            <span v-else class="muted">—</span>
          </td>
          <td>{{ t.pubNombre || '—' }}</td>
          <td>{{ t.nombreTestigo || '—' }}</td>
          <td>{{ t.contactoTestigo || '—' }}</td>
          <td>{{ t.tipo || '—' }}</td>
          <td>{{ t.fecha }}</td>
          <td><span class="badge" :class="estadoBadge(t.estado)">{{ t.estado }}</span></td>
          <td class="actions">
            <button class="icon" title="Ver detalle" @click="detail = t">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button v-if="t.estado !== 'aprobada'" class="icon" title="Aprobar" @click="store.setEstado(t.id, 'aprobada')">
              <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
            </button>
            <button v-if="t.estado !== 'rechazada'" class="icon" title="Rechazar" @click="store.setEstado(t.id, 'rechazada')">
              <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <button class="icon icon--danger" title="Eliminar" @click="remove(t)">
              <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </td>
        </tr>
        <tr v-if="!rows.length"><td colspan="8" class="muted center">Sin testimonios</td></tr>
      </tbody>
    </table>

    <Pagination :page="page" :limite="limite" :total="total" @change="store.setPage" />

    <DetailModal
      :open="!!detail"
      :title="detail ? `Testimonio ${detail.id}` : ''"
      :image="detail?.pubImagen"
      :fields="detail ? [
        { label: 'Publicación', value: detail.pubNombre },
        { label: 'Estado pub.', value: detail.pubEstado },
        { label: 'person_id', value: detail.personId },
        { label: 'Tipo', value: detail.tipo },
        { label: 'Tamaño', value: kb(detail.bytes) },
        { label: 'Testigo', value: detail.nombreTestigo },
        { label: 'Contacto', value: detail.contactoTestigo },
        { label: 'Estado', value: detail.estado },
        { label: 'Fecha', value: detail.fecha },
      ] : []"
      :text="detail?.mensaje"
      @close="detail = null"
    >
      <p v-if="detail?.archivoUrl" class="desc">
        <a :href="detail.archivoUrl" target="_blank" rel="noopener">Abrir archivo adjunto ↗</a>
      </p>
    </DetailModal>
  </section>
</template>
