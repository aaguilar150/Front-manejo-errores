const BASE = import.meta.env.VITE_API_BASE_URL || ''
// Las fotos sirven en el ORIGIN (sin el /api de la API): symtechven.com/fotos/...
let ORIGIN = ''
try { ORIGIN = BASE ? new URL(BASE).origin : '' } catch { ORIGIN = '' }

// Fotos del back vienen relativas ("/fotos/personas/x.jpg"). Absolutas (http...)
// se dejan igual (p.ej. el mock con picsum).
export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}
