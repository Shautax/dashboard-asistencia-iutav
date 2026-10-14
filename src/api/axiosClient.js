import axios from 'axios'
import { getToken } from '../auth/session'

// VITE_API_URL se fija en el build (Netlify: Site configuration > Environment variables).
// Acepta la URL con o sin /api y con o sin https:// (sin protocolo el navegador la trataría como
// una ruta del propio sitio). Sin ella solo se usa localhost en desarrollo; en producción
// fallaría en silencio, por eso se avisa.
let apiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : ''))
  .trim()
  .replace(/\/+$/, '')
if (apiUrl && !/^https?:\/\//i.test(apiUrl)) apiUrl = `https://${apiUrl}`
if (!apiUrl) console.error('Falta la variable VITE_API_URL: el panel no puede conectarse con la API.')

const axiosClient = axios.create({
  baseURL: apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

axiosClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosClient
