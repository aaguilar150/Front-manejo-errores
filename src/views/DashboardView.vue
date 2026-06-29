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
        <StatCard label="Total registros" :value="s.total" />
        <StatCard label="Buscadas" :value="s.buscadas" />
        <StatCard label="Encontradas" :value="s.encontradas" tone="ok" />
        <StatCard label="Menores de edad" :value="s.menores" tone="warn" />
        <StatCard label="Ocultas (rechazadas)" :value="s.ocultas" />
        <StatCard label="Pendientes de moderación" :value="s.pendientesModeracion" tone="warn" />
      </div>

      <h2 class="section-title">Publicaciones inadecuadas</h2>
      <div class="stat-grid">
        <StatCard label="Total reportes" :value="s.reportesPublicaciones" />
        <StatCard label="Pendientes" :value="s.reportesPublicacionesPendientes" tone="warn" />
      </div>

      <h2 class="section-title">Reportes de fallas (panel de errores)</h2>
      <div class="stat-grid">
        <StatCard label="Total fallas" :value="s.reportesFallas" />
        <StatCard label="Pendientes" :value="s.reportesFallasPendientes" tone="warn" />
      </div>

      <h2 class="section-title">Testimonios</h2>
      <div class="stat-grid">
        <StatCard label="Pendientes de revisión" :value="s.testimoniosPendientes" tone="warn" />
      </div>
    </template>
  </section>
</template>
