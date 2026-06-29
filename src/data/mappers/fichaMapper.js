import { mediaUrl } from '@/core/media'

// Ficha de trazabilidad: historial de avistamientos + búsqueda inversa por cédula.
export function mapEvento(e) {
  return {
    id: e.id,
    personId: e.person_id,
    refugio: e.refugio || '',
    ubicacion: e.ubicacion || '',
    encontradoPor: e.encontrado_por || '',
    telefonoResponsable: e.telefono_responsable || '',
    nota: e.nota || '',
    fecha: (e.created_at || '').replace('T', ' ').slice(0, 16),
  }
}

export function mapFamiliar(f) {
  return {
    id: f.person_id,
    nombre: f.familiar_nombre || '',
    telefono: f.familiar_telefono || '',
    imagen: mediaUrl(f.image_url || ''),
    coincidencia: f.coincidencia ?? null,
    confianza: f.confianza || '',
    esMenor: !!f.es_menor,
  }
}

// GET /admin/personas/{id}/historial
export function mapHistorial(r) {
  return {
    personId: r.person_id,
    totalEventos: r.total_eventos ?? (r.eventos?.length || 0),
    eventos: (r.eventos || []).map(mapEvento),
  }
}

// GET /admin/personas/{id}/coincidencias
export function mapCoincidencias(r) {
  return {
    personId: r.person_id,
    docNumero: r.doc_numero || '',
    familiares: (r.familiares_buscando || []).map(mapFamiliar),
    totalEventos: r.total_eventos ?? (r.eventos?.length || 0),
    eventos: (r.eventos || []).map(mapEvento),
  }
}
