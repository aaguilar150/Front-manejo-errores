<script setup>
defineProps({
  label: String,
  value: [Number, String],
  tone: { type: String, default: 'default' },
})
</script>

<template>
  <div class="card stat" :class="`stat--${tone}`">
    <span class="stat-value">{{ value }}</span>
    <span class="stat-label muted">{{ label }}</span>
  </div>
</template>
