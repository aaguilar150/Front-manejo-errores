<script setup>
// Modal de detalle genérico: título + imagen + pares label/valor + texto largo.
defineProps({
  title: String,
  image: String,
  fields: { type: Array, default: () => [] }, // [{ label, value }]
  text: String,
  open: Boolean,
})
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal card">
      <header class="modal-head">
        <h2>{{ title }}</h2>
        <button class="ghost" @click="emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <img v-if="image" :src="image" :alt="title" class="modal-img" />
        <div class="modal-info">
          <div class="detail-grid">
            <div v-for="f in fields" :key="f.label">
              <span class="muted">{{ f.label }}</span>
              <p>{{ f.value || '—' }}</p>
            </div>
          </div>
          <div v-if="text" class="desc">
            <span class="muted">Descripción</span>
            <p>{{ text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
