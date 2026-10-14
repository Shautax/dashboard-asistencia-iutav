import axiosClient from '../api/axiosClient'

// El backend filtra por rol: el coordinador de carrera solo recibe/gestiona materias de su carrera
export async function getProfesores() {
  const { data } = await axiosClient.get('/profesores')
  return data.profesores
}

export async function asignarMateria(profesorId, materiaId) {
  const { data } = await axiosClient.post('/profesores/asignar-materia', {
    profesor_id: profesorId,
    materia_id: materiaId,
  })
  return data
}

export async function quitarMateria(profesorId, materiaId) {
  const { data } = await axiosClient.delete(`/profesores/${profesorId}/materias/${materiaId}`)
  return data
}
