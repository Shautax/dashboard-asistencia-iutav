import axiosClient from '../api/axiosClient'

export { getErrorMessage } from '../api/errors'

export async function getCoordinadores() {
  const { data } = await axiosClient.get('/coordinadores')
  return data.coordinadores
}

export async function crearCoordinador(coordinador) {
  const { data } = await axiosClient.post('/coordinadores', coordinador)
  return data.coordinador
}

export async function getCatalogoCarreras() {
  const { data } = await axiosClient.get('/academico/carreras')
  return data.carreras
}

export async function getSolicitudes() {
  const { data } = await axiosClient.get('/coordinadores/solicitudes')
  return data.solicitudes
}

export async function aprobarSolicitud(id, carreraId) {
  const { data } = await axiosClient.put(`/coordinadores/solicitudes/${id}/aprobar`, { carrera_id: carreraId })
  return data
}

export async function rechazarSolicitud(id) {
  const { data } = await axiosClient.delete(`/coordinadores/solicitudes/${id}`)
  return data
}

export async function restablecerPassword(id, password) {
  const { data } = await axiosClient.put(`/coordinadores/${id}/password`, { password })
  return data
}
