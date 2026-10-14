import axiosClient from '../api/axiosClient'

export async function getEstadisticas() {
  const { data } = await axiosClient.get('/dashboard/estadisticas')
  return data
}

export async function getCarreras() {
  const { data } = await axiosClient.get('/dashboard/carreras')
  return data.carreras
}

export async function getMateriasCarrera(carreraId) {
  const { data } = await axiosClient.get(`/dashboard/carreras/${carreraId}/materias`)
  return data.materias
}

export async function getAlumnosGraves() {
  const { data } = await axiosClient.get('/dashboard/alumnos-graves')
  return data
}

export async function getAlumnos() {
  const { data } = await axiosClient.get('/dashboard/alumnos')
  return data
}
