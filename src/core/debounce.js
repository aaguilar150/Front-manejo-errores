// Agrupa llamadas rápidas (typing) en una sola tras `wait` ms de inactividad.
export function debounce(fn, wait = 350) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}
