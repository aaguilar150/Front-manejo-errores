import { mediaUrl } from '@/core/media'

// back (POST /buscar -> resultados de coincidencia facial) -> shape del front.
export function mapMatch(r) {
  return {
    id: r.person_id,
    nombre: r.nombre || '',
    apellido: r.apellido || '',
    edad: r.edad ?? '',
    esMenor: !!r.es_menor,
    estado: r.estado || '', // buscada | encontrada
    refugio: r.refugio || '',
    ubicacion: r.ubicacion || '',
    telefono: r.telefono || '',
    encontradoPor: r.encontrado_por || '',
    descripcion: r.descripcion || '',
    imagen: mediaUrl(r.image_url || ''),
    distancia: r.distancia ?? null,
    coincidencia: r.coincidencia ?? null, // %
    confianza: r.confianza || '', // alta | media | baja
  }
}
