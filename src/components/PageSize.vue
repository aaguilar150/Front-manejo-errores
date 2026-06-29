<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ limite: { type: Number, default: 10 } })
const emit = defineEmits(['change'])

const PRESETS = [10, 50, 100]
const custom = ref(!PRESETS.includes(props.limite))
watch(() => props.limite, (v) => { if (PRESETS.includes(v)) custom.value = false })

function onSelect(e) {
  const v = e.target.value
  if (v === 'custom') { custom.value = true; return }
  custom.value = false
  emit('change', Number(v))
}
function onCustom(e) {
  emit('change', Math.max(1, Number(e.target.value) || 1))
}
</script>

<template>
  <label class="inline">Ver
    <select :value="custom ? 'custom' : limite" @change="onSelect">
      <option v-for="n in PRESETS" :key="n" :value="n">{{ n }}</option>
      <option value="custom">Personalizado</option>
    </select>
  </label>
  <input v-if="custom" type="number" min="1" :value="limite" placeholder="N°" style="width: 90px" @change="onCustom" />
</template>
