import axiosClient from '../api/axiosClient'

export { getErrorMessage } from '../api/errors'

// El backend responde { ok, red: { id, latitud, longitud, radio_permitido } }
// Los valores se devuelven como texto para pintarlos directamente en los inputs
const normalizarRed = (data) => {
  const red = data?.red ?? data ?? {}
  return {
    latitud: red.latitud != null ? String(red.latitud) : '',
    longitud: red.longitud != null ? String(red.longitud) : '',
    radio_permitido: red.radio_permitido != null ? String(red.radio_permitido) : '50',
  }
}

export async function getConfiguracionRed() {
  const { data } = await axiosClient.get('/configuracion/red')
  return normalizarRed(data)
}

// Cuerpo exacto que valida el backend: { latitud, longitud, radio_permitido } (numéricos)
export async function actualizarConfiguracionRed({ latitud, longitud, radio_permitido }) {
  const { data } = await axiosClient.put('/configuracion/red', {
    latitud: parseFloat(latitud),
    longitud: parseFloat(longitud),
    radio_permitido: parseFloat(radio_permitido),
  })
  return normalizarRed(data)
}
