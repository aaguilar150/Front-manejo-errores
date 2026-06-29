import { defineStore } from 'pinia'
import { busquedaRepository } from '@/data/repositories/busquedaRepository'

// Búsqueda por foto contra toda la base (POST /buscar).
export const useBusquedaStore = defineStore('busqueda', {
  state: () => ({
    results: [],
    loading: false,
    error: null,
    buscado: false, // ya se hizo al menos una búsqueda
    limite: 10,
    estado: '',
  }),
  actions: {
    async buscar(file) {
      if (!file) { this.error = 'Seleccioná una foto.'; return }
      this.loading = true
      this.error = null
      try {
        this.results = await busquedaRepository.buscar({ file, limite: this.limite, estado: this.estado })
        this.buscado = true
      } catch (e) {
        this.error = e.message
        this.results = []
      } finally {
        this.loading = false
      }
    },
    async eliminar(id) {
      await busquedaRepository.eliminar(id)
      this.results = this.results.filter((r) => r.id !== id)
    },
    reset() { this.results = []; this.error = null; this.buscado = false },
  },
})
