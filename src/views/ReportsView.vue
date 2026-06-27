<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useReportsStore } from '@/stores/reportsStore'
import { useAuthStore } from '@/stores/authStore'
import ReportsTable from '@/components/ReportsTable.vue'
import ReportDetailModal from '@/components/ReportDetailModal.vue'

const store = useReportsStore()
const auth = useAuthStore()
const { items, loading, error } = storeToRefs(store)

const selected = ref(null)

onMounted(() => store.fetchAll())

// ponytail: "actualizar" = alternar estado pendiente/atendido. Si necesitas
// editar más campos, cambia este toggle por un modal que llame store.update(id, {...}).
function toggle(r) {
  store.update(r.id, { estado: r.estado === 'atendido' ? 'pendiente' : 'atendido' })
}

function remove(r) {
  if (confirm(`¿Eliminar el reporte #${r.id}?`)) store.remove(r.id)
}
</script>

<template>
  <section>
    <h1>Reportes</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Cargando…</p>
    <ReportsTable
      v-else
      :items="items"
      :can-write="auth.can('reports:write')"
      :can-delete="auth.can('reports:delete')"
      @detail="selected = $event"
      @toggle="toggle"
      @delete="remove"
    />

    <ReportDetailModal :report="selected" @close="selected = null" />
  </section>
</template>
