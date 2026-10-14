import axiosClient from '../api/axiosClient'

export { getErrorMessage } from '../api/errors'

// Acepta { configuracion: {...} } o el objeto plano
const normalizarRed = (data) => {
  const cfg = data?.configuracion ?? data ?? {}
  return {
    ssid: cfg.ssid ?? cfg.ssid_permitido ?? '',
    ip_permitida: cfg.ip_permitida ?? cfg.ip ?? '',
  }
}

export async function getConfiguracionRed() {
  const { data } = await axiosClient.get('/configuracion/red')
  return normalizarRed(data)
}

export async function actualizarConfiguracionRed({ ssid, ip_permitida }) {
  const { data } = await axiosClient.put('/configuracion/red', { ssid, ip_permitida })
  return normalizarRed(data)
}
