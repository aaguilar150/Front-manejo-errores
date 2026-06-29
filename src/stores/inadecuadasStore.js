import { defineStore } from 'pinia'
import { reportesRepository } from '@/data/repositories/reportesRepository'

// Sección B — publicaciones inadecuadas (reportes tipo 'publicacion').
export const useInadecuadasStore = defineStore('inadecuadas', {
  state: () => ({
    rows: [],
    total: 0,
    page: 1,
    limite: 10,
    loading: false,
    error: null,
    filtros: { q: '', estado: '' },
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const res = await reportesRepository.list({ page: this.page, limite: this.limite, ...this.filtros })
        this.rows = res.data
        this.total = res.total
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    applyFiltros() { this.page = 1; return this.load() },
    setPage(p) { this.page = p; return this.load() },
    setLimite(n) { this.limite = n; this.page = 1; return this.load() },

    async setEstado(id, valor) { await reportesRepository.setEstado(id, valor); return this.load() },
    async ocultarPublicacion(personId) { await reportesRepository.ocultarPublicacion(personId); return this.load() },
    async eliminarPublicacion(personId) { await reportesRepository.eliminarPublicacion(personId); return this.load() },
  },
})
