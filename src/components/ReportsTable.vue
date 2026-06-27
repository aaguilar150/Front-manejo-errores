<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  canWrite: Boolean,
  canDelete: Boolean,
})
const emit = defineEmits(['detail', 'toggle', 'delete'])
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Persona</th>
        <th>Ubicación</th>
        <th>Motivo</th>
        <th>Usuario</th>
        <th>Fecha</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in items" :key="r.id">
        <td>{{ r.id }}</td>
        <td>{{ r.nombre }} {{ r.apellido }}</td>
        <td>{{ r.ubicacion }}</td>
        <td>{{ r.motivo }}</td>
        <td>{{ r.usuario }}</td>
        <td>{{ r.fecha }}</td>
        <td>
          <span class="badge" :class="`badge--${r.estado}`">{{ r.estado }}</span>
        </td>
        <td class="actions">
          <button class="icon" title="Ver detalle" @click="emit('detail', r)">
            <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button
            v-if="canWrite"
            class="icon"
            :title="r.estado === 'atendido' ? 'Reabrir' : 'Marcar atendido'"
            @click="emit('toggle', r)"
          >
            <svg v-if="r.estado === 'atendido'" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.5 9a9 9 0 1 1-1 6"/></svg>
            <svg v-else viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <button v-if="canDelete" class="icon icon--danger" title="Eliminar" @click="emit('delete', r)">
            <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </td>
      </tr>
      <tr v-if="!items.length">
        <td :colspan="8" class="muted center">Sin reportes</td>
      </tr>
    </tbody>
  </table>
</template>
