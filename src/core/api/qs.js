// Arma query string, descartando valores vacíos/null. '' y undefined se omiten.
export function qs(params = {}) {
  const pairs = Object.entries(params).filter(([, v]) => v !== '' && v != null)
  const s = new URLSearchParams(pairs).toString()
  return s ? `?${s}` : ''
}
