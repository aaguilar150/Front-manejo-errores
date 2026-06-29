import { defineStore } from 'pinia'
import { testimoniosRepository } from '@/data/repositories/testimoniosRepository'

// Sección D — testimonios. Estado de tabla + acciones de moderación.
export const useTestimoniosStore = defineStore('testimonios', {
  state: () => ({
    rows: [],
    total: 0,
    page: 1,
    limite: 10,
    loading: false,
    error: null,
    filtros: { estado: '' },
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const res = await testimoniosRepository.list({ page: this.page, limite: this.limite, ...this.filtros })
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

    async setEstado(id, valor) { await testimoniosRepository.setEstado(id, valor); return this.load() },
    async remove(id) { await testimoniosRepository.remove(id); return this.load() },
  },
})
