<script setup>
import { onMounted, ref } from 'vue'
import { panelRepository } from '@/data/repositories/panelRepository'
import StatCard from '@/components/StatCard.vue'

const s = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    s.value = await panelRepository.stats()
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <section>
    <h1>Dashboard</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="!s" class="muted">Cargando…</p>

    <template v-else>
      <h2 class="section-title">Registros (personas)</h2>
      <div class="stat-grid">
        <StatCard label="Total registros" :value="s.registros.total" />
        <StatCard label="Menores de edad" :value="s.registros.menores" tone="warn" />
        <StatCard label="Ocultas (rechazadas)" :value="s.registros.rechazadas" />
      </div>

      <h2 class="section-title">Publicaciones inadecuadas</h2>
      <div class="stat-grid">
        <StatCard label="Total reportes" :value="s.inadecuadas.total" />
        <StatCard label="Revisados / resueltos" :value="s.inadecuadas.resueltos" tone="ok" />
        <StatCard label="Pendientes" :value="s.inadecuadas.pendientes" tone="warn" />
      </div>

      <h2 class="section-title">Reportes de fallas (panel de errores)</h2>
      <div class="stat-grid">
        <StatCard label="Total fallas" :value="s.fallas.total" />
        <StatCard label="Pendientes" :value="s.fallas.pendientes" tone="warn" />
        <StatCard label="Descartados" :value="s.fallas.descartados" />
      </div>
    </template>
  </section>
</template>
