import { defineStore } from 'pinia'
import { comentariosRepository } from '@/data/repositories/comentariosRepository'

// Sección C — reportes de fallas (reportes tipo 'falla').
export const useComentariosStore = defineStore('comentarios', {
  state: () => ({
    rows: [],
    total: 0,
    page: 1,
    limite: 10,
    loading: false,
    error: null,
    filtros: { desde: '', hasta: '', estado: '' },
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const res = await comentariosRepository.list({ page: this.page, limite: this.limite, ...this.filtros })
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

    async setEstado(id, valor) { await comentariosRepository.setEstado(id, valor); return this.load() },
  },
})
