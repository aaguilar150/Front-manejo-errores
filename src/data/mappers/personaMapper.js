import { mediaUrl } from '@/core/media'

// back (Swagger /admin/personas) -> shape estable del front.
export function mapPersona(r) {
  return {
    id: r.person_id,
    nombre: r.nombre,
    apellido: r.apellido,
    edad: r.edad === null || r.edad === undefined || r.edad === '' ? null : Number(r.edad),
    esMenor: !!r.es_menor,
    ubicacion: r.ubicacion || '',
    estado: r.estado || '', // buscada | encontrada
    moderacion: r.moderacion || '', // aprobada | rechazada | pendiente
    telefono: r.telefono || '',
    refugio: r.refugio || '',
    doc: r.doc || '',
    codigo: r.codigo || '',
    imagen: mediaUrl(r.fotos?.[0] || r.image_url || ''),
    fotos: (r.fotos || []).map(mediaUrl),
    fecha: (r.created_at || '').slice(0, 10),
    descripcion: r.descripcion || '',
  }
}
