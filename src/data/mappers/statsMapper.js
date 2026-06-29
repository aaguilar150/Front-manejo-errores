// back (GET /admin/stats) -> shape estable del front.
export function mapStats(r) {
  return {
    total: r.total ?? 0,
    buscadas: r.buscadas ?? 0,
    encontradas: r.encontradas ?? 0,
    menores: r.menores ?? 0,
    ocultas: r.ocultas ?? 0,
    pendientesModeracion: r.pendientes_moderacion ?? 0,
    reportesPublicaciones: r.reportes_publicaciones ?? 0,
    reportesPublicacionesPendientes: r.reportes_publicaciones_pendientes ?? 0,
    reportesFallas: r.reportes_fallas ?? 0,
    reportesFallasPendientes: r.reportes_fallas_pendientes ?? 0,
    testimoniosPendientes: r.testimonios_pendientes ?? 0,
  }
}
