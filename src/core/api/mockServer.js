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

  // ---- /admin/personas ----
  if (method === 'GET' && p === '/admin/personas') {
    const estado = sp.get('estado')
    const moderacion = sp.get('moderacion')
    const limite = Number(sp.get('limite')) || 100
    return personas
      .filter((x) => !estado || x.estado === estado)
      .filter((x) => !moderacion || x.moderacion === moderacion)
      .slice(0, limite)
  }
  let m = p.match(/^\/admin\/personas\/([^/]+)\/moderacion$/)
  if (m && method === 'PATCH') {
    const i = findPersona(decodeURIComponent(m[1]))
    personas[i].moderacion = sp.get('valor')
    return `Moderación actualizada a ${personas[i].moderacion}`
  }
  m = p.match(/^\/admin\/personas\/([^/]+)$/)
  if (m && method === 'DELETE') {
    const i = findPersona(decodeURIComponent(m[1]))
    const id = personas[i].person_id
    personas.splice(i, 1)
    return `Persona ${id} eliminada`
  }

  // ---- /admin/reportes ----
  if (method === 'GET' && p === '/admin/reportes') {
    const tipo = sp.get('tipo')
    const estado = sp.get('estado')
    const limite = Number(sp.get('limite')) || 100
    return reportes
      .filter((x) => !tipo || x.tipo === tipo)
      .filter((x) => !estado || x.estado === estado)
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)) // más reciente primero
      .slice(0, limite)
  }
  m = p.match(/^\/admin\/reportes\/([^/]+)\/estado$/)
  if (m && method === 'PATCH') {
    const i = findReporte(decodeURIComponent(m[1]))
    reportes[i].estado = sp.get('valor')
    return `Estado actualizado a ${reportes[i].estado}`
  }

  if (method === 'POST' && p === '/buscar') return [] // sin UI por ahora

  throw new Error(`Mock sin ruta: ${method} ${p}`)
}
