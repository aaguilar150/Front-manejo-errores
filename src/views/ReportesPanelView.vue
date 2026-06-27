<script setup>
import { ref } from 'vue'
import RegistrosSection from '@/components/sections/RegistrosSection.vue'
import InadecuadasSection from '@/components/sections/InadecuadasSection.vue'
import ComentariosSection from '@/components/sections/ComentariosSection.vue'

const tabs = [
  { key: 'registros', label: 'Registros', comp: RegistrosSection },
  { key: 'inadecuadas', label: 'Publicaciones inadecuadas', comp: InadecuadasSection },
  { key: 'comentarios', label: 'Reportes de fallas', comp: ComentariosSection },
]
const active = ref('registros')
</script>

<template>
  <section>
    <h1>Panel de reportes</h1>
    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="ghost"
        :class="{ 'tab--active': active === t.key }"
        @click="active = t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <component :is="tabs.find((t) => t.key === active).comp" :key="active" />
  </section>
</template>
