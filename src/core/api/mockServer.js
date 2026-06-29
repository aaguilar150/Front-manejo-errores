// ponytail: mock que imita EL SWAGGER REAL (rutas, campos y formas idénticos).
// Pon VITE_USE_MOCK=false y la BASE_URL real cuando conectes; los repos/mappers
// ya esperan exactamente este shape, así que no cambia nada del front.
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const admins = [{ usuario: 'admin', password: 'reencuentros2026' }]

// --- datos deterministas (sin random) ---
const _nombres = ['María', 'José', 'Lucía', 'Carlos', 'Ana', 'Pedro', 'Sofía', 'Luis', 'Elena', 'Diego', 'Marta', 'Raúl', 'Paula', 'Iván', 'Nora']
const _apellidos = ['González', 'Ramírez', 'Hernández', 'Méndez', 'Torres', 'Cruz', 'Flores', 'Díaz', 'Vega', 'Castro', 'Romero', 'Núñez', 'Mora', 'Soto', 'León']
const _edades = [34, 16, 9, 41, 27, 15, 22, 8, 50, 17, 30, 12, 45, 19, 6]
const _ciudades = ['Guadalajara, Jalisco', 'Monterrey, Nuevo León', 'Puebla, Puebla', 'Mérida, Yucatán', 'Tijuana, Baja California']
const _moderaciones = ['aprobada', 'pendiente', 'aprobada', 'rechazada']

// Tabla personas (shape EXACTO del Swagger /admin/personas)
let personas = _nombres.map((nombre, i) => ({
  person_id: `p_${1000 + i}`,
  estado: i % 4 === 0 ? 'encontrada' : 'buscada',
  es_menor: _edades[i] < 18,
  nombre,
  apellido: _apellidos[i],
  edad: String(_edades[i]),
  doc: `DOC-${2000 + i}`,
  refugio: i % 3 === 0 ? 'Refugio Central' : '',
  ubicacion: _ciudades[i % _ciudades.length],
  telefono: `55-00-${1000 + i}`,
  codigo: `C${100 + i}`,
  moderacion: _moderaciones[i % _moderaciones.length],
  fotos: [`https://picsum.photos/seed/p${i}/900/600`],
  created_at: `2026-06-${String((i % 27) + 1).padStart(2, '0')}T10:00:00Z`,
}))

// Tabla reportes (shape EXACTO del Swagger /admin/reportes)
const _estReporte = ['pendiente', 'revisado', 'resuelto', 'descartado']
let reportes = [
  // tipo 'falla' (reportes del panel de errores)
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `r_f${i + 1}`,
    tipo: 'falla',
    descripcion: 'El botón de enviar no responde en la vista de detalle.',
    estado: _estReporte[i % _estReporte.length],
    person_id: null,
    url: `/detalle`,
    contacto: `${_nombres[i].toLowerCase()}@correo.com`,
    created_at: `2026-06-${String((i * 3 % 27) + 1).padStart(2, '0')}T12:00:00Z`,
    pub_nombre: null,
    pub_estado: null,
    pub_image_url: null,
    pub_moderacion: null,
  })),
  // tipo 'publicacion' (denuncias contra una publicación)
  ...[0, 2, 5, 7, 9, 11].map((src, i) => ({
    id: `r_p${i + 1}`,
    tipo: 'publicacion',
    descripcion: 'La publicación fue reportada como contenido inadecuado.',
    estado: _estReporte[i % _estReporte.length],
    person_id: `p_${1000 + src}`,
    url: `/persona/p_${1000 + src}`,
    contacto: `user_${src}@correo.com`,
    created_at: `2026-06-${String((src * 2 % 27) + 1).padStart(2, '0')}T09:00:00Z`,
    pub_nombre: `${_nombres[src]} ${_apellidos[src]}`,
    pub_estado: src % 4 === 0 ? 'encontrada' : 'buscada',
    pub_image_url: `https://picsum.photos/seed/p${src}/900/600`,
    pub_moderacion: _moderaciones[src % _moderaciones.length],
  })),
]

// Tabla testimonios (shape EXACTO del Swagger /admin/testimonios)
const _estTestimonio = ['pendiente', 'aprobada', 'rechazada']
let testimonios = [0, 3, 5, 8].map((src, i) => ({
  id: `t_${i + 1}`,
  person_id: `p_${1000 + src}`,
  tipo: i % 2 ? 'video' : 'imagen',
  archivo_url: `https://picsum.photos/seed/t${i}/600/400`,
  mime: i % 2 ? 'video/mp4' : 'image/jpeg',
  bytes: 123456 * (i + 1),
  mensaje: 'La vi cerca del refugio el martes por la tarde.',
  nombre_testigo: _nombres[src],
  contacto_testigo: `${_nombres[src].toLowerCase()}@correo.com`,
  estado: _estTestimonio[i % _estTestimonio.length],
  created_at: `2026-06-${String((src % 27) + 1).padStart(2, '0')}T11:00:00Z`,
  pub_nombre: `${_nombres[src]} ${_apellidos[src]}`,
  pub_estado: src % 4 === 0 ? 'encontrada' : 'buscada',
  pub_image_url: `https://picsum.photos/seed/p${src}/900/600`,
}))

