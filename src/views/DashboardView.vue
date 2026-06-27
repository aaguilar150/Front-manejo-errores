<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useReportsStore } from '@/stores/reportsStore'
import StatCard from '@/components/StatCard.vue'

const store = useReportsStore()
const { stats } = storeToRefs(store)

onMounted(() => store.fetchStats())
</script>

<template>
  <section>
    <h1>Dashboard</h1>
    <div class="stat-grid">
      <StatCard label="Reportes recibidos" :value="stats.total" tone="default" />
      <StatCard label="Reportes atendidos" :value="stats.atendidos" tone="ok" />
      <StatCard label="Pendientes por atender" :value="stats.pendientes" tone="warn" />
    </div>
  </section>
</template>
