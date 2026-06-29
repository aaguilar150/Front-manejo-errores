<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRegistrosStore } from '@/stores/registrosStore'
import { debounce } from '@/core/debounce'
import Pagination from '@/components/Pagination.vue'
import PageSize from '@/components/PageSize.vue'
import DetailModal from '@/components/DetailModal.vue'

const store = useRegistrosStore()
const { rows, total, page, limite, loading, error, filtros, ficha, fichaLoading } = storeToRefs(store)

// Estado puramente de UI (no va al store).
const detail = ref(null)
const preview = ref(null)
const copiedId = ref(null)

const applyDebounced = debounce(() => store.applyFiltros())

function openDetail(r) { detail.value = r; store.fetchFicha(r.id) }
function closeDetail() { detail.value = null; store.clearFicha() }

const shortId = (id) => (id && id.length > 10 ? `${id.slice(0, 8)}…` : id)
async function copyId(id) {
  try { await navigator.clipboard.writeText(id) } catch { /* ignore */ }
  copiedId.value = id
  setTimeout(() => { if (copiedId.value === id) copiedId.value = null }, 1200)
}

async function ocultar(r) {
  if (!confirm(`¿Ocultar a ${r.nombre} ${r.apellido}? (moderación = rechazada, no aparece en búsquedas)`)) return
  store.ocultar(r.id)
}
async function remove(r) {
  if (!confirm(`¿Eliminar definitivamente a ${r.nombre} ${r.apellido}? Borra la persona y sus fotos.`)) return
  store.remove(r.id)
}

onMounted(store.load)
</script>

<template>
  <section>
    <h1>Registros</h1>

    <div class="filters">
      <input v-model="filtros.personId" placeholder="person_id…" @input="applyDebounced" />
      <input v-model="filtros.nombre" placeholder="Nombre…" @input="applyDebounced" />
      <input v-model="filtros.apellido" placeholder="Apellido…" @input="applyDebounced" />
      <input v-model="filtros.cedula" placeholder="Cédula…" @input="applyDebounced" />
      <input v-model="filtros.docNumero" placeholder="Documento…" @input="applyDebounced" />
      <label class="inline">
        <input type="checkbox" v-model="filtros.esMenor" true-value="true" false-value="false" @change="store.applyFiltros()" />
        Menor de edad
      </label>
      <select v-model="filtros.estado" @change="store.applyFiltros()">
        <option value="">Todos los estados</option>
        <option value="buscada">Buscada</option>
        <option value="encontrada">Encontrada</option>
      </select>
      <PageSize :limite="limite" @change="store.setLimite" />
      <button class="ghost reload" title="Recargar" :disabled="loading" @click="store.load()">↻</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Cargando…</p>

    <table v-else class="table">
      <thead>
        <tr><th>Foto</th><th>Persona</th><th>Edad</th><th>Ubicación</th><th>Estado</th><th>Documento</th><th>ID</th><th>Acciones</th></tr>
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
          <td>{{ r.doc || '—' }}</td>
          <td>
            <button class="id-chip" :title="`Copiar ID: ${r.id}`" @click="copyId(r.id)">
              {{ copiedId === r.id ? '✓ copiado' : shortId(r.id) }}
            </button>
          </td>
          <td class="actions">
            <button class="icon" title="Ver ficha" @click="openDetail(r)">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button v-if="r.moderacion !== 'aprobada'" class="icon" title="Aprobar" @click="store.moderar(r.id, 'aprobada')">
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

    <Pagination :page="page" :limite="limite" :total="total" @change="store.setPage" />

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
      @close="closeDetail"
    >
      <div class="ficha">
        <p v-if="fichaLoading" class="muted">Cargando ficha…</p>
        <template v-else-if="ficha">
          <div class="ficha-block">
            <span class="muted">Familiares buscando (por cédula {{ ficha.docNumero || '—' }})</span>
            <ul v-if="ficha.familiares.length" class="ficha-list">
              <li v-for="fam in ficha.familiares" :key="fam.id">
                <strong>{{ fam.nombre }}</strong> · {{ fam.telefono || 's/ teléfono' }}
                <span class="badge badge--atendido">{{ fam.coincidencia != null ? `${fam.coincidencia}%` : '' }} {{ fam.confianza }}</span>
              </li>
            </ul>
            <p v-else class="muted">Sin familiares registrados.</p>
          </div>

          <div class="ficha-block">
            <span class="muted">Historial de avistamientos ({{ ficha.totalEventos }})</span>
            <ul v-if="ficha.eventos.length" class="ficha-list">
              <li v-for="ev in ficha.eventos" :key="ev.id">
                <strong>{{ ev.fecha }}</strong> · {{ ev.ubicacion }} · {{ ev.refugio || 's/ refugio' }}
                <br /><span class="muted">{{ ev.encontradoPor }} ({{ ev.telefonoResponsable }}) — {{ ev.nota }}</span>
              </li>
            </ul>
            <p v-else class="muted">Sin avistamientos registrados.</p>
          </div>
        </template>
      </div>
    </DetailModal>

    <div v-if="preview" class="modal-backdrop" @click="preview = null">
      <img :src="preview" class="preview-img" alt="vista previa" />
    </div>
  </section>
</template>
