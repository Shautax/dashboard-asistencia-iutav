import axiosClient from '../api/axiosClient'

export { getErrorMessage } from '../api/errors'

// true si el sistema ya está "sellado" (existe al menos un coordinador master).
// Si la respuesta no es la de la API (ej. el HTML del hosting por una VITE_API_URL mal configurada)
// se lanza un error: Registro lo trata como sellado y no muestra el código de instalación.
export async function checkMaster() {
  const { data } = await axiosClient.get('/auth/check-master')
  if (typeof data?.hasMaster !== 'boolean') {
    throw new Error('Respuesta inesperada de /auth/check-master: revisa VITE_API_URL')
  }
  return data.hasMaster
}

// Registro del panel: sin master + código de instalación válido crea el primer master;
// en cualquier otro caso la cuenta queda como coordinador de carrera pendiente
export async function registrarEnPanel({ nombre, correo, password, codigoInstalacion }) {
  const { data } = await axiosClient.post('/auth/registro', {
    nombre,
    correo,
    password,
    ...(codigoInstalacion ? { codigo_autorizacion: codigoInstalacion } : {}),
  })
  return data.usuario
}