// Avistamientos deterministas para historial/coincidencias.
function eventosDe(personId) {
  const seed = Number(personId.replace('p_', '')) || 0
  const n = (seed % 3) + 1
  return Array.from({ length: n }, (_, i) => ({
    id: `e_${personId}_${i}`,
    person_id: personId,
    refugio: i % 2 ? 'Refugio Central' : 'Refugio Norte',
    ubicacion: _ciudades[(seed + i) % _ciudades.length],
    encontrado_por: _nombres[(seed + i) % _nombres.length],
    telefono_responsable: `55-77-${1000 + seed + i}`,
    nota: 'Avistamiento confirmado por el responsable del refugio.',
    created_at: `2026-06-${String(((seed + i) % 27) + 1).padStart(2, '0')}T0${i}:30:00Z`,
  }))
}

function statsReales() {
  const pubs = reportes.filter((r) => r.tipo === 'publicacion')
  const fallas = reportes.filter((r) => r.tipo === 'falla')
  return {
    total: personas.length,
    buscadas: personas.filter((p) => p.estado === 'buscada').length,
    encontradas: personas.filter((p) => p.estado === 'encontrada').length,
    menores: personas.filter((p) => p.es_menor).length,
    ocultas: personas.filter((p) => p.moderacion === 'rechazada').length,
    pendientes_moderacion: personas.filter((p) => p.moderacion === 'pendiente').length,
    reportes_publicaciones: pubs.length,
    reportes_publicaciones_pendientes: pubs.filter((r) => r.estado === 'pendiente').length,
    reportes_fallas: fallas.length,
    reportes_fallas_pendientes: fallas.filter((r) => r.estado === 'pendiente').length,
    testimonios_pendientes: testimonios.filter((t) => t.estado === 'pendiente').length,
  }
}

// Aplica limite/offset y devuelve el contrato nuevo { data, total }.
function pageOf(rows, sp) {
  const total = rows.length
  const limite = Number(sp.get('limite'))
  const page = Number(sp.get('page'))
  // page (1-based) tiene prioridad; si no viene, se usa offset.
  const offset = page ? (page - 1) * limite : Number(sp.get('offset')) || 0
  const data = limite ? rows.slice(offset, offset + limite) : rows
  return { data, total }
}

function findPersona(id) {
  const i = personas.findIndex((p) => p.person_id === id)
  if (i === -1) throw new Error('Persona no encontrada')
  return i
}
function findReporte(id) {
  const i = reportes.findIndex((r) => r.id === id)
  if (i === -1) throw new Error('Reporte no encontrado')
  return i
}

