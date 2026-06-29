// Filtros/paginación. La meta es que TODO lo haga el back (limite/offset + query).
// Mientras el back se actualiza: si una respuesta llega como array plano, el repo
// cae a filtrar/paginar en cliente; si llega { data, total }, confía en el server.
// Normaliza la respuesta de un listado. paged=true => el back ya paginó/filtró.
// Soporta envelope {data, meta:{total_records}} (paginado=true) y {data, total}.
export function unwrapList(res) {
  if (Array.isArray(res)) return { items: res, total: res.length, paged: false }
  const total = res?.meta?.total_records ?? res?.total ?? res?.data?.length ?? 0
  return { items: res?.data ?? [], total, paged: true }
}

// Fallback cliente para /admin/personas (mismos campos que la query del back).
export function filterPersonas(rows, { personId = '', nombre = '', apellido = '', esMenor = '', cedula = '', docNumero = '' } = {}) {
  const pid = personId.toLowerCase().trim()
  const n = nombre.toLowerCase().trim()
  const a = apellido.toLowerCase().trim()
  const doc = String(cedula || docNumero || '').toLowerCase().trim()
  return rows
    .filter((r) => !pid || (r.id || '').toLowerCase().includes(pid))
    .filter((r) => !n || (r.nombre || '').toLowerCase().includes(n))
    .filter((r) => !a || (r.apellido || '').toLowerCase().includes(a))
    .filter((r) => esMenor === '' || (esMenor === 'true' ? r.esMenor : !r.esMenor))
    .filter((r) => !doc || `${r.doc} ${r.codigo}`.toLowerCase().includes(doc))
}

export function filterByDate(rows, { desde = '', hasta = '' } = {}, key = 'fechaCreacion') {
  return rows
    .filter((r) => !desde || r[key] >= desde)
    .filter((r) => !hasta || r[key] <= hasta)
}

export function paginate(rows, page = 1, limite = 10) {
  const p = Math.max(1, Number(page) || 1)
  const l = Math.max(1, Number(limite) || 10)
  const start = (p - 1) * l
  return { data: rows.slice(start, start + l), total: rows.length, page: p, limite: l }
}
