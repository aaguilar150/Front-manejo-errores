import { defineStore } from 'pinia'
import { registrosRepository } from '@/data/repositories/registrosRepository'

// Sección A — registros (personas). Estado de tabla + acciones de moderación.
export const useRegistrosStore = defineStore('registros', {
  state: () => ({
    rows: [],
    total: 0,
    page: 1,
    limite: 10,
    loading: false,
    error: null,
    filtros: { personId: '', nombre: '', apellido: '', esMenor: '', cedula: '', docNumero: '', estado: '' },
    ficha: null, // { docNumero, familiares[], eventos[] }
    fichaLoading: false,
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const res = await registrosRepository.list({ page: this.page, limite: this.limite, ...this.filtros })
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

    async moderar(id, valor) { await registrosRepository.moderar(id, valor); return this.load() },
    async ocultar(id) { await registrosRepository.ocultar(id); return this.load() },
    async remove(id) { await registrosRepository.remove(id); return this.load() },

    // Ficha: coincidencias (familiares buscando, por cédula) + historial de avistamientos.
    async fetchFicha(id) {
      this.ficha = null
      this.fichaLoading = true
      try {
        const [coincidencias, historial] = await Promise.all([
          registrosRepository.coincidencias(id),
          registrosRepository.historial(id),
        ])
        this.ficha = {
          docNumero: coincidencias.docNumero,
          familiares: coincidencias.familiares,
          eventos: historial.eventos,
          totalEventos: historial.totalEventos,
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.fichaLoading = false
      }
    },
    clearFicha() { this.ficha = null },
  },
})
