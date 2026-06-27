<script setup>
import { computed } from 'vue'
const props = defineProps({ page: Number, limit: Number, total: Number })
const emit = defineEmits(['change'])
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
</script>

<template>
  <div class="pager" v-if="total">
    <button class="ghost" :disabled="page <= 1" @click="emit('change', page - 1)">‹</button>
    <span class="muted">Página {{ page }} / {{ pages }} · {{ total }} registros</span>
    <button class="ghost" :disabled="page >= pages" @click="emit('change', page + 1)">›</button>
  </div>
</template>
