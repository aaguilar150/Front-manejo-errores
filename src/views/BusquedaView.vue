<script setup>
import { ref, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBusquedaStore } from '@/stores/busquedaStore'
import DetailModal from '@/components/DetailModal.vue'

const store = useBusquedaStore()
const { results, loading, error, buscado, limite, estado } = storeToRefs(store)

const file = ref(null)
const previewUrl = ref('')
const copiedId = ref(null)
const detail = ref(null) // registro abierto en modal
const preview = ref(null) // imagen ampliada

const shortId = (id) => (id && id.length > 10 ? `${id.slice(0, 8)}…` : id)
async function copyId(id) {
  try { await navigator.clipboard.writeText(id) } catch { /* ignore */ }
  copiedId.value = id
  setTimeout(() => { if (copiedId.value === id) copiedId.value = null }, 1200)
}

function onFile(e) {
  const f = e.target.files?.[0] || null
  file.value = f
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = f ? URL.createObjectURL(f) : ''
}
function buscar() { store.buscar(file.value) }
async function eliminar(r) {
  if (!confirm(`¿Eliminar definitivamente a ${r.nombre} ${r.apellido}? Borra la persona y sus fotos.`)) return
  store.eliminar(r.id)
}

onUnmounted(() => { if (previewUrl.value) URL.revokeObjectURL(previewUrl.value) })

const confianzaBadge = (c) => (c === 'alta' ? 'badge--atendido' : c === 'baja' ? 'badge--rechazada' : 'badge--pendiente')
</script>

<template>
  <section>
    <h1>Búsqueda por foto</h1>
    <p class="muted">Compará una foto contra toda la base y mirá las coincidencias más probables.</p>

    <div class="filters">
      <input type="file" accept="image/*" @change="onFile" />
      <label class="inline">Resultados
        <input v-model.number="limite" type="number" min="1" max="50" style="width:5rem" />
      </label>
      <select v-model="estado">
        <option value="">Todos los estados</option>
        <option value="buscada">Buscada</option>
        <option value="encontrada">Encontrada</option>
      </select>
      <button :disabled="!file || loading" @click="buscar">Buscar</button>
    </div>

    <div v-if="previewUrl" class="busqueda-preview">
      <img :src="previewUrl" alt="foto a buscar" class="thumb thumb--lg" />
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Buscando coincidencias…</p>

    <template v-else-if="buscado">
      <table class="table">
        <thead>
          <tr><th>Foto</th><th>person_id</th><th>Persona</th><th>Edad</th><th>Estado</th><th>Coincidencia</th><th>Confianza</th><th>Ubicación</th><th>Teléfono</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in results" :key="r.id">
            <td>
              <img v-if="r.imagen" :src="r.imagen" class="thumb" alt="foto" @click="preview = r.imagen" />
              <span v-else class="muted">—</span>
            </td>
            <td>
              <button class="id-chip" :title="`Copiar ID: ${r.id}`" @click="copyId(r.id)">
                {{ copiedId === r.id ? '✓ copiado' : shortId(r.id) }}
              </button>
            </td>
            <td>{{ r.nombre }} {{ r.apellido }}</td>
            <td>{{ r.edad || '—' }} <span v-if="r.esMenor" class="badge badge--pendiente">menor</span></td>
            <td>{{ r.estado }}</td>
            <td>{{ r.coincidencia != null ? `${r.coincidencia}%` : '—' }}</td>
            <td><span v-if="r.confianza" class="badge" :class="confianzaBadge(r.confianza)">{{ r.confianza }}</span></td>
            <td>{{ r.ubicacion || '—' }}</td>
            <td>{{ r.telefono || '—' }}</td>
            <td class="actions">
              <button class="icon" title="Ver detalle" @click="detail = r">
                <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="icon icon--danger" title="Eliminar" @click="eliminar(r)">
                <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </td>
          </tr>
          <tr v-if="!results.length"><td colspan="10" class="muted center">Sin coincidencias</td></tr>
        </tbody>
      </table>
    </template>

    <DetailModal
      :open="!!detail"
      :title="detail ? `${detail.nombre} ${detail.apellido}` : ''"
      :image="detail?.imagen"
      :fields="detail ? [
        { label: 'person_id', value: detail.id },
        { label: 'Coincidencia', value: detail.coincidencia != null ? `${detail.coincidencia}%` : '—' },
        { label: 'Confianza', value: detail.confianza },
        { label: 'Distancia', value: detail.distancia },
        { label: 'Edad', value: detail.edad },
        { label: 'Menor', value: detail.esMenor ? 'Sí' : 'No' },
        { label: 'Estado', value: detail.estado },
        { label: 'Ubicación', value: detail.ubicacion },
        { label: 'Refugio', value: detail.refugio },
        { label: 'Teléfono', value: detail.telefono },
        { label: 'Encontrado por', value: detail.encontradoPor },
      ] : []"
      :text="detail?.descripcion"
      @close="detail = null"
    />

    <div v-if="preview" class="modal-backdrop" @click="preview = null">
      <img :src="preview" class="preview-img" alt="vista previa" />
    </div>
  </section>
</template>
