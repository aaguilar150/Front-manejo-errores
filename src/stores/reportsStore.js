import { defineStore } from 'pinia'
import { reportsRepository } from '@/data/repositories/reportsRepository'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    items: [],
    stats: { total: 0, atendidos: 0, pendientes: 0 },
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        this.items = await reportsRepository.list()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async fetchStats() {
      try {
        this.stats = await reportsRepository.stats()
      } catch (e) {
        this.error = e.message
      }
    },
    async update(id, data) {
      const updated = await reportsRepository.update(id, data)
      const idx = this.items.findIndex((r) => r.id === id)
      if (idx !== -1) this.items[idx] = updated
      await this.fetchStats()
    },
    async remove(id) {
      await reportsRepository.remove(id)
      this.items = this.items.filter((r) => r.id !== id)
      await this.fetchStats()
    },
  },
})
