import axios from 'axios'
import { mockHandle } from './mockServer'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

let authToken = null
export function setAuthToken(token) {
  authToken = token
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

// Mensaje de error legible desde la respuesta del back (detail/message/string).
function errMessage(error) {
  const d = error.response?.data
  if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg).join(', ')
  return d?.detail || d?.message || (typeof d === 'string' ? d : null) || error.message
}

async function request(method, path, body, opts = {}) {
  if (USE_MOCK) return mockHandle(method, path, body, authToken)
  try {
    // FormData: axios pone el Content-Type con boundary; no forzar JSON.
    const headers = opts.form ? { 'Content-Type': 'multipart/form-data' } : undefined
    const res = await api.request({ method, url: path, data: body, headers })
    return res.status === 204 ? null : res.data
  } catch (error) {
    throw new Error(errMessage(error))
  }
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  postForm: (path, formData) => request('POST', path, formData, { form: true }),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
