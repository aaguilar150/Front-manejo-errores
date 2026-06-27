// Filtros y paginación del lado del cliente. El back de admin devuelve arrays
// (sin paginar ni buscar por nombre/edad), así que esto vive en el front.
const MENOR_EDAD = 18

export function filterPersonas(rows, { q = '', edad = '', menor = '' } = {}) {
  const term = q.toLowerCase().trim()
  return rows
    .filter((r) => !term || `${r.nombre} ${r.apellido}`.toLowerCase().includes(term))
    .filter((r) => edad === '' || edad == null || r.edad === Number(edad))
    .filter((r) => !menor || (menor === 'true' ? r.edad != null && r.edad < MENOR_EDAD : r.edad != null && r.edad >= MENOR_EDAD))
}

export function filterByDate(rows, { desde = '', hasta = '' } = {}, key = 'fechaCreacion') {
  return rows
    .filter((r) => !desde || r[key] >= desde)
    .filter((r) => !hasta || r[key] <= hasta)
}

export function paginate(rows, page = 1, limit = 10) {
  const p = Math.max(1, Number(page) || 1)
  const l = Math.max(1, Number(limit) || 10)
  const start = (p - 1) * l
  return { data: rows.slice(start, start + l), total: rows.length, page: p, limit: l }
}
