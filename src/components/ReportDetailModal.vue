<script setup>
defineProps({ report: { type: Object, default: null } })
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="report" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal card">
      <header class="modal-head">
        <h2>Reporte #{{ report.id }}</h2>
        <button class="ghost" @click="emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <img v-if="report.imagen" :src="report.imagen" :alt="`${report.nombre} ${report.apellido}`" class="modal-img" />

        <div class="modal-info">
          <div class="detail-grid">
            <div><span class="muted">Publicación</span><p>{{ report.publicacionId }}</p></div>
            <div><span class="muted">Nombre</span><p>{{ report.nombre }}</p></div>
            <div><span class="muted">Apellido</span><p>{{ report.apellido }}</p></div>
            <div><span class="muted">Ubicación</span><p>{{ report.ubicacion }}</p></div>
            <div><span class="muted">Motivo</span><p>{{ report.motivo }}</p></div>
            <div><span class="muted">Usuario</span><p>{{ report.usuario }}</p></div>
            <div><span class="muted">Fecha</span><p>{{ report.fecha }}</p></div>
            <div>
              <span class="muted">Estado</span>
              <p><span class="badge" :class="`badge--${report.estado}`">{{ report.estado }}</span></p>
            </div>
          </div>

          <div v-if="report.descripcion" class="desc">
            <span class="muted">Descripción</span>
            <p>{{ report.descripcion }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
