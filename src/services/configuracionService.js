import axiosClient from '../api/axiosClient'

export { getErrorMessage } from '../api/errors'

// El backend responde { ok, red: { id, ssid_permitido, ip_permitida } }
const normalizarRed = (data) => ({
  ssid_permitido: data?.red?.ssid_permitido ?? '',
  ip_permitida: data?.red?.ip_permitida ?? '',
})

export async function getConfiguracionRed() {
  const { data } = await axiosClient.get('/configuracion/red')
  return normalizarRed(data)
}

// Cuerpo exacto que valida el backend: { ssid_permitido, ip_permitida }
export async function actualizarConfiguracionRed({ ssid_permitido, ip_permitida }) {
  const { data } = await axiosClient.put('/configuracion/red', { ssid_permitido, ip_permitida })
  return normalizarRed(data)
}
