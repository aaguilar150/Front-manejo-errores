import { mediaUrl } from '@/core/media'

// back (Swagger /admin/reportes) -> shape estable del front.
export function mapReporte(r) {
  return {
    id: r.id,
    tipo: r.tipo, // falla | publicacion
    descripcion: r.descripcion || '',
    estado: r.estado || '', // pendiente | revisado | resuelto | descartado
    personId: r.person_id || null,
    url: r.url || '',
    contacto: r.contacto || '',
    fechaCreacion: (r.created_at || '').slice(0, 10),
    // contexto de la publicación reportada (solo tipo 'publicacion')
    pubNombre: r.pub_nombre || '',
    pubEstado: r.pub_estado || '',
    pubImagen: mediaUrl(r.pub_image_url || ''),
    pubModeracion: r.pub_moderacion || '',
  }
}
