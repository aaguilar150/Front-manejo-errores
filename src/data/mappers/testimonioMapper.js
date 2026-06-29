import { mediaUrl } from '@/core/media'

// back (GET /admin/testimonios) -> shape estable del front.
export function mapTestimonio(r) {
  return {
    id: r.id,
    personId: r.person_id || null,
    tipo: r.tipo || '', // imagen | video | ...
    archivoUrl: mediaUrl(r.archivo_url || ''),
    mime: r.mime || '',
    bytes: r.bytes ?? 0,
    mensaje: r.mensaje || '',
    nombreTestigo: r.nombre_testigo || '',
    contactoTestigo: r.contacto_testigo || '',
    estado: r.estado || '', // pendiente | aprobada | rechazada
    fecha: (r.created_at || '').slice(0, 10),
    pubNombre: r.pub_nombre || '',
    pubEstado: r.pub_estado || '',
    pubImagen: mediaUrl(r.pub_image_url || ''),
  }
}
