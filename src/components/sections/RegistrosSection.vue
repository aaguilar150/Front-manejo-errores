<script setup>
import { onMounted, ref } from 'vue'
import { registrosRepository } from '@/data/repositories/registrosRepository'
import Pagination from '@/components/Pagination.vue'
import DetailModal from '@/components/DetailModal.vue'

const rows = ref([])
const total = ref(0)
const page = ref(1)
const limit = 10
const loading = ref(false)
const error = ref(null)

const f = ref({ q: '', edad: '', menor: '', moderacion: '', estado: '' })
const detail = ref(null)
const preview = ref(null) // imagen ampliada
const copiedId = ref(null)

const shortId = (id) => (id && id.length > 10 ? `${id.slice(0, 8)}…` : id)
async function copyId(id) {
  try { await navigator.clipboard.writeText(id) } catch { /* ignore */ }
  copiedId.value = id
  setTimeout(() => { if (copiedId.value === id) copiedId.value = null }, 1200)
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await registrosRepository.list({ page: page.value, limit, ...f.value })
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

async function moderar(r, valor) {
  await registrosRepository.moderar(r.id, valor)
  load()
}
async function ocultar(r) {
  if (!confirm(`¿Ocultar a ${r.nombre} ${r.apellido}? (moderación = rechazada, no aparece en búsquedas)`)) return
  await registrosRepository.ocultar(r.id)
  load()
}
async function remove(r) {
  if (!confirm(`¿Eliminar definitivamente a ${r.nombre} ${r.apellido}? Borra la persona y sus fotos.`)) return
  await registrosRepository.remove(r.id)
  load()
}

const modBadge = (v) => (v === 'aprobada' ? 'badge--atendido' : v === 'rechazada' ? 'badge--rechazada' : 'badge--pendiente')

onMounted(load)
</script>

<template>
  <div class="filters">
    <input v-model="f.q" placeholder="Buscar por nombre…" @input="applyFilters" />
    <input v-model="f.edad" type="number" min="0" placeholder="Edad" @input="applyFilters" />
    <select v-model="f.menor" @change="applyFilters">
      <option value="">Todas las edades</option>
      <option value="true">Menores de edad</option>
      <option value="false">Mayores de edad</option>
    </select>
    <select v-model="f.moderacion" @change="applyFilters">
      <option value="">Toda moderación</option>
      <option value="aprobada">Aprobada</option>
      <option value="pendiente">Pendiente</option>
      <option value="rechazada">Rechazada</option>
    </select>
    <select v-model="f.estado" @change="applyFilters">
      <option value="">Todos los estados</option>
      <option value="buscada">Buscada</option>
      <option value="encontrada">Encontrada</option>
    </select>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="loading" class="muted">Cargando…</p>

  <table v-else class="table">
    <thead>
      <tr><th>Foto</th><th>Persona</th><th>Edad</th><th>Ubicación</th><th>Estado</th><th>Moderación</th><th>ID</th><th>Acciones</th></tr>
    </thead>
    <tbody>
      <tr v-for="r in rows" :key="r.id">
        <td>
          <img v-if="r.imagen" :src="r.imagen" class="thumb" alt="foto" @click="preview = r.imagen" />
          <span v-else class="muted">—</span>
        </td>
        <td>{{ r.nombre }} {{ r.apellido }}</td>
        <td>{{ r.edad ?? '—' }} <span v-if="r.edad != null" class="badge" :class="r.esMenor ? 'badge--pendiente' : 'badge--atendido'">{{ r.esMenor ? 'menor' : 'mayor' }}</span></td>
        <td>{{ r.ubicacion }}</td>
        <td>{{ r.estado }}</td>
        <td><span class="badge" :class="modBadge(r.moderacion)">{{ r.moderacion }}</span></td>
        <td>
          <button class="id-chip" :title="`Copiar ID: ${r.id}`" @click="copyId(r.id)">
            {{ copiedId === r.id ? '✓ copiado' : shortId(r.id) }}
          </button>
        </td>
        <td class="actions">
          <button class="icon" title="Ver detalle" @click="detail = r">
            <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button v-if="r.moderacion !== 'aprobada'" class="icon" title="Aprobar" @click="moderar(r, 'aprobada')">
            <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <button v-if="r.moderacion !== 'rechazada'" class="icon" title="Ocultar (rechazar)" @click="ocultar(r)">
            <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M1 1l22 22"/></svg>
          </button>
          <button class="icon icon--danger" title="Eliminar" @click="remove(r)">
            <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </td>
      </tr>
      <tr v-if="!rows.length"><td colspan="8" class="muted center">Sin registros</td></tr>
    </tbody>
  </table>

  <Pagination :page="page" :limit="limit" :total="total" @change="setPage" />

  <DetailModal
    :open="!!detail"
    :title="detail ? `${detail.nombre} ${detail.apellido}` : ''"
    :image="detail?.imagen"
    :fields="detail ? [
      { label: 'ID', value: detail.id },
      { label: 'Edad', value: detail.edad },
      { label: 'Menor', value: detail.esMenor ? 'Sí' : 'No' },
      { label: 'Estado', value: detail.estado },
      { label: 'Moderación', value: detail.moderacion },
      { label: 'Ubicación', value: detail.ubicacion },
      { label: 'Teléfono', value: detail.telefono },
      { label: 'Refugio', value: detail.refugio },
      { label: 'Documento', value: detail.doc },
      { label: 'Fecha', value: detail.fecha },
    ] : []"
    :text="detail?.descripcion"
    @close="detail = null"
  />

  <div v-if="preview" class="modal-backdrop" @click="preview = null">
    <img :src="preview" class="preview-img" alt="vista previa" />
  </div>
</template>