export async function mockHandle(method, rawPath, body) {
  await delay()
  const url = new URL(rawPath, 'http://mock')
  const p = url.pathname
  const sp = url.searchParams

  if (method === 'POST' && p === '/admin/login') {
    const a = admins.find((x) => x.usuario === body.usuario && x.password === body.password)
    if (!a) throw new Error('Credenciales inválidas')
    return { token: `mock-token-${a.usuario}`, tipo: 'Bearer' }
  }

  // ---- /admin/stats ---- (conteos reales)
  if (method === 'GET' && p === '/admin/stats') return statsReales()

  // ---- /admin/personas ---- (contrato nuevo: limite/offset + filtros -> {data,total})
  if (method === 'GET' && p === '/admin/personas') {
    const estado = sp.get('estado')
    const moderacion = sp.get('moderacion')
    const personId = (sp.get('person_id') || '').toLowerCase().trim()
    const nombre = (sp.get('nombre') || '').toLowerCase().trim()
    const apellido = (sp.get('apellido') || '').toLowerCase().trim()
    const esMenor = sp.get('es_menor')
    const doc = (sp.get('cedula') || sp.get('doc_numero') || '').toLowerCase().trim()
    const rows = personas
      .filter((x) => !estado || x.estado === estado)
      .filter((x) => !moderacion || x.moderacion === moderacion)
      .filter((x) => !personId || x.person_id.toLowerCase().includes(personId))
      .filter((x) => !nombre || x.nombre.toLowerCase().includes(nombre))
      .filter((x) => !apellido || x.apellido.toLowerCase().includes(apellido))
      .filter((x) => esMenor == null || esMenor === '' || (esMenor === 'true' ? x.es_menor : !x.es_menor))
      .filter((x) => !doc || `${x.doc} ${x.codigo}`.toLowerCase().includes(doc))
    return pageOf(rows, sp)
  }
  let m = p.match(/^\/admin\/personas\/([^/]+)\/moderacion$/)
  if (m && method === 'PATCH') {
    const i = findPersona(decodeURIComponent(m[1]))
    personas[i].moderacion = sp.get('valor')
    return `Moderación actualizada a ${personas[i].moderacion}`
  }
  m = p.match(/^\/admin\/personas\/([^/]+)\/historial$/)
  if (m && method === 'GET') {
    const id = decodeURIComponent(m[1])
    findPersona(id)
    const eventos = eventosDe(id)
    return { person_id: id, total_eventos: eventos.length, eventos }
  }
  m = p.match(/^\/admin\/personas\/([^/]+)\/coincidencias$/)
  if (m && method === 'GET') {
    const id = decodeURIComponent(m[1])
    const per = personas[findPersona(id)]
    const familiares = personas
      .filter((x) => x.estado === 'buscada' && x.person_id !== id)
      .slice(0, 2)
      .map((x, k) => ({
        person_id: x.person_id,
        familiar_nombre: `${x.nombre} ${x.apellido}`,
        familiar_telefono: x.telefono,
        image_url: x.fotos[0],
        coincidencia: 90 - k * 12,
        confianza: k ? 'media' : 'alta',
        es_menor: x.es_menor,
      }))
    const eventos = eventosDe(id)
    return { person_id: id, doc_numero: per.doc, familiares_buscando: familiares, total_eventos: eventos.length, eventos }
  }
  m = p.match(/^\/admin\/personas\/([^/]+)$/)
  if (m && method === 'DELETE') {
    const i = findPersona(decodeURIComponent(m[1]))
    const id = personas[i].person_id
    personas.splice(i, 1)
    return `Persona ${id} eliminada`
  }

  // ---- /admin/reportes ---- (contrato nuevo: limite/offset + filtros -> {data,total})
  if (method === 'GET' && p === '/admin/reportes') {
    const tipo = sp.get('tipo')
    const estado = sp.get('estado')
    const q = (sp.get('q') || '').toLowerCase().trim()
    const desde = sp.get('desde')
    const hasta = sp.get('hasta')
    const rows = reportes
      .filter((x) => !tipo || x.tipo === tipo)
      .filter((x) => !estado || x.estado === estado)
      .filter((x) => !q || (x.pub_nombre || '').toLowerCase().includes(q))
      .filter((x) => !desde || (x.created_at || '').slice(0, 10) >= desde)
      .filter((x) => !hasta || (x.created_at || '').slice(0, 10) <= hasta)
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)) // más reciente primero
    return pageOf(rows, sp)
  }
  m = p.match(/^\/admin\/reportes\/([^/]+)\/estado$/)
  if (m && method === 'PATCH') {
    const i = findReporte(decodeURIComponent(m[1]))
    reportes[i].estado = sp.get('valor')
    return `Estado actualizado a ${reportes[i].estado}`
  }

  // ---- /admin/testimonios ----
  if (method === 'GET' && p === '/admin/testimonios') {
    const estado = sp.get('estado')
    const limite = Number(sp.get('limite')) || 100
    return testimonios.filter((t) => !estado || t.estado === estado).slice(0, limite)
  }
  m = p.match(/^\/admin\/testimonios\/([^/]+)\/estado$/)
  if (m && method === 'PATCH') {
    const id = decodeURIComponent(m[1])
    const i = testimonios.findIndex((t) => t.id === id)
    if (i === -1) throw new Error('Testimonio no encontrado')
    testimonios[i].estado = sp.get('valor')
    return `Estado actualizado a ${testimonios[i].estado}`
  }
  m = p.match(/^\/admin\/testimonios\/([^/]+)$/)
  if (m && method === 'DELETE') {
    const id = decodeURIComponent(m[1])
    const i = testimonios.findIndex((t) => t.id === id)
    if (i === -1) throw new Error('Testimonio no encontrado')
    testimonios.splice(i, 1)
    return `Testimonio ${id} eliminado`
  }

  // ---- /buscar (multipart) ---- compara foto vs base; devuelve coincidencias.
  if (method === 'POST' && p === '/buscar') {
    const limite = Number(body?.get?.('limite')) || 10
    const estado = body?.get?.('estado') || ''
    return personas
      .filter((x) => !estado || x.estado === estado)
      .slice(0, limite)
      .map((x, i) => ({
        person_id: x.person_id,
        estado: x.estado,
        es_menor: x.es_menor,
        nombre: x.nombre,
        apellido: x.apellido,
        edad: x.edad,
        refugio: x.refugio,
        ubicacion: x.ubicacion,
        telefono: x.telefono,
        encontrado_por: _nombres[i % _nombres.length],
        descripcion: 'Coincidencia facial generada por el mock.',
        image_url: x.fotos[0],
        distancia: Number((0.2 + i * 0.05).toFixed(2)),
        coincidencia: Math.max(50, 98 - i * 7),
        confianza: i < 2 ? 'alta' : i < 4 ? 'media' : 'baja',
      }))
  }

  throw new Error(`Mock sin ruta: ${method} ${p}`)
}
