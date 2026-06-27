// ponytail: mock backend en memoria. Borra este archivo y pon VITE_USE_MOCK=false
// cuando conectes la API real; httpClient ya hace fetch a los endpoints de verdad.
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const users = [
  { email: 'admin@demo.com', password: '123456', role: 'admin', name: 'Admin' },
  { email: 'gestor@demo.com', password: '123456', role: 'gestor', name: 'Gestor' },
  { email: 'revisor@demo.com', password: '123456', role: 'revisor', name: 'Revisor' },
]

// Publicaciones de personas desaparecidas.
// motivos válidos: 'Contenido inadecuado' | 'Informacion falsa' | 'Violencia'
let reports = [
  { id: 1, publicacionId: 'PUB-1042', nombre: 'María', apellido: 'González', ubicacion: 'Guadalajara, Jalisco', motivo: 'Informacion falsa', usuario: 'user_12', estado: 'pendiente', fecha: '2026-06-20', descripcion: 'La publicación usa datos de contacto que no corresponden a la familia.', imagen: 'https://picsum.photos/seed/rep1/900/600' },
  { id: 2, publicacionId: 'PUB-1043', nombre: 'José', apellido: 'Ramírez', ubicacion: 'Monterrey, Nuevo León', motivo: 'Contenido inadecuado', usuario: 'user_88', estado: 'atendido', fecha: '2026-06-19', descripcion: 'Comentarios ofensivos hacia la persona reportada.', imagen: 'https://picsum.photos/seed/rep2/900/600' },
  { id: 3, publicacionId: 'PUB-1044', nombre: 'Lucía', apellido: 'Hernández', ubicacion: 'Puebla, Puebla', motivo: 'Violencia', usuario: 'user_45', estado: 'pendiente', fecha: '2026-06-22', descripcion: 'La imagen muestra contenido violento sin advertencia.', imagen: 'https://picsum.photos/seed/rep3/900/600' },
  { id: 4, publicacionId: 'PUB-1045', nombre: 'Carlos', apellido: 'Méndez', ubicacion: 'Mérida, Yucatán', motivo: 'Informacion falsa', usuario: 'user_03', estado: 'atendido', fecha: '2026-06-18', descripcion: 'Se difunde información no verificada sobre el paradero.', imagen: 'https://picsum.photos/seed/rep4/900/600' },
  { id: 5, publicacionId: 'PUB-1046', nombre: 'Ana', apellido: 'Torres', ubicacion: 'Tijuana, Baja California', motivo: 'Contenido inadecuado', usuario: 'user_67', estado: 'pendiente', fecha: '2026-06-23', descripcion: 'La publicación incluye contenido no apto.', imagen: 'https://picsum.photos/seed/rep5/900/600' },
]
let nextId = 6

export async function mockHandle(method, path, body) {
  await delay()

  if (method === 'POST' && path === '/auth/login') {
    const u = users.find((x) => x.email === body.email && x.password === body.password)
    if (!u) throw new Error('Credenciales inválidas')
    return { token: `mock-token-${u.role}`, user: { email: u.email, role: u.role, name: u.name } }
  }

  if (method === 'GET' && path === '/reports') return [...reports]

  if (method === 'GET' && path === '/reports/stats') {
    return {
      total: reports.length,
      atendidos: reports.filter((r) => r.estado === 'atendido').length,
      pendientes: reports.filter((r) => r.estado === 'pendiente').length,
    }
  }

  const idMatch = path.match(/^\/reports\/(\d+)$/)
  if (idMatch) {
    const id = Number(idMatch[1])
    const idx = reports.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Reporte no encontrado')
    if (method === 'PUT') {
      reports[idx] = { ...reports[idx], ...body }
      return reports[idx]
    }
    if (method === 'DELETE') {
      reports.splice(idx, 1)
      return null
    }
  }

  if (method === 'POST' && path === '/users') {
    if (users.some((u) => u.email === body.email)) throw new Error('El correo ya existe')
    const u = { email: body.email, password: body.password, role: body.role || 'revisor', name: body.email.split('@')[0] }
    users.push(u)
    return { email: u.email, role: u.role, name: u.name }
  }

  throw new Error(`Mock sin ruta: ${method} ${path}`)
}
